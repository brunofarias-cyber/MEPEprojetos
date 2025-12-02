import { QueryClient, QueryFunction } from "@tanstack/react-query";

class ApiError extends Error {
  status: number;
  body?: any;
  constructor(status: number, message: string, body?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    let body: any = undefined;
    try {
      if (contentType.includes("application/json")) {
        body = await res.json();
      } else {
        body = await res.text();
      }
    } catch (_) {
      body = await res.text().catch(() => undefined);
    }

    const message = (body && (body.message || body.error)) || res.statusText || String(body) || `${res.status}`;
    throw new ApiError(res.status, String(message), body);
  }
}

export async function apiRequest(methodOrUrl: string, ...rest: any[]): Promise<any> {
  const maybeUrlOrOptions = rest[0];
  const maybeOptions = rest[1];
  // Support both call styles:
  // 1) apiRequest(url, options?)
  // 2) apiRequest(method, url, options?)  (legacy usage in many files)
  let url: string;
  let options: Omit<RequestInit, 'body'> & { body?: any } | undefined;

  const httpMethodRegex = /^(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)$/i;
  if (typeof maybeUrlOrOptions === 'string' && httpMethodRegex.test(methodOrUrl)) {
    // method-first signature: apiRequest(method, url, optionsOrBody?)
    url = maybeUrlOrOptions;
    // if caller passed a plain object as third arg, treat it as body
    if (maybeOptions && (typeof maybeOptions !== 'object' || !("method" in maybeOptions || "headers" in maybeOptions || "body" in maybeOptions))) {
      options = { body: maybeOptions } as any;
    } else {
      options = maybeOptions as any;
    }
    options = { ...(options || {}), method: methodOrUrl.toUpperCase() } as any;
  } else {
    // url-first signature: apiRequest(url, options?)
    url = methodOrUrl;
    options = maybeUrlOrOptions as any;
  }

  // Get JWT token from localStorage for authentication
  const token = localStorage.getItem('bprojetos_token');

  const headers = new Headers(options?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Serialize body as JSON if it's an object
  let body = options?.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    ...(options || {}),
    body,
    headers,
    credentials: "include",
  });

  await throwIfResNotOk(res);

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await res.json();
  }
  return res;
}

export function isApiError(e: unknown): e is ApiError {
  return !!e && typeof e === 'object' && (e as any).name === 'ApiError';
}

export function parseApiError(e: unknown): { status?: number; message: string } {
  if (isApiError(e)) {
    const msg = e.message || (e.body && (e.body.message || JSON.stringify(e.body))) || `HTTP ${e.status}`;
    return { status: e.status, message: msg };
  }

  if (e instanceof Error) return { message: e.message };
  return { message: String(e) };
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      // Get JWT token from localStorage for authentication
      const token = localStorage.getItem('bprojetos_token');

      const headers = new Headers();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const res = await fetch(queryKey.join("/") as string, {
        credentials: "include",
        headers,
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
