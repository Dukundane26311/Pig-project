// ── Auth ──────────────────────────────────────────────────────────────────────
export interface LoginRequest { email: string; password: string; }
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
export interface UserMe {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  assigned_district: string | null;
  assigned_sector: string | null;
  assigned_cell: string | null;
  assigned_village: string | null;
}

// ── Roles ─────────────────────────────────────────────────────────────────────
export type Role =
  | "SUPER_ADMIN"
  | "PROJECT_MANAGER"
  | "FINANCE_OFFICER"
  | "FIELD_OFFICER"
  | "VETERINARIAN"
  | "TRAINER"
  | "FUNDER";

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ── Beneficiary ───────────────────────────────────────────────────────────────
export type BeneficiaryStatus =
  | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "COMPLETED" | "AWAITING_PIG"
  | "PIG_RECEIVED" | "GROWING" | "PREGNANT" | "LITTER_BORN" | "PIGLETS_GROWING"
  | "REPAYMENT_DUE" | "PARTIALLY_REPAID" | "REPAID" | "WITHDRAWN";

export interface BeneficiaryCreate {
  full_name: string;
  national_id?: string;
  phone?: string;
  alternative_phone?: string;
  gender?: string;
  household_size?: number;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  savings_group?: string;
  date_joined: string;
  notes?: string;
  field_officer_id?: string;
}
export interface BeneficiaryUpdate extends Partial<BeneficiaryCreate> {
  status?: BeneficiaryStatus;
}
export interface BeneficiaryResponse {
  id: string;
  beneficiary_number: string;
  full_name: string;
  national_id?: string;
  phone?: string;
  gender?: string;
  household_size?: number;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  savings_group?: string;
  date_joined: string;
  status: BeneficiaryStatus;
  notes?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

// ── Pig ───────────────────────────────────────────────────────────────────────
export type PigStatus =
  | "REGISTERED" | "ACTIVE" | "DISTRIBUTED" | "GROWING" | "PREGNANT"
  | "DELIVERED" | "TRANSFERRED" | "DECEASED" | "SOLD" | "INACTIVE";

export type PigHealthStatus =
  | "HEALTHY" | "SICK" | "UNDER_TREATMENT" | "RECOVERED" | "CRITICAL" | "DECEASED";

export interface PigCreate {
  breed?: string;
  sex?: "MALE" | "FEMALE";
  color?: string;
  birth_date?: string;
  received_date?: string;
  source?: string;
  purchase_price?: string;
  current_weight?: number;
  beneficiary_id?: string;
  notes?: string;
}
export interface PigUpdate extends Partial<PigCreate> {
  status?: PigStatus;
  health_status?: PigHealthStatus;
  pregnancy_status?: string;
  expected_delivery_date?: string;
  delivery_date?: string;
}
export interface PigResponse {
  id: string;
  pig_number: string;
  breed?: string;
  sex?: "MALE" | "FEMALE";
  color?: string;
  birth_date?: string;
  received_date?: string;
  source?: string;
  purchase_price?: string;
  current_weight?: number;
  status: PigStatus;
  health_status: PigHealthStatus;
  pregnancy_status?: string;
  expected_delivery_date?: string;
  delivery_date?: string;
  beneficiary_id?: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

// ── Litter ────────────────────────────────────────────────────────────────────
export interface LitterCreate {
  mother_pig_id: string;
  father_pig_id?: string;
  beneficiary_id?: string;
  mating_date?: string;
  expected_delivery_date?: string;
  actual_delivery_date: string;
  number_born: number;
  number_alive: number;
  number_deceased: number;
  notes?: string;
}
export interface LitterResponse {
  id: string;
  litter_number: string;
  mother_pig_id: string;
  father_pig_id?: string;
  beneficiary_id?: string;
  mating_date?: string;
  expected_delivery_date?: string;
  actual_delivery_date: string;
  number_born: number;
  number_alive: number;
  number_deceased: number;
  notes?: string;
  created_at: string;
}

// ── Piglet ────────────────────────────────────────────────────────────────────
export type PigletStatus =
  | "ALIVE" | "WITH_MOTHER" | "GROWING" | "RETURNED" | "AVAILABLE"
  | "REDISTRIBUTED" | "TRANSFERRED" | "DECEASED" | "SOLD";

export interface PigletResponse {
  id: string;
  piglet_number: string;
  litter_id: string;
  parent_pig_id?: string;
  current_beneficiary_id?: string;
  birth_date?: string;
  sex?: string;
  breed?: string;
  health_status: string;
  status: PigletStatus;
  returned_date?: string;
  redistributed_date?: string;
  notes?: string;
  created_at: string;
}

// ── Repayment ─────────────────────────────────────────────────────────────────
export interface RepaymentCreate {
  beneficiary_id: string;
  piglet_1_id: string;
  piglet_2_id: string;
  piglet_3_id: string;
  repayment_date: string;
  due_date?: string;
  notes?: string;
  otp_code?: string;
}
export interface RepaymentResponse {
  id: string;
  repayment_number: string;
  beneficiary_id: string;
  piglet_1_id?: string;
  piglet_2_id?: string;
  piglet_3_id?: string;
  piglets_required: number;
  piglets_returned: number;
  repayment_date: string;
  due_date?: string;
  status: string;
  otp_verified: boolean;
  notes?: string;
  created_at: string;
}

// ── Redistribution ────────────────────────────────────────────────────────────
export interface RedistributionCreate {
  piglet_id: string;
  to_beneficiary_id: string;
  redistribution_date: string;
  reason?: string;
  notes?: string;
}
export interface RedistributionResponse {
  id: string;
  redistribution_number: string;
  piglet_id: string;
  from_beneficiary_id?: string;
  to_beneficiary_id: string;
  authorized_by_id?: string;
  redistribution_date: string;
  reason?: string;
  notes?: string;
  created_at: string;
}

// ── Veterinary ────────────────────────────────────────────────────────────────
export interface VetRecordCreate {
  pig_id: string;
  beneficiary_id?: string;
  visit_type: string;
  visit_date: string;
  next_appointment?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  medicine?: string;
  dosage?: string;
  vaccination_type?: string;
  outcome?: string;
  notes?: string;
}
export interface VetRecordResponse extends VetRecordCreate {
  id: string;
  record_number: string;
  veterinarian_id?: string;
  created_at: string;
}

// ── Field Visit ───────────────────────────────────────────────────────────────
export interface FieldVisitCreate {
  beneficiary_id: string;
  visit_date: string;
  next_visit_date?: string;
  purpose: string;
  observations?: string;
  animal_condition?: string;
  household_progress?: string;
  repayment_progress?: string;
  action_required?: string;
  notes?: string;
}
export interface FieldVisitResponse extends FieldVisitCreate {
  id: string;
  visit_number: string;
  field_officer_id?: string;
  created_at: string;
}

// ── Finance ───────────────────────────────────────────────────────────────────
export interface FinanceTransactionCreate {
  transaction_type: "INCOME" | "EXPENSE";
  category: string;
  amount: string;
  currency?: string;
  description: string;
  transaction_date: string;
  beneficiary_id?: string;
  pig_id?: string;
  notes?: string;
}
export interface FinanceTransactionResponse {
  id: string;
  transaction_number: string;
  transaction_type: "INCOME" | "EXPENSE";
  category: string;
  amount: string;
  currency: string;
  description: string;
  transaction_date: string;
  status: string;
  beneficiary_id?: string;
  pig_id?: string;
  receipt_url?: string;
  otp_verified: boolean;
  notes?: string;
  created_at: string;
}
export interface FinanceSummaryResponse {
  total_income: string;
  total_expenses: string;
  balance: string;
  currency: string;
  period_start?: string;
  period_end?: string;
}

// ── Task ──────────────────────────────────────────────────────────────────────
export interface TaskCreate {
  title: string;
  description?: string;
  assigned_to_id?: string;
  beneficiary_id?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  due_date?: string;
  notes?: string;
}
export interface TaskUpdate extends Partial<TaskCreate> {
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "OVERDUE";
  completed_at?: string;
}
export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  assigned_to_id?: string;
  created_by_id?: string;
  beneficiary_id?: string;
  priority: string;
  status: string;
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
}

// ── Users ─────────────────────────────────────────────────────────────────────
export interface UserCreate {
  email: string;
  full_name: string;
  phone?: string;
  role: Role;
  password: string;
  assigned_district?: string;
  assigned_sector?: string;
  assigned_cell?: string;
  assigned_village?: string;
}
export interface UserUpdate extends Partial<Omit<UserCreate, "password">> {
  is_active?: boolean;
}
export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: Role;
  is_active: boolean;
  last_login_at?: string;
  assigned_district?: string;
  assigned_sector?: string;
  assigned_cell?: string;
  assigned_village?: string;
  created_at: string;
}

