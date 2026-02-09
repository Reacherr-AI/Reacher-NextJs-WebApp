export interface KBTextRequestDto {
  title: string;
  text: string;
}

// The OpenAPI spec models this as `multipart/form-data`.
// In practice you will send a `FormData` body, but this type captures the fields.
export interface CreateKnowledgeBaseFields {
  knowledgeBaseName: string;
  knowledgeBaseTexts?: KBTextRequestDto[];
  knowledgeBaseFiles?: Blob[];
  knowledgeBaseUrls?: string[];
}

export type CreateKnowledgeBaseResponseBody = Record<string, unknown>;

