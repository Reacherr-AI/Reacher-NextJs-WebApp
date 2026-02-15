'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DraftUrlSource } from './types';

type AddWebPagesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (source: DraftUrlSource) => void;
};

type ApiError = { message?: unknown };

const requestSitemap = async (websiteUrl: string) => {
  const res = await fetch('/api/knowledge-base/sitemap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ websiteUrl }),
  });

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { message: text };
    }
  }

  if (!res.ok) {
    const message =
      typeof (parsed as ApiError | null)?.message === 'string'
        ? (parsed as { message: string }).message
        : 'Unable to fetch sitemap pages.';

    throw new Error(message);
  }

  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
    throw new Error('Unexpected sitemap response from server.');
  }

  return parsed;
};

export function AddWebPagesModal({ open, onOpenChange, onSave }: AddWebPagesModalProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sitemapUrls, setSitemapUrls] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const filteredUrls = useMemo(() => {
    if (!search.trim()) return sitemapUrls;
    const query = search.trim().toLowerCase();
    return sitemapUrls.filter((url) => url.toLowerCase().includes(query));
  }, [search, sitemapUrls]);

  if (!open) return null;

  const toggle = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const fetchUrls = async () => {
    if (websiteUrl.trim().length === 0) {
      setError('Website URL is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const urls = await requestSitemap(websiteUrl.trim());
      setSitemapUrls(urls);
      setSelected(new Set());
      if (urls.length === 0) {
        setError('No sitemap URLs were found for this website.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch sitemap pages.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = selected.size;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[#101528] p-5 text-white shadow-[0_30px_100px_rgba(2,4,20,0.75)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Add Web Pages</h3>
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
            <label className="mb-2 block text-sm text-white/70">URL Address</label>
            <div className="flex gap-2">
              <Input
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                placeholder="Enter URL"
                className="border-white/10 bg-black/20 text-white"
              />
              <Button
                type="button"
                disabled={loading}
                className="bg-white text-black hover:bg-white/90"
                onClick={() => void fetchUrls()}
              >
                {loading ? 'Loading...' : 'Fetch'}
              </Button>
            </div>
          </div>

          {sitemapUrls.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search..."
                  className="max-w-sm border-white/10 bg-black/20 text-white"
                />
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <button
                    type="button"
                    className="rounded px-2 py-1 hover:bg-white/10"
                    onClick={() => setSelected(new Set(sitemapUrls))}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="rounded px-2 py-1 hover:bg-white/10"
                    onClick={() => setSelected(new Set())}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {filteredUrls.map((url) => (
                  <label key={url} className="flex cursor-pointer items-start gap-2 rounded-lg p-2 hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={selected.has(url)}
                      onChange={() => toggle(url)}
                      className="mt-0.5"
                    />
                    <span className="break-all text-sm text-white/85">{url}</span>
                  </label>
                ))}
              </div>

              <p className="mt-3 text-xs text-white/60">{selectedCount} item(s) selected</p>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}
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
            disabled={selectedCount === 0}
            className="bg-white text-black hover:bg-white/90"
            onClick={() => {
              onSave({
                kind: 'urls',
                websiteUrl: websiteUrl.trim(),
                urls: Array.from(selected),
              });
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
