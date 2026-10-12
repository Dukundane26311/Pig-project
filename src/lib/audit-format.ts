export function formatRole(role?: string | null): string {
  if (!role) return "System";
  const r = role.replace(/^ROLE_/, "").toUpperCase();
  switch (r) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "Admin";
    case "FIELD_OFFICER":
    case "EMPLOYEE":
    case "REGISTRAR":
      return "Employee / Registrar";
    case "VETERINARIAN":
    case "VET":
      return "Veterinary";
    case "FINANCE_OFFICER":
    case "FINANCE":
      return "Finance";
    case "PROJECT_MANAGER":
      return "Project Manager";
    case "TRAINER":
      return "Trainer";
    case "FUNDER":
      return "Funder";
    default:
      return role;
  }
}

export function formatModule(entity: string): string {
  const e = (entity || "").toUpperCase();
  switch (e) {
    case "PIG":
    case "PIG_RECEIPT":
    case "LIVESTOCK":
      return "Pig Register";
    case "BENEFICIARY":
      return "Beneficiaries";
    case "DISTRIBUTION":
    case "PIG_DISTRIBUTION":
      return "Pig Distribution";
    case "RETURN":
    case "PIG_RETURN":
      return "Piglet Returns";
    case "VETERINARY":
    case "VETERINARY_RECORD":
    case "VET_VISIT":
      return "Veterinary";
    case "FINANCE":
    case "FINANCE_TRANSACTION":
      return "Finance";
    case "USER":
    case "USER_PROFILE":
    case "USER_SECURITY":
      return "Users";
    case "SETTING":
    case "SYSTEM_SETTING":
      return "System Settings";
    case "AUTH":
    case "LOGIN":
    case "LOGOUT":
      return "Authentication";
    case "REPORT":
    case "EMPLOYEE_REPORT":
      return "Operational Reports";
    case "GALLERY":
      return "Post Gallery";
    case "TEAM":
      return "Post Our Team";
    case "WEBSITE":
      return "Website Content";
    case "TASK":
      return "Tasks";
    case "LOCATION":
    case "DISTRICT":
    case "SECTOR":
    case "CELL":
    case "VILLAGE":
      return "Locations";
    default:
      return entity.replace(/_/g, " ");
  }
}

export function formatActivity(action: string, entity: string): string {
  const a = (action || "").toUpperCase();
  const e = (entity || "").toUpperCase();

  if (e === "AUTH" || a === "LOGIN") return "User Logged In";
  if (a === "LOGOUT") return "User Logged Out";

  if (e === "PIG_RECEIPT" || (e === "PIG" && a === "CREATED")) return "Pig Registration & Receipt";
  if (e === "PIG" && a === "UPDATED") return "Pig Receipt Updated";
  if (e === "PIG" && a === "DELETED") return "Pig Receipt Record Deleted";

  if (e === "BENEFICIARY" && a === "CREATED") return "Beneficiary Registered";
  if (e === "BENEFICIARY" && a === "UPDATED") return "Beneficiary Updated";

  if (e.includes("DISTRIBUTION") || a === "DISTRIBUTED") return "Pig Distributed";
  if (e.includes("RETURN") || a === "RETURNED") return "Piglet Return Recorded";

  if (e.includes("VET") || a === "EXAMINED") return "Veterinary Exam Recorded";

  if (e.includes("FINANCE") || a === "POSTED") return "Financial Transaction Recorded";
  if (e.includes("FINANCE") && a === "APPROVED") return "Financial Transaction Approved";

  if (e === "USER" && a === "CREATED") return "New User Created";
  if (e === "USER" && a === "DELETED") return "User Deactivated / Deleted";
  if (e === "USER_PROFILE" && a === "UPDATED") return "Profile Details Updated";
  if (e === "USER_SECURITY") return "Password Security Changed";

  if (e.includes("SETTING")) {
    if (a === "RESET") return "System Setting Reset";
    return a === "CREATED" ? "System Setting Created" : "System Setting Updated";
  }

  return `${a.charAt(0) + a.slice(1).toLowerCase()} ${formatModule(entity)}`;
}

