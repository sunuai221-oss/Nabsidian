export type NoteType = 'markdown' | 'link' | 'file' | 'code' | 'xml';

export interface Note {
  id: string;
  title: string;
  type: NoteType;
  content: string;
  folder: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    url?: string;
    fileType?: string;
    language?: string;
    image?: string; // Base64 encoded image data
  };
}

export interface Folder {
  name: string;
  path: string;
  noteCount: number;
}
