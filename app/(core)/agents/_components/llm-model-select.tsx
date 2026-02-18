'use client';

import * as React from 'react';
import Image from 'next/image';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type LlmModelOption = {
  label: string;
  value: string;
};

type LlmModelSelectProps = {
  value: string;
  options: LlmModelOption[];
  disabled?: boolean;
  placeholder?: string;
  onValueChange: (nextValue: string) => void;
};

type ModelFamily = 'openai' | 'anthropic' | 'gemini' | null;

const MODEL_ICON_BY_FAMILY: Record<Exclude<ModelFamily, null>, string> = {
  openai: '/icons/llm-models/openai-chatgpt.svg',
  anthropic: '/icons/llm-models/anthropic-claude.svg',
  gemini: '/icons/llm-models/google-gemini.svg',
};

const resolveModelFamily = (option: LlmModelOption): ModelFamily => {
  const normalized = `${option.value} ${option.label}`.trim().toLowerCase();
  if (normalized.includes('claude')) return 'anthropic';
  if (normalized.includes('gemini')) return 'gemini';
  if (normalized.includes('gpt')) return 'openai';
  return null;
};

export function LlmModelSelect({
  value,
  options,
  disabled = false,
  placeholder = 'Select model',
  onValueChange,
}: LlmModelSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((opt) => opt.value === value) ?? null;
  const selectedFamily = selected ? resolveModelFamily(selected) : null;

  return (
    <Popover open={open} onOpenChange={(next) => (!disabled ? setOpen(next) : undefined)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex h-[54px] w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-left text-sm text-white/90 outline-none transition hover:bg-black/40 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Select LLM model"
        >
          <span className="flex min-w-0 items-center gap-2">
            {selectedFamily ? (
              <Image
                src={MODEL_ICON_BY_FAMILY[selectedFamily]}
                alt={`${selectedFamily} icon`}
                width={18}
                height={18}
                className="h-[18px] w-[18px] rounded-sm invert"
              />
            ) : null}
            <span className="truncate">{selected?.label ?? placeholder}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-white/70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        className="max-h-[300px] overflow-y-auto rounded-2xl border border-white/10 bg-[#181a1f] p-1 text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
        style={{ width: 'max(var(--radix-popover-trigger-width), 340px)' }}
      >
        {options.map((opt) => {
          const family = resolveModelFamily(opt);
          const isSelected = opt.value === value;

          return (
            <button
              key={`llm-model-option-${opt.value}`}
              type="button"
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${isSelected ? 'bg-[#2563eb] text-white' : 'hover:bg-white/10'
                }`}
              onClick={() => {
                onValueChange(opt.value);
                setOpen(false);
              }}
            >
              <span className="inline-flex h-4 w-4 items-center justify-center">
                {isSelected ? <Check className="h-4 w-4" /> : null}
              </span>
              {family ? (
                <Image
                  src={MODEL_ICON_BY_FAMILY[family]}
                  alt={`${family} icon`}
                  width={16}
                  height={16}
                  className="h-4 w-4 rounded-sm invert"
                />
              ) : null}
              <span className="whitespace-nowrap">{opt.label}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
