
export type result = { status: "success" | "error", recipe: {}, error: string };
export const resultSchema = { status: "string", recipe: "object", error: "string" };