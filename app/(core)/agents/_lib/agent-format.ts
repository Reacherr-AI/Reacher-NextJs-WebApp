export const formatTimestamp = (value?: number) => {
  if (!value && value !== 0) return '—';
  const ms = value < 1_000_000_000_000 ? value * 1000 : value;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export const formatAgentType = (value?: string) => {
  if (!value) return 'Unknown';
  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

