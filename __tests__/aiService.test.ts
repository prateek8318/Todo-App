import { aiService, AI_CONFIG } from '../src/features/ai/services/aiService';

const globals = globalThis as typeof globalThis & { OPENAI_API_KEY?: string };
const originalKey = globals.OPENAI_API_KEY;
const originalConfiguredKey = AI_CONFIG.apiKey;
const originalFetch = globalThis.fetch;
const mockFetch = jest.fn();
const response = (body: unknown, ok = true) => ({ ok, json: async () => body });

beforeEach(() => {
  AI_CONFIG.apiKey = '';
  globals.OPENAI_API_KEY = 'test-key';
  globalThis.fetch = mockFetch;
  mockFetch.mockReset();
});

afterEach(() => {
  AI_CONFIG.apiKey = originalConfiguredKey;
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete globals.OPENAI_API_KEY;
  else globals.OPENAI_API_KEY = originalKey;
  jest.useRealTimers();
});

test('the environment configuration is used for AI requests', async () => {
  AI_CONFIG.apiKey = 'test-configured-key';
  mockFetch.mockResolvedValue(response({ choices: [{ message: { content: 'Ready.' } }] }));
  expect(aiService.isConfigured()).toBe(true);
  expect(await aiService.generateDailyInsight([])).toBe('Ready.');
  expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-configured-key' }) }));
});

test('missing API key uses fallbacks without sending an unauthorized request', async () => {
  delete globals.OPENAI_API_KEY;
  expect(await aiService.generateDailyInsight([])).toContain('Aaj ka din');
  expect(await aiService.generateFinancialAdvice(100, 20, 0)).toContain('available nahi');
  expect(await aiService.parseTaskFromText('Online class')).toBeNull();
  expect(mockFetch).not.toHaveBeenCalled();
});

test.each([null, {}, { error: { message: 'Invalid API key' } }, { choices: [] }, { choices: [null] }, { choices: [{ message: { content: null } }] }, { choices: [{ message: { content: 42 } }] }, { choices: [{ message: { content: '   ' } }] }])('unexpected response %j returns an insight fallback', async body => {
  mockFetch.mockResolvedValue(response(body));
  expect(await aiService.generateDailyInsight([])).toContain('Aaj ka din');
});

test('HTTP failure does not try to read choices or parse an error page', async () => {
  const json = jest.fn();
  mockFetch.mockResolvedValue({ ok: false, json });
  expect(await aiService.generateDailyInsight([])).toContain('Aaj ka din');
  expect(json).not.toHaveBeenCalled();
});

test('network and JSON failures return a fallback', async () => {
  mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));
  expect(await aiService.generateDailyInsight([])).toContain('Aaj ka din');
  mockFetch.mockResolvedValueOnce({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } });
  expect(await aiService.generateFinancialAdvice(100, 20, 0)).toContain('available nahi');
});

test('valid AI text is trimmed and returned', async () => {
  mockFetch.mockResolvedValue(response({ choices: [{ message: { content: '  Your next step.  ' } }] }));
  expect(await aiService.generateDailyInsight([])).toBe('Your next step.');
});

test('task parser accepts fenced JSON and drops invalid dates and priorities', async () => {
  mockFetch.mockResolvedValue(response({ choices: [{ message: { content: '```json\n{"title":" Class ","description":" Join on time ","priority":"urgent","dueAt":"not-a-date"}\n```' } }] }));
  expect(await aiService.parseTaskFromText('Class')).toEqual({ title: 'Class', description: 'Join on time', priority: 'medium', dueAt: undefined });
});

test.each(['null', '[]', '{"title":42}', '{"title":""}', 'not json'])('invalid task JSON %s cannot enter the task store', async content => {
  mockFetch.mockResolvedValue(response({ choices: [{ message: { content } }] }));
  expect(await aiService.parseTaskFromText('Class')).toBeNull();
});

test('a stalled request times out and returns a fallback', async () => {
  jest.useFakeTimers();
  mockFetch.mockImplementation((_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('Aborted')));
  }));
  const insight = aiService.generateDailyInsight([]);
  await jest.advanceTimersByTimeAsync(12000);
  expect(await insight).toContain('Aaj ka din');
});
