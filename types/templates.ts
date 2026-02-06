import { AgentTemplateType } from './enums';

export interface TemplateDto {
  id: string;
  name: string;
  description: string;
  agentType?: AgentTemplateType;
}
