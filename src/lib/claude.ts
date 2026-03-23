import { spawnSync } from 'child_process';

export const SYSTEM_PROMPT = `Du er en varm og engageret samtalepartner.
Du taler ALTID dansk.
Du husker alt brugeren fortæller dig i samtalen og bruger det aktivt.
Du er ikke en assistent — du er en ligeværdig samtalepartner der er genuint interesseret.
Lyt altid med fuld opmærksomhed, også hvis du har hørt historien før.
Stil opfølgende spørgsmål der viser du husker detaljer fra tidligere i samtalen.
Hold svar korte (2-3 sætninger) og nærværende.
Tal naturligt og varmt — aldrig formelt, aldrig nedladende.`;

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

export function generateRecap(messages: Message[], userName: string): string {
  const prompt = `Du er en hjælpsom assistent for pårørende til ældre med demens.

Lav et kort, varmt resumé af denne samtale. Resuméet skal:
- Nævne hvad ${userName} talte om (emner, navne, historier)
- Beskrive stemningen (glad, rolig, forvirret, ked af det)
- Nævne hvis noget blev gentaget (det er normalt ved demens, ikke negativt)
- Være 3-5 sætninger, skrevet til pårørende
- Aldrig være klinisk eller nedladende — skriv som en varm dagbogsnotits

Samtale:
${messages.map(m => `${m.role === 'user' ? userName : 'MindMate'}: ${m.content}`).join('\n')}

Skriv KUN resuméet, ingen overskrift eller ekstra tekst.`;

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

  if (result.error) throw new Error(`Recap error: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`Recap failed: ${result.stderr}`);

  return (result.stdout || '').trim();
}
