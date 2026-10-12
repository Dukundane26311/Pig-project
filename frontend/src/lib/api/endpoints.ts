/**
 * All API endpoint calls in one place.
 * Components import from here — never call apiClient directly in components.
 */
import apiClient from "./client";
import type {
  LoginRequest, TokenResponse, UserMe,
  BeneficiaryCreate, BeneficiaryUpdate, BeneficiaryResponse, PagedResponse,
  PigCreate, PigUpdate, PigResponse,
  LitterCreate, LitterResponse,
  PigletResponse,
  RepaymentCreate, RepaymentResponse,
  RedistributionCreate, RedistributionResponse,
  VetRecordCreate, VetRecordResponse,
  FieldVisitCreate, FieldVisitResponse,
  TaskCreate, TaskUpdate, TaskResponse,
  FinanceTransactionCreate, FinanceTransactionResponse, FinanceSummaryResponse,
  PublicImpact, PublicStory, GalleryItem, TeamMember, PublicReport,
  ContactMessageCreate,
  NotificationItem,
  AuditLogItem,
  UserCreate, UserUpdate, UserResponse,
  RevolvingStats, RevolvingPipeline,
  OTPRequest, OTPVerifyRequest,
} from "@/types";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (body: LoginRequest) =>
    apiClient.post<TokenResponse>("/auth/login", body).then((r) => r.data),
  logout: (refreshToken: string) =>
    apiClient.post("/auth/logout", { refresh_token: refreshToken }),
  me: () => apiClient.get<UserMe>("/auth/me").then((r) => r.data),
  changePassword: (body: { current_password: string; new_password: string }) =>
    apiClient.post("/auth/password", body),
  requestOtp: (purpose: string) =>
    apiClient.post("/auth/otp/request", { purpose }).then((r) => r.data),
  verifyOtp: (body: OTPVerifyRequest) =>
    apiClient.post("/auth/otp/verify", body).then((r) => r.data),
};

// ── Public ────────────────────────────────────────────────────────────────────
export const publicApi = {
  getImpact: () =>
    apiClient.get<PublicImpact>("/public/impact").then((r) => r.data),
  getStories: (limit = 10) =>
    apiClient.get<PublicStory[]>(`/public/stories?limit=${limit}`).then((r) => r.data),
  getStory: (slug: string) =>
    apiClient.get<PublicStory>(`/public/stories/${slug}`).then((r) => r.data),
  getGallery: (category?: string, limit = 24) =>
    apiClient
      .get<GalleryItem[]>(`/public/gallery${category ? `?category=${category}` : ""}${limit ? `${category ? "&" : "?"}limit=${limit}` : ""}`)
      .then((r) => r.data),
  getTeam: () =>
    apiClient.get<TeamMember[]>("/public/team").then((r) => r.data),
  getReports: () =>
    apiClient.get<PublicReport[]>("/public/reports").then((r) => r.data),
  submitContact: (body: ContactMessageCreate) =>
    apiClient.post("/public/contact", body).then((r) => r.data),
};

