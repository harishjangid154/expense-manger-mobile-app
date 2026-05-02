export type LifeTrackerEntityType = 'expense' | 'health' | 'goal';

export interface LifeTrackerParseResult {
  type: LifeTrackerEntityType;
  data: {
    amount?: number;
    category?: string;
    description?: string;
    [key: string]: unknown;
  };
}

const PARSER_API_URL = 'https://mock-api.example.com/life-tracker/parse';
const PARSER_PROMPT =
  'Convert user input into structured JSON for a life tracker app';

const parseInteger = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeResult = (value: unknown): LifeTrackerParseResult | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const candidate = value as {
    type?: unknown;
    data?: unknown;
  };

  if (
    candidate.type !== 'expense' &&
    candidate.type !== 'health' &&
    candidate.type !== 'goal'
  ) {
    return null;
  }

  if (
    !candidate.data ||
    typeof candidate.data !== 'object' ||
    Array.isArray(candidate.data)
  ) {
    return null;
  }

  return {
    type: candidate.type,
    data: candidate.data as LifeTrackerParseResult['data'],
  };
};

export const parseLocally = (input: string): LifeTrackerParseResult => {
  const lowerText = input.toLowerCase().trim();

  const expensePatterns = [
    /spent\s+(\d+)\s+on\s+(\w+)/i,
    /paid\s+(\d+)\s+for\s+(\w+)/i,
    /bought\s+(\w+)\s+for\s+\$?(\d+)/i,
    /(\d+)\s+rupees?\s*on\s+(\w+)/i,
  ];

  const healthPatterns = [
    /did\s+(\d+)\s+(pushups|squats|jumps|running|walking|cycling)/i,
    /(\d+)\s+(pushups|squats|jumps|running|walking|cycling)/i,
    /walked\s+(\d+)\s+steps/i,
    /ran\s+(\d+)\s+(km|miles)/i,
  ];

  const goalPatterns = [
    /set\s+goal\s+to\s+(.+)/i,
    /aim\s+to\s+(.+)/i,
    /target\s+(.+)/i,
    /want\s+to\s+(.+)/i,
    /reach\s+(.+)/i,
  ];

  for (const pattern of expensePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const amount = parseInteger(match[1] ?? match[2]);
      const category = match[2] ?? match[1];

      return {
        type: 'expense',
        data: {
          amount,
          category,
          description: `Spent ${amount ?? ''} on ${category}`.trim(),
        },
      };
    }
  }

  for (const pattern of healthPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const amount = parseInteger(match[1]);
      const category = match[2] ?? 'activity';

      return {
        type: 'health',
        data: {
          amount,
          category,
          description: `Did ${amount ?? ''} ${category}`.trim(),
        },
      };
    }
  }

  for (const pattern of goalPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      return {
        type: 'goal',
        data: {
          description: match[1],
        },
      };
    }
  }

  return {
    type: 'expense',
    data: {
      description: input,
    },
  };
};

const callParserApi = async (
  input: string,
): Promise<LifeTrackerParseResult | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(PARSER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: PARSER_PROMPT,
        input,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;

    const directResult = normalizeResult(payload);
    if (directResult) {
      return directResult;
    }

    if (
      payload &&
      typeof payload === 'object' &&
      !Array.isArray(payload) &&
      'result' in payload
    ) {
      return normalizeResult((payload as { result?: unknown }).result);
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export const parseWithAI = async (
  input: string,
): Promise<LifeTrackerParseResult> => {
  const aiResult = await callParserApi(input);
  if (aiResult) {
    return aiResult;
  }

  return parseLocally(input);
};

export { PARSER_API_URL, PARSER_PROMPT };
