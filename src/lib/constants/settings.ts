export interface SystemSettingItem {
  id: string;
  key: string;
  value: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_SYSTEM_SETTINGS: {
  key: string;
  value: string;
  description: string;
}[] = [
  {
    key: "revolving_return_target",
    value: "2",
    description: "Standard number of healthy piglets required to be returned per distributed female pig.",
  },
  {
    key: "default_distribution_batch",
    value: "1",
    description: "Standard quantity of pigs allocated per beneficiary household during a distribution round.",
  },
  {
    key: "organization_name",
    value: "Pig Project Rwanda",
    description: "Official institutional organization name displayed across official reports and receipts.",
  },
  {
    key: "system_contact_email",
    value: "admin@pigproject.rw",
    description: "Primary notification and administrative contact email address for project operations.",
  },
  {
    key: "system_contact_phone",
    value: "+250 788 123 456",
    description: "Hotline phone number for field operations and beneficiary support inquiries.",
  },
  {
    key: "currency",
    value: "RWF",
    description: "Primary transaction currency for financial records, budget receipts, and asset valuation.",
  },
  {
    key: "pig_quarantine_period_days",
    value: "14",
    description: "Minimum quarantine and health clearance holding days for newly received pigs before distribution.",
  },
  {
    key: "enable_audit_strict_mode",
    value: "true",
    description: "Enforces strict append-only audit tracking across all administrative modules and transactions.",
  },
];

export interface UserPreferences {
  theme: "light" | "dark";
  textSize: "small" | "default" | "large";
  notifications: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "light",
  textSize: "default",
  notifications: true,
};
