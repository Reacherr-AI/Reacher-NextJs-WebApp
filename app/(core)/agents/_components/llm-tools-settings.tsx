'use client';

import * as React from 'react';
import type { BookAppointmentCalTool, CheckAvailabilityCalTool, EndCallTool, GeneralTool } from '@/types';
import { CalendarPlus, CalendarSearch, ChevronDown, Pencil, PhoneOff, Trash2 } from 'lucide-react';

type ExecutionMessageType = 'prompt' | 'static_text';
type ToolKind = 'end_call' | 'check_availability_cal' | 'book_appointment_cal';

type EndCallDraft = {
  name: string;
  description: string;
  speakDuringExecution: boolean;
  executionMessageType: ExecutionMessageType;
  executionMessageDescription: string;
};

type CalToolDraft = {
  name: string;
  description: string;
  calApiKey: string;
  eventTypeId: string;
  timezone: string;
};

const END_CALL_TYPE = 'end_call';
const CHECK_CAL_TYPE = 'check_availability_cal';
const BOOK_CAL_TYPE = 'book_appointment_cal';

const isEndCallTool = (tool: GeneralTool): tool is EndCallTool =>
  (tool.type ?? '').trim().toLowerCase() === END_CALL_TYPE;

const isCheckCalTool = (tool: GeneralTool): tool is CheckAvailabilityCalTool =>
  (tool.type ?? '').trim().toLowerCase() === CHECK_CAL_TYPE;

const isBookCalTool = (tool: GeneralTool): tool is BookAppointmentCalTool =>
  (tool.type ?? '').trim().toLowerCase() === BOOK_CAL_TYPE;

const uniqueToolName = (base: string, tools: GeneralTool[], ignoreIndex: number | null): string => {
  const existing = new Set(
    tools
      .map((t, idx) => (idx === ignoreIndex ? '' : typeof t.name === 'string' ? t.name.trim().toLowerCase() : ''))
      .filter((v) => v.length > 0)
  );
  if (!existing.has(base.toLowerCase())) return base;
  let idx = 2;
  while (existing.has(`${base}_${idx}`.toLowerCase())) idx += 1;
  return `${base}_${idx}`;
};

const endCallDraftFromTool = (tool: EndCallTool): EndCallDraft => ({
  name: typeof tool.name === 'string' && tool.name.trim() ? tool.name.trim() : 'end_call',
  description: typeof tool.description === 'string' ? tool.description : '',
  speakDuringExecution: Boolean(tool.speakDuringExecution),
  executionMessageType: tool.executionMessageType === 'static_text' ? 'static_text' : 'prompt',
  executionMessageDescription:
    typeof tool.executionMessageDescription === 'string' ? tool.executionMessageDescription : '',
});

const calDraftFromTool = (tool: CheckAvailabilityCalTool | BookAppointmentCalTool): CalToolDraft => ({
  name:
    typeof tool.name === 'string' && tool.name.trim()
      ? tool.name.trim()
      : 'cal_tool',
  description: typeof tool.description === 'string' ? tool.description : '',
  calApiKey: typeof tool.calApiKey === 'string' ? tool.calApiKey : '',
  eventTypeId:
    typeof tool.eventTypeId === 'number'
      ? String(tool.eventTypeId)
      : typeof tool.eventTypeId === 'string'
        ? tool.eventTypeId
        : '',
  timezone: typeof tool.timezone === 'string' && tool.timezone.trim() ? tool.timezone : 'America/Los_Angeles',
});

const toolLabel = (tool: GeneralTool): string => {
  if (isEndCallTool(tool)) return 'End Call';
  if (isCheckCalTool(tool)) return 'Check Calendar Availability (Cal.com)';
  if (isBookCalTool(tool)) return 'Book on the Calendar (Cal.com)';
  return tool.type || 'Tool';
};

type LlmToolsSettingsProps = {
  tools: GeneralTool[];
  saving: boolean;
  dirty: boolean;
  onToolsChange: (nextTools: GeneralTool[]) => void;
  onSave: () => void;
};

