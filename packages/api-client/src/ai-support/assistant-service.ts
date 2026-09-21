/**
 * TinyRide AI-004 Customer Support Assistant Service
 *
 * Provides:
 * 1. Authenticated context retrieval strictly scoped to the caller's ID and role
 * 2. Sliding window rate limiter (10 requests / 60 seconds per user)
 * 3. Prompt data minimization and PII scrubbing (card numbers, Aadhaar, CVV)
 * 4. Human escalation for safety emergencies, payment disputes, and unresolved queries
 * 5. Anti-hallucination prompt construction and response grounding verification
 * 6. Deterministic fallback when LLM fails or is unavailable
 * 7. Immutable security audit logging
 */

import {
  UserRole,
  AIAssistantRequest,
  AIAssistantResponse,
  PermittedUserContext,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@tinyride/types';
import { aiAssistantRequestSchema } from '@tinyride/validation';
import {
  LLMProvider,
  LLMMessage,
  getLLMProvider,
  DeterministicFallbackProvider,
} from './llm-provider';
import { buildGroundTruthPrompt } from './knowledge-base';
import { adminMemoryStore, writeAdminAuditLog } from '../admin-api';

// ============================================================================
// 1. RATE LIMITING (Sliding Window: 10 requests / 60 seconds)
// ============================================================================

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

export function checkRateLimit(userId: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  const timestamps = (rateLimitMap.get(userId) || []).filter((ts) => ts > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = timestamps[0] ?? now;
    const retryAfter = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return { allowed: true };
}

export function resetRateLimitStore(): void {
  rateLimitMap.clear();
}

// ============================================================================
// 2. PROMPT SANITIZATION & DATA MINIMIZATION
// ============================================================================

/**
 * Strips sensitive PII and financial credentials before sending to LLM:
 * - 13-16 digit payment card numbers
 * - 3-4 digit CVV/CVC codes
 * - 12-digit Indian Aadhaar numbers
 */
export function sanitizeUserPrompt(rawText: string): string {
  if (!rawText) return '';

  return rawText
    // Redact 13-19 digit card numbers (handles spaces & dashes)
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, '[REDACTED_CARD_NUMBER]')
    // Redact Aadhaar format (xxxx xxxx xxxx)
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[REDACTED_AADHAAR]')
    // Redact CVV / CVC
    .replace(/(?:cvv|cvc)\s*[:=]?\s*(\d{3,4})/gi, '[REDACTED_CVV]')
    // Truncate to maximum 1000 characters
    .slice(0, 1000);
}

// ============================================================================
// 3. AUTHENTICATED CONTEXT RETRIEVAL (STRICT USER SCOPE)
// ============================================================================

/**
 * Retrieves permitted context for a user.
 * Strictly scoped to the authenticated caller's user_id and role.
 * NEVER retrieves raw database credentials, tokens, or other users' private data.
 */
export async function getPermittedContext(
  userId: string,
  userRole: UserRole
): Promise<PermittedUserContext> {
  if (!userId || !userRole) {
    throw new Error('Unauthorized: missing caller credentials.');
  }

  // Find parent or driver record in memory store / mock db
  const parent = adminMemoryStore.parents.find((p) => p.id === userId);
  const driver = adminMemoryStore.drivers.find((d) => d.id === userId);

  let userName = 'TinyRide User';
  const activeBookings: PermittedUserContext['active_bookings'] = [];
  const recentPayments: PermittedUserContext['recent_payments'] = [];
  let activeTrip: PermittedUserContext['active_trip'] = null;

  if (userRole === 'parent') {
    if (parent) {
      userName = parent.fullName;
      for (const child of parent.children) {
        activeBookings.push({
          id: `book-${child.id}`,
          child_name: child.name,
          school_name: child.school,
          route_name: child.route,
          driver_name: 'Ramesh Goud',
          pickup_stop: 'Green Glen Gate 1',
          monthly_fee_inr: 3200,
          status: 'CONFIRMED',
        });
      }
    }

    // Recent payments for this parent
    const userPayments = adminMemoryStore.payments.filter((p) =>
      parent ? p.parentName.toLowerCase() === parent.fullName.toLowerCase() : false
    );
    for (const p of userPayments) {
      recentPayments.push({
        id: p.id,
        amount_inr: p.amountInr,
        status: p.status,
        method: p.paymentMethod,
        created_at: p.createdAt,
      });
    }

    // Check if there is an active trip on the parent's route
    if (parent && parent.children.length > 0) {
      activeTrip = {
        trip_id: 'trip-morning-active-01',
        route_name: 'Kondapur ➔ DPS Gachibowli',
        status: 'IN_PROGRESS',
        driver_name: 'Ramesh Goud (TS09UA1234)',
        current_milestone: 'Stop 2: Botanical Garden Junction',
        last_event_time: new Date().toISOString(),
      };
    }
  } else if (userRole === 'driver') {
    if (driver) {
      userName = driver.name;
      activeTrip = {
        trip_id: 'trip-driver-active-01',
        route_name: 'Kondapur ➔ DPS Gachibowli',
        status: 'IN_PROGRESS',
        driver_name: driver.name,
        current_milestone: 'Stop 2: Botanical Garden Junction',
        last_event_time: new Date().toISOString(),
      };
    }
  } else if (userRole === 'operations_admin' || userRole === 'super_admin') {
    userName = 'Operations Administrator';
  }

  return {
    user_id: userId,
    user_role: userRole,
    user_name: userName,
    active_bookings: activeBookings,
    recent_payments: recentPayments,
    active_trip: activeTrip,
  };
}

// ============================================================================
// 4. ESCALATION DETECTION & TICKET GENERATION
// ============================================================================

export interface EscalationResult {
  escalated: boolean;
  reason: 'EMERGENCY_SAFETY' | 'REFUND_DISPUTE' | 'UNRESOLVED_AMBIGUITY' | null;
  priority: SupportTicketPriority | null;
  ticketSubject: string | null;
}

const EMERGENCY_SAFETY_KEYWORDS = [
  'accident',
  'crash',
  'collision',
  'hospital',
  'emergency',
  'ambulance',
  'bleeding',
  'injury',
  'injured',
  'hurt',
  'missing child',
  'lost child',
  'kidnap',
  'vehicle broke down',
  'breakdown',
  'fire',
  'police',
  'danger',
];

const REFUND_DISPUTE_KEYWORDS = [
  'dispute',
  'chargeback',
  'fraud',
  'unauthorized transaction',
  'stolen card',
  'scam',
  'overcharged',
  'cheated',
  'refund rejected',
  'cancel subscription',
  'demand refund',
  'money deducted twice',
  'double charge',
];

const AMBIGUITY_KEYWORDS = [
  'talk to human',
  'speak to human',
  'speak with person',
  'human agent',
  'customer care executive',
  'call me back',
  'file formal complaint',
  'legal action',
  'court',
  'lawyer',
];

export function detectEscalation(message: string): EscalationResult {
  const lower = message.toLowerCase();

  for (const kw of EMERGENCY_SAFETY_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        escalated: true,
        reason: 'EMERGENCY_SAFETY',
        priority: 'URGENT',
        ticketSubject: `EMERGENCY SAFETY ALERT: ${message.slice(0, 60)}...`,
      };
    }
  }

  for (const kw of REFUND_DISPUTE_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        escalated: true,
        reason: 'REFUND_DISPUTE',
        priority: 'HIGH',
        ticketSubject: `PAYMENT & REFUND DISPUTE: ${message.slice(0, 60)}...`,
      };
    }
  }

  for (const kw of AMBIGUITY_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        escalated: true,
        reason: 'UNRESOLVED_AMBIGUITY',
        priority: 'MEDIUM',
        ticketSubject: `Support Escalation: ${message.slice(0, 60)}...`,
      };
    }
  }

  return {
    escalated: false,
    reason: null,
    priority: null,
    ticketSubject: null,
  };
}

