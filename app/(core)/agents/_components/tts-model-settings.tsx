'use client';

import * as React from 'react';
import { TtsVoiceSettings } from './tts-voice-settings';

export type TtsVoiceOption = {
  voiceId: string;
  voiceName: string;
  provider: string;
  gender: string;
  accent: string;
  age: string;
  avatarUrl: string | null;
  supportedLanguages: string[];
  recommended: boolean;
};

type TtsModelOption = {
  label: string;
  value: string;
};

type TtsModelSettingsProps = {
  selectedTtsVoice: TtsVoiceOption | null;
  selectedVoiceId: string;
  selectedTtsModel: string;
  ttsPickerOpen: boolean;
  ttsDraftModel: string;
  ttsDraftVoiceId: string;
  ttsDraftVolume: number;
  voiceSpeed: number;
  voiceTemperature: number;
  ttsVoiceProviderFilter: string;
  ttsModelOptions: TtsModelOption[];
  ttsVoiceProviderTabs: string[];
  recommendedTtsVoices: TtsVoiceOption[];
  filteredTtsVoices: TtsVoiceOption[];
  errorMessage?: string | null;
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onSaveSelection: () => void;
  onTtsDraftModelChange: (value: string) => void;
  onTtsDraftVoiceIdChange: (value: string) => void;
  onTtsVoiceProviderFilterChange: (value: string) => void;
  onVoiceSettingsSave: (next: { voiceSpeed: number; voiceTemperature: number; volume: number }) => Promise<void> | void;
  settingsDisabled?: boolean;
};