// ── Audit ─────────────────────────────────────────────────────────────────────
export interface AuditLogItem {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  result: string;
  otp_verified: boolean;
  ip_address?: string;
  created_at: string;
}

// ── Public ────────────────────────────────────────────────────────────────────
export interface PublicImpact {
  families_supported: number;
  pigs_distributed: number;
  piglets_born: number;
  piglets_returned: number;
  completed_cycles: number;
  districts_reached: number;
  available_piglets: number;
}
export interface PublicStory {
  id: string;
  title: string;
  slug: string;
  beneficiary_name: string;
  district?: string;
  story_text: string;
  image_url?: string;
  published_at?: string;
}
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  category: string;
}
export interface TeamMember {
  id: string;
  full_name: string;
  title: string;
  department?: string;
  bio?: string;
  photo_url?: string;
  sort_order: number;
}
export interface PublicReport {
  id: string;
  title: string;
  description?: string;
  reporting_period?: string;
  publication_date?: string;
  pdf_url: string;
}
export interface ContactMessageCreate {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// ── Revolving Fund ────────────────────────────────────────────────────────────
export interface RevolvingStats {
  active_beneficiaries: number;
  awaiting_piglet: number;
  completed_cycles: number;
  available_piglets: number;
}
export interface RevolvingPipelineStep {
  step: number;
  label: string;
  count: number;
}
export interface RevolvingPipeline {
  pipeline: Record<string, number>;
  cycle_steps: RevolvingPipelineStep[];
}

// ── OTP ───────────────────────────────────────────────────────────────────────
export interface OTPRequest { purpose: string; }
export interface OTPVerifyRequest { purpose: string; otp_code: string; }
