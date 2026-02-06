import { StartSpeaker } from './enums';
import { CheckAvailabilityCalTool, CustomTool, KbConfig, Mcp } from './response-engine';

export type ModelChoice = Record<string, unknown>;

export interface DisplayPosition {
  x?: number;
  y?: number;
}

export interface Node {
  type: string;
}

export interface NodeInstruction {
  type: string;
}

export interface PromptInstruction extends NodeInstruction {
  type: string;
  text?: string;
}

export interface StaticTextInstruction extends NodeInstruction {
  type: string;
  text?: string;
}

export type Instruction = PromptInstruction | StaticTextInstruction;

export interface FlowEdge {
  id?: string;
  transition_condition?: TransitionCondition;
  destination_node_id?: string;
}

export interface TransitionCondition {
  type?: string;
  prompt?: string;
}

export interface FinetuneExample {
  transcript?: TranscriptMessage[];
}

export interface TranscriptMessage {
  role?: string;
  content?: string;
}

export interface GlobalNodeSetting {
  condition?: string;
  positive_finetune_examples?: FinetuneExample[];
  negative_finetune_examples?: FinetuneExample[];
}

export interface ConversationNode extends Node {
  id?: string;
  type: string;
  name?: string;
  display_position?: DisplayPosition;
  instruction?: Instruction;
  edges?: FlowEdge[];
  global_node_setting?: GlobalNodeSetting;
}

export interface EndNode extends Node {
  id?: string;
  type: string;
  name?: string;
  display_position?: DisplayPosition;
  speak_during_execution?: boolean;
  instruction?: Instruction;
  global_node_setting?: GlobalNodeSetting;
}

export type ConversationFlowNode = ConversationNode | EndNode;

export interface Component {
  name?: string;
  nodes?: ConversationFlowNode[];
  tools?: (CheckAvailabilityCalTool | CustomTool)[];
  mcps?: Mcp[];
  start_node_id?: string;
  begin_tag_display_position?: DisplayPosition;
}

export interface ConversationFlowRequest {
  model_choice?: ModelChoice;
  start_speaker?: StartSpeaker;
  model_temperature?: number;
  tool_call_strict_mode?: boolean;
  is_transfer_llm?: boolean;
  nodes?: ConversationFlowNode[];
  start_node_id?: string;
  components?: Component[];
  tools?: (CheckAvailabilityCalTool | CustomTool)[];
  mcps?: Mcp[];
  knowledge_base_ids?: string[];
  kb_config?: KbConfig;
  global_prompt?: string;
  begin_after_user_silence_ms?: number;
  default_dynamic_variables?: Record<string, string>;
  begin_tag_display_position?: DisplayPosition;
}

export interface ConversationFlowResponse {
  conversation_flow_id?: string;
  version?: number;
  model_choice?: ModelChoice;
  model_temperature?: number;
  tool_call_strict_mode?: boolean;
  knowledge_base_ids?: string[];
  kb_config?: KbConfig;
  start_speaker?: StartSpeaker;
  begin_after_user_silence_ms?: number;
  global_prompt?: string;
  tools?: (CheckAvailabilityCalTool | CustomTool)[];
  components?: Component[];
  start_node_id?: string;
  default_dynamic_variables?: Record<string, string>;
  begin_tag_display_position?: DisplayPosition;
  mcps?: Mcp[];
  is_transfer_llm?: boolean;
  nodes?: ConversationFlowNode[];
}
