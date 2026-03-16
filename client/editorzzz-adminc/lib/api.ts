const BASE_URL = "http://localhost:1001";

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiRequest(
  endpoint: string,
  options: RequestOptions = {}
) {
  let token = options.token;

  if (!token && typeof window !== "undefined") {
    token = localStorage.getItem("admin_token") || "";
  }

  const { headers, ...rest } = options;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}


export async function adminLogin(identifier: string, password: string) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}


export async function getDashboardStats() {
  return apiRequest("/api/admin/dashboard", {
    method: "GET",
  });
}