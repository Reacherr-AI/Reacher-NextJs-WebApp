'use client';

import { FileText, FileUp, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type AddSourceMenuProps = {
  onAddFiles: () => void;
  onAddText: () => void;
  onAddWebPages: () => void;
  disabled?: boolean;
};

export function AddSourceMenu({
  onAddFiles,
  onAddText,
  onAddWebPages,
  disabled = false,
}: AddSourceMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="border-white/15 bg-white/5 text-white hover:bg-white/10"
        >
          + Add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-58 border-white/10 bg-[#121629] text-white shadow-[0_24px_80px_rgba(10,12,35,0.6)]"
      >
        <DropdownMenuItem onClick={onAddWebPages} className="cursor-pointer gap-2">
          <Globe className="size-4" />
          <div>
            <p className="text-sm font-medium">Add Web Pages</p>
            <p className="text-xs text-white/60">Crawl and sync website pages</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddFiles} className="cursor-pointer gap-2">
          <FileUp className="size-4" />
          <div>
            <p className="text-sm font-medium">Upload Files</p>
            <p className="text-xs text-white/60">PDF, text, or document files</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddText} className="cursor-pointer gap-2">
          <FileText className="size-4" />
          <div>
            <p className="text-sm font-medium">Add Text</p>
            <p className="text-xs text-white/60">Add article content manually</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