// ── Beneficiaries ─────────────────────────────────────────────────────────────
export const beneficiaryApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PagedResponse<BeneficiaryResponse>>("/beneficiaries", { params }).then((r) => r.data),
  create: (body: BeneficiaryCreate) =>
    apiClient.post<BeneficiaryResponse>("/beneficiaries", body).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<BeneficiaryResponse>(`/beneficiaries/${id}`).then((r) => r.data),
  update: (id: string, body: BeneficiaryUpdate) =>
    apiClient.patch<BeneficiaryResponse>(`/beneficiaries/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/beneficiaries/${id}`),
  uploadPhoto: (id: string, file: File) => {
    const form = new FormData();
    form.append("photo", file);
    return apiClient.post<BeneficiaryResponse>(`/beneficiaries/${id}/photo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },
};

// ── Pigs ──────────────────────────────────────────────────────────────────────
export const pigApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PagedResponse<PigResponse>>("/pigs", { params }).then((r) => r.data),
  create: (body: PigCreate) =>
    apiClient.post<PigResponse>("/pigs", body).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<PigResponse>(`/pigs/${id}`).then((r) => r.data),
  update: (id: string, body: PigUpdate) =>
    apiClient.patch<PigResponse>(`/pigs/${id}`, body).then((r) => r.data),
  distribute: (id: string, beneficiaryId: string) =>
    apiClient.post<PigResponse>(`/pigs/${id}/distribute?beneficiary_id=${beneficiaryId}`).then((r) => r.data),
};

// ── Litters ───────────────────────────────────────────────────────────────────
export const litterApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PagedResponse<LitterResponse>>("/litters", { params }).then((r) => r.data),
  create: (body: LitterCreate) =>
    apiClient.post<LitterResponse>("/litters", body).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<LitterResponse>(`/litters/${id}`).then((r) => r.data),
  getPiglets: (id: string) =>
    apiClient.get<PigletResponse[]>(`/litters/${id}/piglets`).then((r) => r.data),
};

// ── Piglets ───────────────────────────────────────────────────────────────────
export const pigletApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PagedResponse<PigletResponse>>("/piglets", { params }).then((r) => r.data),
  available: () =>
    apiClient.get<PigletResponse[]>("/piglets/available").then((r) => r.data),
  get: (id: string) =>
    apiClient.get<PigletResponse>(`/piglets/${id}`).then((r) => r.data),
};

// ── Revolving Fund ────────────────────────────────────────────────────────────
export const revolvingApi = {
  stats: () =>
    apiClient.get<RevolvingStats>("/revolving-fund/stats").then((r) => r.data),
  pipeline: () =>
    apiClient.get<RevolvingPipeline>("/revolving-fund/pipeline").then((r) => r.data),
  overdueRepayments: (params?: Record<string, number>) =>
    apiClient.get("/revolving-fund/overdue-repayments", { params }).then((r) => r.data),
};

// ── Repayments ────────────────────────────────────────────────────────────────
export const repaymentApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PagedResponse<RepaymentResponse>>("/repayments", { params }).then((r) => r.data),
  create: (body: RepaymentCreate) =>
    apiClient.post<RepaymentResponse>("/repayments", body).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<RepaymentResponse>(`/repayments/${id}`).then((r) => r.data),
};

// ── Redistributions ───────────────────────────────────────────────────────────
export const redistributionApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PagedResponse<RedistributionResponse>>("/redistributions", { params }).then((r) => r.data),
  create: (body: RedistributionCreate) =>
    apiClient.post<RedistributionResponse>("/redistributions", body).then((r) => r.data),
};

// ── Veterinary ────────────────────────────────────────────────────────────────
export const vetApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PagedResponse<VetRecordResponse>>("/veterinary", { params }).then((r) => r.data),
  create: (body: VetRecordCreate) =>
    apiClient.post<VetRecordResponse>("/veterinary", body).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<VetRecordResponse>(`/veterinary/${id}`).then((r) => r.data),
  upcomingAppointments: (days = 7) =>
    apiClient.get(`/veterinary/upcoming/appointments?days=${days}`).then((r) => r.data),
};

// ── Field Visits ──────────────────────────────────────────────────────────────
export const fieldVisitApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PagedResponse<FieldVisitResponse>>("/field-visits", { params }).then((r) => r.data),
  create: (body: FieldVisitCreate) =>
    apiClient.post<FieldVisitResponse>("/field-visits", body).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<FieldVisitResponse>(`/field-visits/${id}`).then((r) => r.data),
};

// ── Finance ───────────────────────────────────────────────────────────────────
export const financeApi = {
  summary: (params?: Record<string, string>) =>
    apiClient.get<FinanceSummaryResponse>("/finance/summary", { params }).then((r) => r.data),
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PagedResponse<FinanceTransactionResponse>>("/finance", { params }).then((r) => r.data),
  create: (body: FinanceTransactionCreate) =>
    apiClient.post<FinanceTransactionResponse>("/finance", body).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<FinanceTransactionResponse>(`/finance/${id}`).then((r) => r.data),
  approve: (id: string, body: { action: string; comment?: string; otp_code: string }) =>
    apiClient.post<FinanceTransactionResponse>(`/finance/${id}/approve`, body).then((r) => r.data),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const taskApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    apiClient.get<PagedResponse<TaskResponse>>("/tasks", { params }).then((r) => r.data),
  create: (body: TaskCreate) =>
    apiClient.post<TaskResponse>("/tasks", body).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<TaskResponse>(`/tasks/${id}`).then((r) => r.data),
  update: (id: string, body: TaskUpdate) =>
    apiClient.patch<TaskResponse>(`/tasks/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/tasks/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    apiClient.get<PagedResponse<NotificationItem>>("/notifications", { params }).then((r) => r.data),
  unreadCount: () =>
    apiClient.get<{ unread_count: number }>("/notifications/unread-count").then((r) => r.data),
  markRead: (id: string) => apiClient.post(`/notifications/${id}/read`),
  markAllRead: () => apiClient.post("/notifications/read-all"),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
};

// ── Users (Admin) ─────────────────────────────────────────────────────────────
export const userApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PagedResponse<UserResponse>>("/users", { params }).then((r) => r.data),
  create: (body: UserCreate) =>
    apiClient.post<UserResponse>("/users", body).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<UserResponse>(`/users/${id}`).then((r) => r.data),
  update: (id: string, body: UserUpdate) =>
    apiClient.patch<UserResponse>(`/users/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

// ── Audit ─────────────────────────────────────────────────────────────────────
export const auditApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<PagedResponse<AuditLogItem>>("/audit", { params }).then((r) => r.data),
};
