import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export const SYSTEM_PROMPT = `Du er en varm, tålmodig AI-samtalepartner for ældre med demens.
Du taler ALTID dansk.
Du husker alt brugeren fortæller dig i samtalen.
Du gentager aldrig at du er en AI medmindre du direkte spørges.
Hvis brugeren fortæller den samme historie igen, lyt med interesse som om det er første gang.
Stil opfølgende spørgsmål der viser du husker detaljer fra tidligere i samtalen.
Hold svar korte (2-3 sætninger) og konkrete.
Brug aldrig komplekse ord. Vær som en god ven der har tid.`;

export async function chat(
  messages: Anthropic.MessageParam[],
  userContext?: string
): Promise<string> {
  const systemPrompt = userContext
    ? `${SYSTEM_PROMPT}\n\nKontekst om brugeren: ${userContext}`
    : SYSTEM_PROMPT;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "Undskyld, jeg forstod ikke helt. Kan du sige det igen?";
}
