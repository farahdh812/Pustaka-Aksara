export function formatDateId(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatRelativeDue(dueIso: string): {
  label: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  daysDiff: number;
} {
  const now = new Date();
  const due = new Date(dueIso);
  const diffMs = due.getTime() - now.getTime();
  const daysDiff = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    return {
      label: `Terlambat ${Math.abs(daysDiff)} hari`,
      isOverdue: true,
      isDueSoon: false,
      daysDiff,
    };
  }
  if (daysDiff === 0) {
    return {
      label: 'Jatuh tempo hari ini',
      isOverdue: false,
      isDueSoon: true,
      daysDiff,
    };
  }
  if (daysDiff === 1) {
    return {
      label: 'Jatuh tempo besok',
      isOverdue: false,
      isDueSoon: true,
      daysDiff,
    };
  }
  return {
    label: `Sisa ${daysDiff} hari`,
    isOverdue: false,
    isDueSoon: daysDiff <= 3,
    daysDiff,
  };
}
