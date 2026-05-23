export const formatRole = (role, roleLabel) => {
  const ROLE_LABELS = {
    super_admin: "Superadmin",
    developer: "Developer",
    staff_admin: "Staff Admin",
    club_admin: "Club Admin",
    user: "User",
  };
  return roleLabel || ROLE_LABELS[role] || role;
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

export const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export const formatDateInput = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const truncateHash = (value) => {
  return value ? `${value.slice(0, 16)}...` : "-";
};

export const classNames = (...values) => {
  return values.filter(Boolean).join(" ");
};