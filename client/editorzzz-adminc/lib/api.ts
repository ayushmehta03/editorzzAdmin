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

export async function getAllUsers(page = 1, limit = 10) {
  return apiRequest(`/api/admin/users?page=${page}&limit=${limit}`);
}

export async function searchUsers(search: string) {
  return apiRequest(`/api/admin/users/search?search=${search}`);
}

export async function updateUserBan(id: string, ban: boolean) {
  return apiRequest(`/api/admin/users/${id}/ban`, {
    method: "PATCH",
    body: JSON.stringify({ ban }),
  });
}

export async function updateHiring(id: string, is_hiring_listed: boolean) {
  return apiRequest(`/api/admin/users/${id}/hiring`, {
    method: "PATCH",
    body: JSON.stringify({ is_hiring_listed }),
  });
}
export async function getReports() {
  return apiRequest("/api/admin/reports", {
    method: "GET",
  });
}

export async function getReportById(id: string) {
  return apiRequest(`/api/admin/reports/${id}`, {
    method: "GET",
  });
}


export async function resolveReport(id: string) {
  return apiRequest(`/api/admin/reports/${id}/resolve`, {
    method: "PATCH",
  });
}

export async function deleteSubmission(id: string) {
  return apiRequest(`/api/admin/submission/${id}`, {
    method: "DELETE",
  });
}

