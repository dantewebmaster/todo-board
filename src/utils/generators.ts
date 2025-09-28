import { createHash } from "node:crypto";

export function generateTodoId(
  file: string,
  line: number,
  text: string,
): string {
  const h = createHash("sha1")
    .update(file)
    .update(":")
    .update(String(line))
    .update(":")
    .update(text.trim());

  return h.digest("hex").substring(0, 16);
}

export function generateNonce(): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * alphabet.length),
  );

  return randomValues.map((index) => alphabet[index] ?? "").join("");
}
