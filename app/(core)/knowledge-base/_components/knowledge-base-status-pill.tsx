import { cn } from '@/lib/utils';
import type { KnowledgeBaseStatus } from '@/types';

type KnowledgeBaseStatusPillProps = {
  status: KnowledgeBaseStatus | string;
  className?: string;
};

const statusClassName = (status: string) => {
  if (status === 'COMPLETE') {
    return 'border-emerald-300/35 bg-emerald-500/15 text-emerald-100';
  }

  if (status === 'FAILED') {
    return 'border-red-300/35 bg-red-500/15 text-red-100';
  }

  return 'border-sky-300/35 bg-sky-500/15 text-sky-100';
};

const labelForStatus = (status: string) => status.toLowerCase();

export function KnowledgeBaseStatusPill({ status, className }: KnowledgeBaseStatusPillProps) {
  const normalized = status.toUpperCase();

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em]',
        statusClassName(normalized),
        className
      )}
    >
      {labelForStatus(normalized)}
    </span>
  );
}
