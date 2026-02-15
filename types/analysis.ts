export interface AnalysisData {
  type: string;
}

// UI-known field types. Backend may return other strings; treat those as custom.
export const KNOWN_POST_CALL_FIELD_TYPES = ['string', 'boolean', 'number', 'enum'] as const;
export type KnownPostCallFieldType = (typeof KNOWN_POST_CALL_FIELD_TYPES)[number];

export interface BooleanPostCallField extends AnalysisData {
  name?: string;
  description?: string;
}

export interface EnumPostCallField extends AnalysisData {
  name?: string;
  description?: string;
  choices?: string[];
}

export interface NumberPostCallField extends AnalysisData {
  name?: string;
  description?: string;
}

export interface StringPostCallField extends AnalysisData {
  name?: string;
  description?: string;
  examples?: string[];
}

export type PostCallField =
  | BooleanPostCallField
  | EnumPostCallField
  | NumberPostCallField
  | StringPostCallField;
