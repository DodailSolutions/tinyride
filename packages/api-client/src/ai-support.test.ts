import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  processAIAssistantQuery,
  sanitizeUserPrompt,
  detectEscalation,
  getPermittedContext,
  checkRateLimit,
  resetRateLimitStore,
  enforceGroundTruthDefense,
  LLMProvider,
  LLMMessage,
  DeterministicFallbackProvider,
  adminMemoryStore,
} from './index';

describe('TinyRide AI-004 Customer Support Assistant', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  describe('1. Prompt Sanitization & Data Minimization', () => {
    it('redacts 16-digit credit/debit card numbers', () => {
      const input = 'My payment card 4111 2222 3333 4444 failed during checkout';
      const sanitized = sanitizeUserPrompt(input);
      expect(sanitized).not.toContain('4111 2222 3333 4444');
      expect(sanitized).toContain('[REDACTED_CARD_NUMBER]');
    });

    it('redacts 12-digit Aadhaar numbers', () => {
      const input = 'My driver Aadhaar is 5544 3322 1100, is it verified?';
      const sanitized = sanitizeUserPrompt(input);
      expect(sanitized).not.toContain('5544 3322 1100');
      expect(sanitized).toContain('[REDACTED_AADHAAR]');
    });

    it('redacts CVV/CVC codes', () => {
      const input = 'CVV: 892 entered on payment gateway';
      const sanitized = sanitizeUserPrompt(input);
      expect(sanitized).not.toContain('892');
      expect(sanitized).toContain('[REDACTED_CVV]');
    });

    it('truncates inputs exceeding 1000 characters', () => {
      const longText = 'A'.repeat(1500);
      const sanitized = sanitizeUserPrompt(longText);
      expect(sanitized.length).toBe(1000);
    });
  });

  describe('2. Authentication & Authorization Boundaries', () => {
    it('rejects queries with missing or invalid user ID', async () => {
      await expect(
        processAIAssistantQuery({
          user_id: '',
          user_role: 'parent',
          message: 'Hello',
        })
      ).rejects.toThrow();
    });

    it('rejects queries with invalid user role', async () => {
      await expect(
        processAIAssistantQuery({
          user_id: 'usr-123',
          user_role: 'super_hacker' as any,
          message: 'Hello',
        })
      ).rejects.toThrow();
    });

    it('retrieves only parent-scoped context and never leaks other parents data', async () => {
      const parentId = 'p1111111-1111-1111-1111-111111111111';
      const context = await getPermittedContext(parentId, 'parent');

      expect(context.user_id).toBe(parentId);
      expect(context.user_name).toBe('Ananya Sharma');
      expect(context.active_bookings.length).toBeGreaterThan(0);
      expect(context.active_bookings[0].child_name).toBe('Aarav Sharma');

      // Must not leak child data from other parents (e.g. Ananya Rao or Rohan Verma)
      const leakedOtherChild = context.active_bookings.find(
        (b) => b.child_name === 'Rohan Verma'
      );
      expect(leakedOtherChild).toBeUndefined();
    });
  });

  describe('3. Anti-Hallucination & Grounding Defense', () => {
    it('prevents false claims of successful payments if no payment exists in context', () => {
      const emptyContext = {
        user_id: 'p-new',
        user_role: 'parent' as const,
        user_name: 'New Parent',
        active_bookings: [],
        recent_payments: [],
        active_trip: null,
      };

      const hallucinatedLLMReply =
        'Yes, your payment of ₹3,500 was successfully received and captured!';
      const defended = enforceGroundTruthDefense(
        hallucinatedLLMReply,
        'Did my fee payment go through?',
        emptyContext
      );

      expect(defended).toContain('We do not have any recorded payment transactions');
      expect(defended).not.toContain('₹3,500 was successfully received');
    });

    it('prevents false claims of active vehicle arrival when no active trip exists', () => {
      const noTripContext = {
        user_id: 'p-new',
        user_role: 'parent' as const,
        user_name: 'New Parent',
        active_bookings: [],
        recent_payments: [],
        active_trip: null,
      };

      const hallucinatedLLMReply =
        'The vehicle has arrived at Stop 2 and is waiting for your child.';
      const defended = enforceGroundTruthDefense(
        hallucinatedLLMReply,
        'Where is my vehicle now?',
        noTripContext
      );

      expect(defended).toContain('There is currently no active trip recorded');
      expect(defended).not.toContain('arrived at Stop 2');
    });
  });

  describe('4. Human Escalation Triggers', () => {
    it('escalates emergency safety inquiries to URGENT priority and returns 24/7 hotline', async () => {
      const res = await processAIAssistantQuery({
        user_id: 'p1111111-1111-1111-1111-111111111111',
        user_role: 'parent',
        message: 'The school van had an accident near botanical garden! Child is injured!',
      });

      expect(res.escalated).toBe(true);
      expect(res.escalation_reason).toBe('EMERGENCY_SAFETY');
      expect(res.reply).toContain('+91 40 4567 8900');
      expect(res.reply).toContain('112');
      expect(res.ticket_id).toBeDefined();

      // Verify urgent ticket created in admin store
      const createdTicket = adminMemoryStore.tickets.find((t) => t.id === res.ticket_id);
      expect(createdTicket).toBeDefined();
      expect(createdTicket?.priority).toBe('URGENT');
    });

    it('escalates refund and payment disputes to HIGH priority with policy quote', async () => {
      const res = await processAIAssistantQuery({
        user_id: 'p1111111-1111-1111-1111-111111111111',
        user_role: 'parent',
        message: 'I want to dispute this double charge and demand immediate refund!',
      });

      expect(res.escalated).toBe(true);
      expect(res.escalation_reason).toBe('REFUND_DISPUTE');
      expect(res.reply).toContain('100%');
      expect(res.reply).toContain('5 business day');
      expect(res.ticket_id).toBeDefined();

      const createdTicket = adminMemoryStore.tickets.find((t) => t.id === res.ticket_id);
      expect(createdTicket?.priority).toBe('HIGH');
    });

    it('escalates requests to speak with a human agent', async () => {
      const res = await processAIAssistantQuery({
        user_id: 'p1111111-1111-1111-1111-111111111111',
        user_role: 'parent',
        message: 'I need to speak to human customer care executive right now',
      });

      expect(res.escalated).toBe(true);
      expect(res.escalation_reason).toBe('UNRESOLVED_AMBIGUITY');
      expect(res.ticket_id).toBeDefined();

      const createdTicket = adminMemoryStore.tickets.find((t) => t.id === res.ticket_id);
      expect(createdTicket?.priority).toBe('MEDIUM');
    });
  });

  describe('5. Rate Limiting (10 req / 60s sliding window)', () => {
    it('allows up to 10 requests and rejects the 11th with a rate limit message', async () => {
      const userId = 'rate-limit-test-user';

      for (let i = 0; i < 10; i++) {
        const check = checkRateLimit(userId);
        expect(check.allowed).toBe(true);
      }

      const blocked = checkRateLimit(userId);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

      const res = await processAIAssistantQuery({
        user_id: userId,
        user_role: 'parent',
        message: 'Are there seats available?',
      });

      expect(res.reply).toContain('maximum message rate limit');
      expect(res.provider_used).toBe('rate_limiter');
    });
  });

  describe('6. Deterministic Fallback on LLM Failure', () => {
    it('falls back to deterministic knowledge base when LLM provider throws error', async () => {
      const failingProvider: LLMProvider = {
        name: 'Failing Provider',
        generateCompletion: vi.fn().mockRejectedValue(new Error('503 Service Unavailable')),
      };

      const res = await processAIAssistantQuery(
        {
          user_id: 'p1111111-1111-1111-1111-111111111111',
          user_role: 'parent',
          message: 'What is the pricing for school transport?',
        },
        { provider: failingProvider, skipRateLimit: true }
      );

      expect(res.reply).toContain('₹2,500 and ₹4,500');
      expect(res.provider_used).toBe('deterministic_fallback');
    });

    it('answers school pilot questions accurately via fallback provider', async () => {
      const fallback = new DeterministicFallbackProvider();
      const messages: LLMMessage[] = [
        { role: 'user', content: 'Which pilot schools do you support?' },
      ];

      const res = await fallback.generateCompletion(messages);
      expect(res.content).toContain('Oakridge');
      expect(res.content).toContain('Delhi Public School');
      expect(res.content).toContain('CHIREC');
    });
  });

  describe('7. Security Audit Logging', () => {
    it('creates immutable audit logs for every query and escalation', async () => {
      const initialLogsCount = adminMemoryStore.auditLogs.length;

      await processAIAssistantQuery(
        {
          user_id: 'p1111111-1111-1111-1111-111111111111',
          user_role: 'parent',
          message: 'Can I change my pickup stop?',
        },
        { skipRateLimit: true }
      );

      expect(adminMemoryStore.auditLogs.length).toBeGreaterThan(initialLogsCount);
      const latestLog = adminMemoryStore.auditLogs[0];
      expect(latestLog.action).toBe('AI_ASSISTANT_QUERY');
      expect(latestLog.actorId).toBe('p1111111-1111-1111-1111-111111111111');
    });
  });
});