export function getRecordReference(log: {
  entityId: string;
  entity: string;
  newValue?: any;
  previousValue?: any;
}): string {
  const nv = log.newValue as Record<string, any> | null;
  const pv = log.previousValue as Record<string, any> | null;

  if (nv?.tagNumber) return nv.tagNumber;
  if (nv?.beneficiaryNumber) return nv.beneficiaryNumber;
  if (nv?.transactionId) return nv.transactionId;
  if (nv?.email) return nv.email;
  if (nv?.name) return nv.name;
  if (nv?.tags && Array.isArray(nv.tags) && nv.tags.length > 0) {
    return nv.tags[0];
  }
  if (pv?.email) return pv.email;
  if (pv?.tagNumber) return pv.tagNumber;

  return log.entityId || "N/A";
}

export function formatChangeDescription(log: {
  action: string;
  entity: string;
  entityId: string;
  newValue?: any;
  previousValue?: any;
}): string {
  const nv = log.newValue as Record<string, any> | null;
  const pv = log.previousValue as Record<string, any> | null;
  const action = (log.action || "").toUpperCase();
  const entity = (log.entity || "").toUpperCase();

  if (entity === "AUTH") {
    return nv?.email ? `Successful authentication for account: ${nv.email}` : "User signed into the system";
  }

  if (entity === "PIG_RECEIPT" || entity === "PIG") {
    if (action === "CREATED") {
      const qty = nv?.quantity || nv?.count || 1;
      const tag = nv?.tagNumber ? ` (Tag: ${nv.tagNumber})` : "";
      return `Registered ${qty} pig(s) received into inventory stock${tag}`;
    }
    if (action === "UPDATED") {
      return `Modified pig batch receipt count to ${nv?.newCount || nv?.quantity || "updated"}`;
    }
    if (action === "DELETED") {
      return `Removed incorrect pig receipt batch (${pv?.deletedQuantity || pv?.count || "record"} pigs)`;
    }
  }

  if (entity === "BENEFICIARY") {
    if (action === "CREATED") {
      return `Enrolled beneficiary: ${nv?.fullName || "Family"} (${nv?.beneficiaryNumber || log.entityId})`;
    }
    if (action === "UPDATED") {
      return `Updated registered location / details for beneficiary ${log.entityId}`;
    }
  }

  if (entity.includes("DISTRIBUTION") || action === "DISTRIBUTED") {
    return `Completed distribution of pig asset to beneficiary (Cycle obligation: 2 piglets)`;
  }

  if (entity.includes("RETURN") || action === "RETURNED") {
    const qty = nv?.quantity || 1;
    return `Recorded ${qty} piglet(s) physically returned under revolving agreement`;
  }

  if (entity.includes("VET") || action === "EXAMINED") {
    const diag = nv?.diagnosis ? ` - Diagnosis: ${nv.diagnosis}` : "";
    const health = nv?.healthStatus ? ` [Status: ${nv.healthStatus}]` : "";
    return `Clinical veterinary inspection performed${health}${diag}`;
  }

  if (entity.includes("FINANCE")) {
    const amt = nv?.amount ? ` of ${Number(nv.amount).toLocaleString()} RWF` : "";
    const type = nv?.type ? ` [${nv.type}]` : "";
    return `${action === "APPROVED" ? "Approved" : "Recorded"} financial transaction${amt}${type}`;
  }

  if (entity === "USER") {
    if (action === "CREATED") {
      return `Created new user account: ${nv?.name || ""} (${nv?.email || ""}) with role ${formatRole(nv?.role)}`;
    }
    if (action === "DELETED") {
      return `Deactivated user account: ${pv?.name || pv?.email || log.entityId}`;
    }
  }

  if (entity === "USER_PROFILE") {
    return "Updated personal profile information (name or phone number)";
  }

  if (entity === "USER_SECURITY") {
    return "Updated account credentials / password changed";
  }

  if (entity.includes("SETTING")) {
    if (action === "RESET") return `Restored system setting '${log.entityId}' to factory default value`;
    return `Configured system setting '${log.entityId}' to value '${nv?.value ?? ""}'`;
  }

  // Fallback
  if (nv && typeof nv === "object") {
    const keys = Object.keys(nv).filter((k) => typeof nv[k] !== "object").slice(0, 3);
    if (keys.length > 0) {
      return keys.map((k) => `${k}: ${nv[k]}`).join(", ");
    }
  }

  return `${action} record in ${formatModule(entity)}`;
}
