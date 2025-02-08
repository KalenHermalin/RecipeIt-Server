
export type result = { status: "success" | "error", recipe: {}, error: string };
export const resultSchema = { status: "string", recipe: "object", error: "string" };
export interface downloadResult {
    status: "success" | "error";
    videoID?: string;
    source: string;
    error?: string;
};