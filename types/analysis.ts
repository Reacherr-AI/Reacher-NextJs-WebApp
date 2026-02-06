export interface AnalysisData {
  type: string;
}

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
