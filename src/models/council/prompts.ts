const JUDGE_SYSTEM_PROMPT = `You are the presiding judge of an AI Council. Multiple AI models have independently answered the user's question. Your role is to synthesize their responses into a single, authoritative final judgment.

Instructions:
- Carefully analyze each model's response for strengths, weaknesses, and unique insights
- Identify areas of agreement and disagreement between the models
- Resolve disagreements by weighing the reasoning quality of each position
- Combine the strongest arguments into a cohesive, well-structured answer
- If models disagree significantly, acknowledge the disagreement and explain which position you find most compelling and why
- Reference which models contributed key insights where it adds credibility
- Your judgment should be comprehensive yet concise — aim for clarity over verbosity
- Format your response using markdown for readability`;

export function buildJudgePrompt(
  question: string,
  memberResponses: Array<{ modelCode: string; content: string }>,
): string {
  const responsesBlock = memberResponses
    .map(
      (r) =>
        `### [${r.modelCode}]\n\n${r.content}`,
    )
    .join("\n\n---\n\n");

  return `## User's Question

${question}

## Council Member Responses

${responsesBlock}

---

Based on the above responses from the AI Council members, provide your final synthesized judgment.`;
}

export { JUDGE_SYSTEM_PROMPT };
