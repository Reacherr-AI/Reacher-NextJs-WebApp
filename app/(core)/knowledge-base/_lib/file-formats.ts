const KNOWLEDGE_BASE_FILE_EXTENSIONS = ['pdf', 'docx', 'doc', 'md', 'txt', 'html', 'csv', 'xls', 'xlsx'] as const;
export const KNOWLEDGE_BASE_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
export const KNOWLEDGE_BASE_MAX_FILE_SIZE_LABEL = '50MB';

export const KNOWLEDGE_BASE_FILE_ACCEPT = KNOWLEDGE_BASE_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(',');

const extensionForFilename = (filename: string) => {
  const trimmed = filename.trim();
  const dotIndex = trimmed.lastIndexOf('.');
  if (dotIndex <= 0 || dotIndex === trimmed.length - 1) return '';
  return trimmed.slice(dotIndex + 1).toLowerCase();
};

const ALLOWED_EXTENSION_SET = new Set<string>(KNOWLEDGE_BASE_FILE_EXTENSIONS);

export const splitAllowedKnowledgeBaseFiles = (files: File[]) => {
  const validFiles: File[] = [];
  const invalidTypeFiles: File[] = [];
  const oversizedFiles: File[] = [];

  for (const file of files) {
    const extension = extensionForFilename(file.name);
    if (!ALLOWED_EXTENSION_SET.has(extension)) {
      invalidTypeFiles.push(file);
      continue;
    }

    if (file.size > KNOWLEDGE_BASE_MAX_FILE_SIZE_BYTES) {
      oversizedFiles.push(file);
      continue;
    }

    validFiles.push(file);
  }

  return { validFiles, invalidTypeFiles, oversizedFiles };
};

export const knowledgeBaseFileValidationErrorMessage = (invalidTypeFiles: File[], oversizedFiles: File[]) => {
  const messages: string[] = [];

  if (invalidTypeFiles.length > 0) {
    const invalidNames = invalidTypeFiles.map((file) => file.name).join(', ');
    messages.push(`Unsupported file type: ${invalidNames}. Allowed formats: ${KNOWLEDGE_BASE_FILE_ACCEPT}`);
  }

  if (oversizedFiles.length > 0) {
    const oversizedNames = oversizedFiles.map((file) => file.name).join(', ');
    messages.push(`File too large: ${oversizedNames}. Max file size is ${KNOWLEDGE_BASE_MAX_FILE_SIZE_LABEL}`);
  }

  return messages.join(' ');
};

const stripKnownExtension = (filename: string) =>
  filename.replace(/\.(pdf|docx|doc|md|txt|html|csv|xls|xlsx)$/i, '');

export const toKnowledgeBaseTxtFilename = (name: string) => {
  const normalized = stripKnownExtension(name.trim()).trim();
  return `${normalized || 'text-source'}.txt`;
};

export const createKnowledgeBaseTextFile = (name: string, text: string) =>
  new File([text], toKnowledgeBaseTxtFilename(name), { type: 'text/plain;charset=utf-8' });
