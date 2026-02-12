export type DraftFileSource = {
  kind: 'files';
  files: File[];
};

export type DraftTextSource = {
  kind: 'text';
  title: string;
  text: string;
};

export type DraftUrlSource = {
  kind: 'urls';
  websiteUrl: string;
  urls: string[];
};

export type DraftSource = DraftFileSource | DraftTextSource | DraftUrlSource;
