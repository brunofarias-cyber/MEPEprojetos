import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options?: Omit<RequestInit, 'body'> & { body?: any },
): Promise<any> {
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
    ...options,
    body,
    headers,
    credentials: "include",
  });

  await throwIfResNotOk(res);

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }
  return res;
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
