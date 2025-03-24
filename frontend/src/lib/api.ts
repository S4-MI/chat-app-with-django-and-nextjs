import { cookies } from "next/headers";

type ApiRequestInit = RequestInit & {
    next?: NextFetchRequestConfig;
};

// API base URL - adjust this based on your environment configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Authenticated fetch function that:
 * 1. Automatically JSON stringifies the body when appropriate
 * 2. Adds authorization token from cookies if available
 * 3. Works with Next.js App Router cache options
 * 4. Handles both absolute and relative endpoint URLs
 */
async function apiFetch(endpoint: RequestInfo | URL, init?: ApiRequestInit): Promise<Response> {
    // Handle URL construction - support both absolute and relative URLs
    const url =
        typeof endpoint === "string" && !endpoint.startsWith("http")
            ? `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`
            : endpoint;

    // Initialize request options with defaults
    const options: ApiRequestInit = { ...init };

    // Set up headers if not provided
    options.headers = options.headers || {};
    const headers = new Headers(options.headers);

    // Handle body JSON stringification
    if (
        options.body &&
        typeof options.body === "object" &&
        !(options.body instanceof FormData) &&
        !(options.body instanceof URLSearchParams) &&
        !(options.body instanceof Blob) &&
        !(options.body instanceof ArrayBuffer)
    ) {
        options.body = JSON.stringify(options.body);

        // Set Content-Type to application/json if not already set
        if (!headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }
    }

    // Get token from cookies
    const token = cookies().get("token")?.value;

    // Add authorization header if token exists
    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Token ${token}`);
    }

    // Update options with processed headers
    options.headers = headers;

    // Make the fetch request
    return fetch(url, options);
}

/**
 * JSON fetch helper with authentication and error handling
 * Properly handles 204 No Content responses
 */
async function fetchJSON<T = any>(endpoint: RequestInfo | URL, init?: ApiRequestInit): Promise<T> {
    const response = await apiFetch(endpoint, init);

    // Handle error responses
    if (!response.ok) {
        if (response.status === 401) {
            // Clear the token cookie on unauthorized
            cookies().delete("token");
        }

        let errorData: any = {};
        try {
            errorData = await response.json();
        } catch (e) {
            // If response can't be parsed as JSON, use statusText
        }

        const error = new Error(errorData.detail || `API error: ${response.status} ${response.statusText}`) as Error & {
            status?: number;
            data?: any;
        };

        error.status = response.status;
        error.data = errorData;

        throw error;
    }

    // Handle 204 No Content responses - return empty object instead of parsing JSON
    if (response.status === 204) {
        return {} as T;
    }

    // For other successful responses, parse as JSON
    return (await response.json()) as T;
}

/**
 * HTTP method shortcuts
 */
export const api = {
    async get<T = any>(endpoint: string, options?: Omit<ApiRequestInit, "method" | "body">): Promise<T> {
        return fetchJSON<T>(endpoint, { ...options, method: "GET" });
    },

    async post<T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestInit, "method">): Promise<T> {
        return fetchJSON<T>(endpoint, { ...options, method: "POST", body });
    },

    async put<T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestInit, "method">): Promise<T> {
        return fetchJSON<T>(endpoint, { ...options, method: "PUT", body });
    },

    async patch<T = any>(endpoint: string, body?: any, options?: Omit<ApiRequestInit, "method">): Promise<T> {
        return fetchJSON<T>(endpoint, { ...options, method: "PATCH", body });
    },

    async delete<T = any>(endpoint: string, options?: Omit<ApiRequestInit, "method">): Promise<T> {
        return fetchJSON<T>(endpoint, { ...options, method: "DELETE" });
    },
};
