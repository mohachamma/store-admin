import "server-only";
import { mockApi } from "./mock";
import { realApi } from "./real";
import type { AdminApi } from "./types";

/** Mock when explicitly enabled or when no API URL is configured yet. */
export const usingMock = process.env.NEXT_PUBLIC_USE_MOCK === "true" || !process.env.NEXT_PUBLIC_API_URL;

export const api: AdminApi = usingMock ? mockApi : realApi;

export type * from "./types";