export function TtsModelSettings({
  selectedTtsVoice,
  selectedVoiceId,
  selectedTtsModel,
  ttsPickerOpen,
  ttsDraftModel,
  ttsDraftVoiceId,
  ttsDraftVolume,
  voiceSpeed,
  voiceTemperature,
  ttsVoiceProviderFilter,
  ttsModelOptions,
  ttsVoiceProviderTabs,
  recommendedTtsVoices,
  filteredTtsVoices,
  errorMessage,
  onOpenPicker,
  onClosePicker,
  onSaveSelection,
  onTtsDraftModelChange,
  onTtsDraftVoiceIdChange,
  onTtsVoiceProviderFilterChange,
  onVoiceSettingsSave,
  settingsDisabled = false,
}: TtsModelSettingsProps) {
  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
          TTS Model
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div
            className="min-w-0 flex-1 cursor-pointer rounded-2xl border border-white/10 bg-black/30 px-3 py-2 transition hover:border-white/20 hover:bg-white/5"
            role="button"
            tabIndex={0}
            onClick={onOpenPicker}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpenPicker();
              }
            }}
            aria-label="Open TTS model and voice selection"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">

              {/* REAL */}
              {/* {selectedTtsVoice?.avatarUrl ? (
                <img
                  src={selectedTtsVoice.avatarUrl}
                  alt={selectedTtsVoice.voiceName || selectedTtsVoice.voiceId}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white/90">
                  {(selectedTtsVoice?.voiceName || selectedVoiceId || 'V').slice(0, 1).toUpperCase()}
                </div>
              )} */}
              {/* TEMP */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white/90">
                {(selectedTtsVoice?.voiceName || selectedVoiceId || 'V').slice(0, 1).toUpperCase()}
              </div>

                <div className="min-w-0">
                  <p className="truncate text-sm text-white/90">
                    {selectedTtsVoice?.voiceName || selectedVoiceId || 'No voice selected'}
                  </p>
                  <p className="truncate text-xs text-white/55">
                    {selectedTtsVoice?.provider || selectedTtsModel || 'Select a voice'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <TtsVoiceSettings
            voiceSpeed={voiceSpeed}
            voiceTemperature={voiceTemperature}
            volume={ttsDraftVolume}
            disabled={settingsDisabled}
            onSave={onVoiceSettingsSave}
          />
        </div>
      </div>

      {ttsPickerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Set TTS Model and Voice ID"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClosePicker();
          }}
        >
          <div className="flex h-[86vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(1200px_circle_at_70%_0%,rgba(248,248,248,0.07)_0%,rgba(56,66,218,0.22)_35%,rgba(12,14,55,0.9)_62%,rgba(0,0,0,1)_100%)] text-white shadow-[0_50px_160px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-6 border-b border-white/10 px-7 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
                  Select Voice
                </p>
                <h2 className="mt-2 text-2xl font-semibold">Pick model and voice</h2>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                onClick={onClosePicker}
                aria-label="Close"
              >
                <span className="text-xl leading-none">x</span>
              </button>
            </div>

            <div className="grid gap-4 border-b border-white/10 px-7 py-5">
              {errorMessage ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {errorMessage}
                </div>
              ) : null}
              <div className="grid gap-3">
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    TTS Model
                  </span>
                  <select
                    value={ttsDraftModel}
                    onChange={(e) => onTtsDraftModelChange(e.target.value)}
                    className="h-11 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white/90 outline-none transition focus:border-white/25"
                  >
                    <option value="" className="bg-black text-white">
                      Select model
                    </option>
                    {ttsModelOptions.map((opt) => (
                      <option key={`tts-picker-model-${opt.value}`} value={opt.value} className="bg-black text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {ttsVoiceProviderTabs.map((provider) => {
                  const label = provider === 'all' ? 'All' : provider.charAt(0).toUpperCase() + provider.slice(1);
                  const isActive = ttsVoiceProviderFilter === provider;
                  return (
                    <button
                      key={`tts-provider-${provider}`}
                      type="button"
                      onClick={() => onTtsVoiceProviderFilterChange(provider)}
                      className={[
                        'rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                        isActive
                          ? 'border-white/40 bg-white/15 text-white'
                          : 'border-white/10 bg-black/30 text-white/75 hover:bg-white/10',
                      ].join(' ')}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-7 py-5">
              {recommendedTtsVoices.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                    Recommended Voices
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {recommendedTtsVoices.map((voice) => {
                      const isSelected = ttsDraftVoiceId.trim() === voice.voiceId;
                      return (
                        <button
                          key={`tts-rec-${voice.voiceId}`}
                          type="button"
                          onClick={() => onTtsDraftVoiceIdChange(voice.voiceId)}
                          className={[
                            'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
                            isSelected
                              ? 'border-white/35 bg-white/15'
                              : 'border-white/10 bg-black/30 hover:bg-white/10',
                          ].join(' ')}
                        >
                          {voice.avatarUrl ? (
                            // TEMP: WILL CHANGE WHEN WE UPLOAD THE IMAGES IN S3
                            // <img src={voice.avatarUrl} alt={voice.voiceName || voice.voiceId} className="h-10 w-10 rounded-full object-cover" />
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold">
                              {(voice.voiceName || voice.voiceId).slice(0, 1).toUpperCase()}
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold">
                              {(voice.voiceName || voice.voiceId).slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white/95">
                              {voice.voiceName || voice.voiceId}
                            </p>
                            <p className="truncate text-xs text-white/60">{voice.voiceId}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                <div className="divide-y divide-white/10">
                  {filteredTtsVoices.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-white/60">No voices match current filters.</div>
                  ) : (
                    filteredTtsVoices.map((voice) => {
                      const isSelected = ttsDraftVoiceId.trim() === voice.voiceId;
                      return (
                        <button
                          key={`tts-row-${voice.voiceId}`}
                          type="button"
                          onClick={() => onTtsDraftVoiceIdChange(voice.voiceId)}
                          className={[
                            'grid w-full grid-cols-[2fr,2fr,2fr,auto] items-center gap-3 px-4 py-3 text-left transition',
                            isSelected ? 'bg-white/10' : 'hover:bg-white/5',
                          ].join(' ')}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white/90">
                              {voice.voiceName || voice.voiceId}
                            </p>
                            <p className="truncate text-xs text-white/55">{voice.provider || 'unknown provider'}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {voice.accent ? (
                              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                                {voice.accent}
                              </span>
                            ) : null}
                            {voice.gender ? (
                              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                                {voice.gender}
                              </span>
                            ) : null}
                            {voice.age ? (
                              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                                {voice.age}
                              </span>
                            ) : null}
                          </div>
                          <p className="truncate text-sm text-white/80">{voice.voiceId}</p>
                          <span className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white/80">
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-t border-white/10 px-7 py-5 sm:grid-cols-[2fr,auto] sm:items-end">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClosePicker}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSaveSelection}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Save voice
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