/**
 * Creates an urgent or high-priority support ticket in the Operations queue.
 */
export async function createEscalatedSupportTicket(params: {
  userId: string;
  userRole: UserRole;
  userName: string;
  subject: string;
  description: string;
  priority: SupportTicketPriority;
}): Promise<string> {
  const ticketId = `tick-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  adminMemoryStore.tickets.unshift({
    id: ticketId,
    userRole: params.userRole,
    userName: params.userName,
    userPhone: '+91 98490 00000',
    subject: params.subject,
    description: params.description,
    status: 'OPEN' as SupportTicketStatus,
    priority: params.priority,
    assignedAgent: params.priority === 'URGENT' ? 'Emergency Response Team' : 'Operations Desk',
    createdAt: new Date().toISOString(),
  });

  return ticketId;
}

// ============================================================================
// 5. ANTI-HALLUCINATION DEFENSE & POST-PROCESSING
// ============================================================================

/**
 * Verifies that the model did not invent fake payments or trips if none exist in context.
 */
export function enforceGroundTruthDefense(
  reply: string,
  userMessage: string,
  context: PermittedUserContext
): string {
  const lowerMsg = userMessage.toLowerCase();

  // If user asks about their payment status
  if (lowerMsg.includes('payment') || lowerMsg.includes('paid') || lowerMsg.includes('fee')) {
    if (context.recent_payments.length === 0) {
      if (
        reply.toLowerCase().includes('success') ||
        reply.toLowerCase().includes('received') ||
        reply.toLowerCase().includes('captured')
      ) {
        return 'We do not have any recorded payment transactions for your account in the current billing cycle. You can complete payments or view receipts under the Billing tab in your app.';
      }
    }
  }

  // If user asks about their active ride/trip
  if (lowerMsg.includes('where is') || lowerMsg.includes('trip') || lowerMsg.includes('vehicle location') || lowerMsg.includes('arrived')) {
    if (!context.active_trip) {
      return 'There is currently no active trip recorded for your registered routes. Live tracking activates 15 minutes before the morning or afternoon pickup window.';
    }
  }

  return reply;
}

// ============================================================================
// 6. MAIN AI ASSISTANT QUERY HANDLER
// ============================================================================

export async function processAIAssistantQuery(
  rawRequest: AIAssistantRequest,
  options: {
    provider?: LLMProvider;
    skipRateLimit?: boolean;
  } = {}
): Promise<AIAssistantResponse> {
  const startTime = Date.now();

  // 1. Validate request
  const validated = aiAssistantRequestSchema.parse(rawRequest);

  // 2. Check Rate Limits
  if (!options.skipRateLimit) {
    const rateCheck = checkRateLimit(validated.user_id);
    if (!rateCheck.allowed) {
      return {
        reply: `You have reached the maximum message rate limit. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
        escalated: false,
        tokens_used: 0,
        grounded_facts_used: [],
        provider_used: 'rate_limiter',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 3. Sanitize User Input
  const sanitizedMsg = sanitizeUserPrompt(validated.message);

  // 4. Authenticated Scoped Context Retrieval
  const context = await getPermittedContext(validated.user_id, validated.user_role);

  // 5. Detect Escalation Needs
  const escalation = detectEscalation(sanitizedMsg);
  let ticketId: string | null = null;

  if (escalation.escalated && escalation.priority && escalation.ticketSubject) {
    ticketId = await createEscalatedSupportTicket({
      userId: validated.user_id,
      userRole: validated.user_role,
      userName: context.user_name,
      subject: escalation.ticketSubject,
      description: sanitizedMsg,
      priority: escalation.priority,
    });
  }

  // 6. If Emergency Safety, return immediate emergency hotline response
  if (escalation.reason === 'EMERGENCY_SAFETY') {
    const reply = `EMERGENCY ALERT LOGGED: Ticket #${ticketId}. Our 24/7 Operations Command Center has been notified. For immediate emergency assistance, please call our emergency hotline directly at +91 40 4567 8900 or dial 112 for police/ambulance services.`;

    await writeAdminAuditLog({
      actorId: validated.user_id,
      actorRole: validated.user_role,
      action: 'AI_ASSISTANT_EMERGENCY_ESCALATION',
      entityType: 'support_tickets',
      entityId: ticketId || 'unknown',
      metadata: { reason: escalation.reason, latencyMs: Date.now() - startTime },
    });

    return {
      reply,
      escalated: true,
      escalation_reason: 'EMERGENCY_SAFETY',
      ticket_id: ticketId,
      grounded_facts_used: ['faq-emergency-support'],
      provider_used: 'rule_engine',
      tokens_used: 45,
      timestamp: new Date().toISOString(),
    };
  }

  // 7. Assemble Grounded Messages for LLM
  const systemPrompt = buildGroundTruthPrompt(JSON.stringify(context, null, 2), validated.user_role);

  const messages: LLMMessage[] = [{ role: 'system', content: systemPrompt }];

  if (validated.conversation_history) {
    for (const hist of validated.conversation_history) {
      messages.push({
        role: hist.role,
        content: sanitizeUserPrompt(hist.content),
      });
    }
  }

  messages.push({ role: 'user', content: sanitizedMsg });

  // 8. Execute LLM with Fallback Guard
  const provider = getLLMProvider(options.provider);
  let replyText = '';
  let tokensUsed = 0;
  let providerUsed = provider.name;

  try {
    const result = await provider.generateCompletion(messages, {
      temperature: 0.1, // Low temperature for high precision & minimal hallucination
      maxTokens: 300,
    });
    replyText = result.content;
    tokensUsed = result.tokensUsed;
    providerUsed = result.provider;
  } catch (_err) {
    // Graceful fallback to deterministic provider on network or API failure
    const fallback = new DeterministicFallbackProvider();
    const fallbackResult = await fallback.generateCompletion(messages);
    replyText = fallbackResult.content;
    tokensUsed = fallbackResult.tokensUsed;
    providerUsed = 'deterministic_fallback';
  }

  // 9. Enforce Anti-Hallucination Grounding
  replyText = enforceGroundTruthDefense(replyText, sanitizedMsg, context);

  // If dispute occurred, append ticket acknowledgement
  if (escalation.reason === 'REFUND_DISPUTE' && ticketId) {
    replyText = `${replyText}\n\n[Support Ticket #${ticketId} created with High Priority. A billing specialist will contact you within 4 business hours.]`;
  } else if (escalation.reason === 'UNRESOLVED_AMBIGUITY' && ticketId) {
    replyText = `${replyText}\n\n[Support Ticket #${ticketId} created. An Operations representative will reach out to assist you directly.]`;
  }

  // 10. Audit Logging
  await writeAdminAuditLog({
    actorId: validated.user_id,
    actorRole: validated.user_role,
    action: 'AI_ASSISTANT_QUERY',
    entityType: 'ai_assistant',
    entityId: ticketId || 'query',
    metadata: {
      userRole: validated.user_role,
      escalated: escalation.escalated,
      escalationReason: escalation.reason,
      tokensUsed,
      provider: providerUsed,
      latencyMs: Date.now() - startTime,
    },
  });

  return {
    reply: replyText,
    escalated: escalation.escalated,
    escalation_reason: escalation.reason,
    ticket_id: ticketId,
    grounded_facts_used: ['faq-platform', 'faq-pricing-plans', 'faq-refund-policy', 'faq-vehicle-capacity'],
    provider_used: providerUsed,
    tokens_used: tokensUsed,
    timestamp: new Date().toISOString(),
  };
}
