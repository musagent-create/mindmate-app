import { spawnSync } from 'child_process';

export const SYSTEM_PROMPT = `Du er en varm, tålmodig AI-samtalepartner for ældre med demens.
Du taler ALTID dansk.
Du husker alt brugeren fortæller dig i samtalen.
Du udgiver dig aldrig for at være menneskelig, medmindre du direkte spørges.
Hvis brugeren fortæller den samme historie igen, lyt med interesse som om det er første gang.
Stil opfølgende spørgsmål der viser du husker detaljer fra tidligere i samtalen.
Hold svar korte (2-3 sætninger) og konkrete.
Brug aldrig komplekse ord. Vær som en god ven der altid har tid.`;

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function askClaude(messages: Message[], userContext?: string): string {
  const systemPrompt = userContext
    ? `${SYSTEM_PROMPT}\n\nBrugerens kontekst (huskes altid):\n${userContext}`
    : SYSTEM_PROMPT;

  // Build conversation as text prompt for claude CLI
  const history = messages
    .map(m => `${m.role === 'user' ? 'Bruger' : 'Assistent'}: ${m.content}`)
    .join('\n');

  const prompt = `${systemPrompt}\n\nSamtalehistorik:\n${history}`;

  const result = spawnSync(
    '/Users/musagent/.local/bin/claude',
    ['--print', '--model', 'claude-sonnet-4-6'],
    {
      input: prompt,
      encoding: 'utf8',
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    }
  );

  if (result.error) throw new Error(`Claude CLI error: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Claude CLI exited ${result.status}: ${result.stderr}`);

  return (result.stdout || '').trim();
}
