export type RuntimeConfig = {
  openaiApiKey: string;
  openaiModel: string;
  maxDiffChars: number;
  postComment: boolean;
  selectedReviewerIds: string[] | null;
  outputPath: string;
};

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "y", "on"].includes(value.toLowerCase());
}

function parseInteger(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getRuntimeConfig(args: Map<string, string | boolean>): RuntimeConfig {
  const openaiApiKey = optionalEnv("OPENAI_API_KEY");
  if (!openaiApiKey) {
    throw new Error("Missing OPENAI_API_KEY. Set it as a GitHub secret or local environment variable.");
  }

  const reviewersArg = args.get("reviewers");
  const reviewersEnv = optionalEnv("REVIEWERS");
  const reviewersRaw = typeof reviewersArg === "string" ? reviewersArg : reviewersEnv;

  return {
    openaiApiKey,
    openaiModel: optionalEnv("OPENAI_MODEL") ?? "gpt-5.4",
    maxDiffChars: parseInteger(optionalEnv("MAX_DIFF_CHARS"), 120_000),
    postComment: parseBoolean(optionalEnv("POST_COMMENT"), true) && args.get("no-post") !== true,
    selectedReviewerIds: reviewersRaw
      ? reviewersRaw
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : null,
    outputPath: typeof args.get("out") === "string" ? (args.get("out") as string) : ".react-ai-reviewer/result.md",
  };
}
