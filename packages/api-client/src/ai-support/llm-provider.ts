/**
 * TinyRide AI-004 Provider-Independent LLM Interface
 * 
 * Supports:
 * - Google Gemini (gemini-1.5-flash)
 * - OpenAI-compatible endpoints (OpenAI, DeepSeek, Groq, Ollama)
 * - Deterministic fallback provider (zero external dependency, instant execution)
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface LLMCompletionResult {
  content: string;
  tokensUsed: number;
  provider: string;
  model: string;
}

export interface LLMProvider {
  readonly name: string;
  generateCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult>;
}

// ---------------------------------------------------------------------------
// 1. Google Gemini Provider
// ---------------------------------------------------------------------------

export class GeminiProvider implements LLMProvider {
  readonly name = 'Google Gemini';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCompletion(
    messages: LLMMessage[],
    options: LLMCompletionOptions = {}
  ): Promise<LLMCompletionResult> {
    const systemInstruction = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');

    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxTokens ?? 512,
        stopSequences: options.stopSequences,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API error [${res.status}]: ${errorText}`);
      }

      const data = await res.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ??
        'Sorry, I could not generate a response.';
      const tokens =
        (data.usageMetadata?.totalTokenCount as number) ||
        Math.ceil(text.length / 4);

      return {
        content: text.trim(),
        tokensUsed: tokens,
        provider: 'gemini',
        model: this.model,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. OpenAI-Compatible Provider
// ---------------------------------------------------------------------------

export class OpenAICompatibleProvider implements LLMProvider {
  readonly name = 'OpenAI Compatible';
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(
    apiKey: string,
    baseURL: string = 'https://api.openai.com/v1',
    model: string = 'gpt-4o-mini'
  ) {
    this.apiKey = apiKey;
    this.baseURL = baseURL.replace(/\/+$/, '');
    this.model = model;
  }

  async generateCompletion(
    messages: LLMMessage[],
    options: LLMCompletionOptions = {}
  ): Promise<LLMCompletionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens ?? 512,
          stop: options.stopSequences,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI API error [${res.status}]: ${errorText}`);
      }

      const data = await res.json();
      const content =
        data.choices?.[0]?.message?.content ??
        'Sorry, I could not generate a response.';
      const tokens =
        (data.usage?.total_tokens as number) || Math.ceil(content.length / 4);

      return {
        content: content.trim(),
        tokensUsed: tokens,
        provider: 'openai_compatible',
        model: this.model,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Deterministic Fallback Provider
// ---------------------------------------------------------------------------

export class DeterministicFallbackProvider implements LLMProvider {
  readonly name = 'Deterministic Fallback';

  async generateCompletion(
    messages: LLMMessage[],
    _options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    // Locate the latest user message
    const userMessages = messages.filter((m) => m.role === 'user');
    const latestUserMsg = userMessages[userMessages.length - 1]?.content.toLowerCase() || '';

    let reply =
      'Thank you for reaching out to TinyRide Customer Support. How can we help you coordinate school commute today?';

    if (latestUserMsg.includes('refund') || latestUserMsg.includes('cancellation')) {
      reply =
        'TinyRide Refund Policy: 100% full refund is provided if cancellation occurs before the 1st of the service month. Cancellations mid-month require a 5 business day written notice. Any refund dispute has been recorded and will be addressed by operations.';
    } else if (latestUserMsg.includes('pricing') || latestUserMsg.includes('fee') || latestUserMsg.includes('cost')) {
      reply =
        'TinyRide route subscriptions range between ₹2,500 and ₹4,500 per month depending on distance, vehicle category (Auto or Van), and school schedule. Payments are made monthly in advance with zero surge pricing.';
    } else if (latestUserMsg.includes('school') || latestUserMsg.includes('pilot')) {
      reply =
        'TinyRide pilot covers 5 premier schools in Western Hyderabad: Hyderabad Public School (Begumpet), Oakridge International (Gachibowli), Delhi Public School (Khajaguda), CHIREC International (Kondapur), and Glendale Academy (Sun City).';
    } else if (latestUserMsg.includes('driver') || latestUserMsg.includes('police') || latestUserMsg.includes('verification') || latestUserMsg.includes('kyc')) {
      reply =
        'All TinyRide drivers undergo strict mandatory physical verification in Telangana: valid commercial driving license & badge, Aadhaar KYC, police verification certificate, and annual vehicle fitness (RTA) checks.';
    } else if (latestUserMsg.includes('safety') || latestUserMsg.includes('accident') || latestUserMsg.includes('emergency')) {
      reply =
        'For any emergency or incident, our 24/7 Operations Command Center is available immediately at +91 40 4567 8900, or dial 112 for Telangana emergency services.';
    } else if (latestUserMsg.includes('auto') || latestUserMsg.includes('capacity') || latestUserMsg.includes('van')) {
      reply =
        'Under Telangana Motor Vehicles rules, TinyRide strictly enforces vehicle caps: Auto-rickshaws can seat a maximum of 4 to 6 children, and school vans can seat up to 12 to 14 children. Overcrowding is strictly prohibited.';
    }

    return {
      content: reply,
      tokensUsed: Math.ceil(reply.length / 4),
      provider: 'deterministic_fallback',
      model: 'tinyride-rules-v1',
    };
  }
}

// ---------------------------------------------------------------------------
// 4. Provider Factory
// ---------------------------------------------------------------------------

export function getLLMProvider(override?: LLMProvider): LLMProvider {
  if (override) {
    return override;
  }

  const geminiApiKey =
    typeof process !== 'undefined'
      ? process.env?.GEMINI_API_KEY || process.env?.GOOGLE_AI_API_KEY
      : undefined;
  if (geminiApiKey) {
    return new GeminiProvider(geminiApiKey);
  }

  const openaiApiKey =
    typeof process !== 'undefined' ? process.env?.OPENAI_API_KEY : undefined;
  if (openaiApiKey) {
    const baseURL = process.env?.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env?.OPENAI_MODEL || 'gpt-4o-mini';
    return new OpenAICompatibleProvider(openaiApiKey, baseURL, model);
  }

  return new DeterministicFallbackProvider();
}
