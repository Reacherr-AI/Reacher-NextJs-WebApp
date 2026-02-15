export const appendKnowledgeBaseSources = (target: FormData, source: FormData) => {
  for (const value of source.getAll('knowledgeBaseFiles')) {
    if (value instanceof File) {
      target.append('knowledgeBaseFiles', value, value.name);
    }
  }

  const urlValues: string[] = [];
  for (const value of source.getAll('knowledgeBaseUrls')) {
    if (typeof value === 'string' && value.trim().length > 0) {
      urlValues.push(value.trim());
    }
  }
  if (urlValues.length > 0) {
    target.append(
      'knowledgeBaseUrls',
      new Blob([JSON.stringify(urlValues)], { type: 'application/json' })
    );
  }

  for (const value of source.getAll('knowledgeBaseTexts')) {
    if (value instanceof File) {
      target.append('knowledgeBaseTexts', value, value.name || 'knowledgeBaseText.json');
      continue;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      target.append(
        'knowledgeBaseTexts',
        new Blob([value], { type: 'application/json' }),
        'knowledgeBaseText.json'
      );
    }
  }
};

export const hasKnowledgeBaseSources = (source: FormData) =>
  source.getAll('knowledgeBaseFiles').length > 0 ||
  source.getAll('knowledgeBaseUrls').length > 0 ||
  source.getAll('knowledgeBaseTexts').length > 0;