export function LlmToolsSettings({
  tools,
  saving,
  dirty,
  onToolsChange,
  onSave,
}: LlmToolsSettingsProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [activeKind, setActiveKind] = React.useState<ToolKind>('end_call');
  const [formError, setFormError] = React.useState<string | null>(null);

  const [endCallDraft, setEndCallDraft] = React.useState<EndCallDraft>({
    name: 'end_call',
    description: '',
    speakDuringExecution: true,
    executionMessageType: 'prompt',
    executionMessageDescription: '',
  });
  const [calDraft, setCalDraft] = React.useState<CalToolDraft>({
    name: 'check_availability_cal',
    description: 'When users ask for availability, check the calendar and provide available slots.',
    calApiKey: '',
    eventTypeId: '',
    timezone: 'America/Los_Angeles',
  });

  React.useEffect(() => {
    const onDocMouseDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const openCreate = (kind: ToolKind) => {
    setMenuOpen(false);
    setEditingIndex(null);
    setActiveKind(kind);
    setFormError(null);
    if (kind === 'end_call') {
      setEndCallDraft({
        name: uniqueToolName('end_call', tools, null),
        description: '',
        speakDuringExecution: true,
        executionMessageType: 'prompt',
        executionMessageDescription: '',
      });
    } else if (kind === 'check_availability_cal') {
      setCalDraft({
        name: uniqueToolName('check_availability_cal', tools, null),
        description: 'When users ask for availability, check the calendar and provide available slots.',
        calApiKey: '',
        eventTypeId: '',
        timezone: 'America/Los_Angeles',
      });
    } else {
      setCalDraft({
        name: uniqueToolName('book_appointment_cal', tools, null),
        description: 'When users ask to book an appointment, book it on the calendar.',
        calApiKey: '',
        eventTypeId: '',
        timezone: 'America/Los_Angeles',
      });
    }
    setEditorOpen(true);
  };

  const openEdit = (index: number) => {
    const tool = tools[index];
    if (!tool) return;
    setEditingIndex(index);
    setFormError(null);
    if (isEndCallTool(tool)) {
      setActiveKind('end_call');
      setEndCallDraft(endCallDraftFromTool(tool));
      setEditorOpen(true);
      return;
    }
    if (isCheckCalTool(tool)) {
      setActiveKind('check_availability_cal');
      setCalDraft(calDraftFromTool(tool));
      setEditorOpen(true);
      return;
    }
    if (isBookCalTool(tool)) {
      setActiveKind('book_appointment_cal');
      setCalDraft(calDraftFromTool(tool));
      setEditorOpen(true);
    }
  };

  const removeTool = (index: number) => {
    onToolsChange(tools.filter((_, i) => i !== index));
  };

  const validateName = (name: string) => {
    if (!name) return 'Tool name is required.';
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(name)) {
      return 'Name must be 1-64 chars and only use letters, numbers, _ or -.';
    }
    const duplicate = tools.some(
      (tool, idx) => idx !== editingIndex && (tool.name ?? '').trim().toLowerCase() === name.toLowerCase()
    );
    if (duplicate) return 'Tool name must be unique.';
    return null;
  };

  const saveTool = () => {
    if (activeKind === 'end_call') {
      const name = endCallDraft.name.trim();
      const nameError = validateName(name);
      if (nameError) {
        setFormError(nameError);
        return;
      }

      const nextTool: EndCallTool = {
        type: END_CALL_TYPE,
        name,
        description: endCallDraft.description.trim() || undefined,
        speakDuringExecution: endCallDraft.speakDuringExecution,
        executionMessageType: endCallDraft.executionMessageType,
        executionMessageDescription: endCallDraft.speakDuringExecution
          ? endCallDraft.executionMessageDescription.trim() || undefined
          : undefined,
      };

      const nextTools = [...tools];
      if (editingIndex === null) nextTools.push(nextTool);
      else nextTools.splice(editingIndex, 1, nextTool);
      onToolsChange(nextTools);
      setEditorOpen(false);
      return;
    }

    const name = calDraft.name.trim();
    const nameError = validateName(name);
    if (nameError) {
      setFormError(nameError);
      return;
    }
    if (!calDraft.calApiKey.trim()) {
      setFormError('Cal.com API key is required.');
      return;
    }
    if (!calDraft.eventTypeId.trim()) {
      setFormError('Event Type ID is required.');
      return;
    }
    const numericEventTypeId = Number(calDraft.eventTypeId.trim());
    if (!Number.isFinite(numericEventTypeId)) {
      setFormError('Event Type ID must be a number.');
      return;
    }

    const nextTool: CheckAvailabilityCalTool | BookAppointmentCalTool = {
      type: activeKind === 'book_appointment_cal' ? BOOK_CAL_TYPE : CHECK_CAL_TYPE,
      name,
      description: calDraft.description.trim() || undefined,
      calApiKey: calDraft.calApiKey.trim(),
      eventTypeId: numericEventTypeId,
      timezone: calDraft.timezone.trim() || undefined,
    };

    const nextTools = [...tools];
    if (editingIndex === null) nextTools.push(nextTool);
    else nextTools.splice(editingIndex, 1, nextTool);
    onToolsChange(nextTools);
    setEditorOpen(false);
  };

  return (
    <div className="grid gap-4">
      <p className="text-sm text-white/60">
        Enable your agent with capabilities such as calendar bookings, call termination, etc.
      </p>

      <div className="relative w-fit" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/20 bg-black/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <span className="text-3xl leading-none">+</span>
          Add
          <ChevronDown className="size-4 text-white/70" />
        </button>
        {menuOpen ? (
          <div className="absolute left-0 z-20 mt-2 w-[360px] overflow-hidden rounded-2xl border border-white/15 bg-[#0f1424] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <div className="p-2">
              <button
                type="button"
                onClick={() => openCreate('end_call')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white/90 transition hover:bg-white/10"
              >
                <PhoneOff className="size-5 text-white/70" />
                End Call
              </button>
              <button
                type="button"
                onClick={() => openCreate('check_availability_cal')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white/90 transition hover:bg-white/10"
              >
                <CalendarSearch className="size-5 text-white/70" />
                Check Calendar Availability (Cal.com)
              </button>
              <button
                type="button"
                onClick={() => openCreate('book_appointment_cal')}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-white/90 transition hover:bg-white/10"
              >
                <CalendarPlus className="size-5 text-white/70" />
                Book on the Calendar (Cal.com)
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {tools.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white/60">
          No general tools selected yet.
        </div>
      ) : (
        <div className="grid gap-2">
          {tools.map((tool, idx) => (
            <div
              key={`llm-general-tool-${idx}-${tool.type}-${tool.name ?? ''}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
            >
              <div className="min-w-0 max-w-[140px]">
                <p className="truncate text-sm font-semibold text-white/90">
                  {tool.name || tool.type || `Tool ${idx + 1}`}
                </p>
                <p className="truncate text-xs text-white/55">{toolLabel(tool)}</p>
              </div>
              <div className="flex items-center gap-2">
                {isEndCallTool(tool) || isCheckCalTool(tool) || isBookCalTool(tool) ? (
                  <button
                    type="button"
                    onClick={() => openEdit(idx)}
                    className="rounded-lg border border-white/10 bg-black/40 p-1 text-white/65 transition hover:border-white/20 hover:text-white"
                    aria-label="Edit tool"
                  >
                    <Pencil className="size-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeTool(idx)}
                  className="rounded-lg border border-white/10 bg-black/40 p-1 text-white/65 transition hover:border-white/20 hover:text-white"
                  aria-label="Remove tool"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !dirty}
          className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving llm…' : 'Save llm'}
        </button>
      </div>

      {editorOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Configure tool"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditorOpen(false);
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(900px_circle_at_70%_0%,rgba(248,248,248,0.08)_0%,rgba(56,66,218,0.25)_30%,rgba(12,14,55,0.85)_58%,rgba(0,0,0,1)_100%)] text-white shadow-[0_50px_160px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between gap-6 border-b border-white/10 px-7 py-6">
              <div className="flex items-center gap-3">
                {activeKind === 'end_call' ? (
                  <PhoneOff className="size-5 text-white/80" />
                ) : activeKind === 'check_availability_cal' ? (
                  <CalendarSearch className="size-5 text-white/80" />
                ) : (
                  <CalendarPlus className="size-5 text-white/80" />
                )}
                <h2 className="text-2xl font-semibold">
                  {activeKind === 'end_call'
                    ? 'End Call'
                    : activeKind === 'check_availability_cal'
                      ? 'Check Calendar Availability (Cal.com)'
                      : 'Book on the Calendar (Cal.com)'}
                </h2>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                onClick={() => setEditorOpen(false)}
                aria-label="Close"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="grid gap-5 px-7 py-6">
              {activeKind === 'end_call' ? (
                <>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-white/90">Name</span>
                    <input
                      value={endCallDraft.name}
                      onChange={(e) => setEndCallDraft((prev) => ({ ...prev, name: e.target.value }))}
                      className="h-11 rounded-xl border border-white/15 bg-black/35 px-4 text-sm text-white/90 outline-none transition focus:border-white/30"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-white/90">Description (Optional)</span>
                    <textarea
                      value={endCallDraft.description}
                      onChange={(e) => setEndCallDraft((prev) => ({ ...prev, description: e.target.value }))}
                      className="min-h-24 rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white/90 outline-none transition focus:border-white/30"
                      placeholder="Enter function description"
                    />
                  </label>

                  <label className="flex items-center gap-2 text-sm text-white/90">
                    <input
                      type="checkbox"
                      checked={endCallDraft.speakDuringExecution}
                      onChange={(e) =>
                        setEndCallDraft((prev) => ({ ...prev, speakDuringExecution: e.target.checked }))
                      }
                      className="h-4 w-4"
                    />
                    Speak Before Execution
                  </label>

                  {endCallDraft.speakDuringExecution ? (
                    <div className="grid gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                      <div className="inline-flex w-fit rounded-lg border border-white/10 bg-black/35 p-1">
                        <button
                          type="button"
                          onClick={() =>
                            setEndCallDraft((prev) => ({ ...prev, executionMessageType: 'prompt' }))
                          }
                          className={[
                            'rounded-md px-3 py-1.5 text-xs font-semibold transition',
                            endCallDraft.executionMessageType === 'prompt'
                              ? 'bg-white/15 text-white'
                              : 'text-white/65 hover:text-white',
                          ].join(' ')}
                        >
                          Prompt
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEndCallDraft((prev) => ({ ...prev, executionMessageType: 'static_text' }))
                          }
                          className={[
                            'rounded-md px-3 py-1.5 text-xs font-semibold transition',
                            endCallDraft.executionMessageType === 'static_text'
                              ? 'bg-white/15 text-white'
                              : 'text-white/65 hover:text-white',
                          ].join(' ')}
                        >
                          Static Sentence
                        </button>
                      </div>
                      <input
                        value={endCallDraft.executionMessageDescription}
                        onChange={(e) =>
                          setEndCallDraft((prev) => ({
                            ...prev,
                            executionMessageDescription: e.target.value,
                          }))
                        }
                        className="h-11 rounded-xl border border-white/15 bg-black/35 px-4 text-sm text-white/90 outline-none transition focus:border-white/30"
                        placeholder="Enter the execution message description"
                      />
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-white/90">Name</span>
                    <input
                      value={calDraft.name}
                      onChange={(e) => setCalDraft((prev) => ({ ...prev, name: e.target.value }))}
                      className="h-11 rounded-xl border border-white/15 bg-black/35 px-4 text-sm text-white/90 outline-none transition focus:border-white/30"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-white/90">Description (Optional)</span>
                    <textarea
                      value={calDraft.description}
                      onChange={(e) =>
                        setCalDraft((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="min-h-24 rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white/90 outline-none transition focus:border-white/30"
                      placeholder={
                        activeKind === 'check_availability_cal'
                          ? 'When users ask for availability, check the calendar and provide available slots.'
                          : 'When users ask to book an appointment, book it on the calendar.'
                      }
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-white/90">API Key (Cal.com)</span>
                    <input
                      value={calDraft.calApiKey}
                      onChange={(e) =>
                        setCalDraft((prev) => ({ ...prev, calApiKey: e.target.value }))
                      }
                      className="h-11 rounded-xl border border-white/15 bg-black/35 px-4 text-sm text-white/90 outline-none transition focus:border-white/30"
                      placeholder="Enter Cal.com API key"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-white/90">Event Type ID (Cal.com)</span>
                    <input
                      value={calDraft.eventTypeId}
                      onChange={(e) =>
                        setCalDraft((prev) => ({ ...prev, eventTypeId: e.target.value }))
                      }
                      className="h-11 rounded-xl border border-white/15 bg-black/35 px-4 text-sm text-white/90 outline-none transition focus:border-white/30"
                      placeholder="Enter Event Type ID"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-white/90">Timezone (Optional)</span>
                    <input
                      value={calDraft.timezone}
                      onChange={(e) =>
                        setCalDraft((prev) => ({ ...prev, timezone: e.target.value }))
                      }
                      className="h-11 rounded-xl border border-white/15 bg-black/35 px-4 text-sm text-white/90 outline-none transition focus:border-white/30"
                      placeholder="America/Los_Angeles"
                    />
                  </label>
                </>
              )}

              {formError ? <p className="text-sm text-red-300">{formError}</p> : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveTool}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
