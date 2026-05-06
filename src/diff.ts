const REVIEWABLE_SOURCE_FILE_PATTERN = /\.(tsx|ts|jsx|js)$/;
const RELEVANT_CONFIG_FILE_PATTERN =
  /(^|\/)(package\.json|tsconfig\.json|eslint\.config\..*|\.eslintrc.*|vite\.config\..*|next\.config\..*)$/;

export function isReviewableFilePath(filePath: string): boolean {
  return (
    !filePath.includes("node_modules/") &&
    !filePath.endsWith(".snap") &&
    !filePath.endsWith(".lock") &&
    (REVIEWABLE_SOURCE_FILE_PATTERN.test(filePath) || RELEVANT_CONFIG_FILE_PATTERN.test(filePath))
  );
}

export function extractChangedFilesFromDiff(diff: string): string[] {
  const changedFiles = new Set<string>();

  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith("FILE: ")) {
      const filePath = line.slice("FILE: ".length).trim();
      if (filePath.length > 0 && isReviewableFilePath(filePath)) {
        changedFiles.add(filePath);
      }
      continue;
    }

    if (line.startsWith("+++ b/")) {
      const filePath = line.slice("+++ b/".length).trim();
      if (filePath.length > 0 && isReviewableFilePath(filePath)) {
        changedFiles.add(filePath);
      }
    }
  }

  return Array.from(changedFiles);
}
