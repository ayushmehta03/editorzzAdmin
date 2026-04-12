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

export async function getJudgedTournaments() {
  return apiRequest(`/api/admin/get-approveTournament`, {
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

export async function createTournament(data: any) {
  return apiRequest(`/api/admin/createtournament`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createVoteContest(data:any){
  return apiRequest(`/api/admin/create-vote-contest`,{
    method:"POST",
    body:JSON.stringify(data),
  })
}


export async function getJudgeAccess(slug: string) {
  return apiRequest(`/judge/${slug}`, {
    method: "GET",
  });
}

export async function getJudgeSubmissions(slug: string) {
  return apiRequest(`/judge/${slug}/submissions`, {
    method: "GET",
  });
}

export async function saveJudgeScores(
  judge_slug: string,
  scores: { submission_id: string; points: number }[]
) {
  return apiRequest(`/judge/save-scores`, {
    method: "POST",
    body: JSON.stringify({
      judge_slug,
      scores,
    }),
  });
}

export async function submitFinalScores(slug: string) {
  return apiRequest(`/judge/${slug}/final-submit`, {
    method: "POST",
  });
}
export async function getAdminReview(id: string) {
  return apiRequest(`/api/admin/review/${id}`, {
    method: "GET",
  });
}

export async function approveTournament(id: string) {
  return apiRequest(`/api/admin/approve/${id}`, {
    method: "PUT",
  });
}
export async function getLeaderboard(id: string) {
  return apiRequest(`/api/admin/leaderboard/${id}`, {
    method: "GET",
  });
}



export async function getActiveTournaments() {
  return apiRequest(`/api/admin/active-tournaments`, {
    method: "GET",
  });
}



export async function getUpcomingTournaments() {
  return apiRequest(`/api/admin/upcoming-tournaments`, {
    method: "GET",
  });
}



export async function getCompletedTournaments() {
  return apiRequest(`/api/admin/completed-tournaments`, {
    method: "GET",
  });
}

export async function updateVotingTime(id:string,data:any){
  return apiRequest(`/api/admin/update-votetime/${id}`,{
    method:"PUT",
    body:JSON.stringify(data)
  })
}


export async function updateTournament(id:string,data:any){
  return apiRequest(`/api/admin/update-tournament/${id}`,{
    method:"PUT",
    body:JSON.stringify(data)
  })
}

export async function getVoteTournaments(){
  return apiRequest(`/api/admin/vote/tournaments`,{
    method:"GET",
  })
}
