export interface KBTextRequestDto {
  title: string;
  text: string;
}

export type KnowledgeBaseStatus = 'CREATING' | 'COMPLETE' | 'FAILED';

export type KnowledgeBaseSourceType = 'FILE' | 'TEXT' | 'URL';

export interface KnowledgeBaseSourceDto {
  type: KnowledgeBaseSourceType;
  sourceId: string;
  filename?: string;
  fileUrl?: string;
  title?: string;
  contentUrl?: string;
  url?: string;
}

export interface KnowledgeBaseDto {
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  status: KnowledgeBaseStatus;
  knowledgeBaseSources: KnowledgeBaseSourceDto[];
  lastUpdatedTime: number;
}

export interface ListSitemapRequestDto {
  websiteUrl: string;
}

export type ListSitemapResponseDto = string[];

export type CreateKnowledgeBaseResponseBody = KnowledgeBaseDto;
