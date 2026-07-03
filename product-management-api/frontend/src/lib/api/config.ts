/** API mode and base URL — set VITE_USE_MOCK_API=false to call the Spring Boot backend. */
export const apiConfig = {
  /** When true (default), uses localStorage mock data. Set to false to hit the real API. */
  useMock: import.meta.env.VITE_USE_MOCK_API !== "false",
  /** Base URL for REST calls. Empty string uses same-origin (Vite dev proxy in development). */
  baseUrl: (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, ""),
};

export const TOKEN_KEY = "nimbus.token.v1";
