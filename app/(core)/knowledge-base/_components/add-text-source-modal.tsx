'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DraftTextSource } from './types';

type AddTextSourceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (source: DraftTextSource) => void;
};

export function AddTextSourceModal({ open, onOpenChange, onSave }: AddTextSourceModalProps) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  if (!open) return null;

  const disabled = title.trim().length === 0 || text.trim().length === 0;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#101528] p-5 text-white shadow-[0_30px_100px_rgba(2,4,20,0.75)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Add Text</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="rounded-full px-2 py-1 text-xl text-white/70 hover:bg-white/10 hover:text-white"
          >
            x
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/70">File Name</label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter file name"
              className="border-white/10 bg-black/20 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">Text Content</label>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Enter text content"
              className="min-h-46 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none ring-0 placeholder:text-white/40 focus:border-white/30"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={disabled}
            className="bg-white text-black hover:bg-white/90"
            onClick={() => {
              onSave({ kind: 'text', title: title.trim(), text: text.trim() });
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
