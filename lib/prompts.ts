export const prompts = [
  "My favorite thing about Archana is...",
  "I love when Archana...",
  "A core memory with Archana...",
  "Archana taught me...",
  "Something I wish for Archana...",
] as const;

export function getRandomPrompt() {
  return prompts[Math.floor(Math.random() * prompts.length)];
}
