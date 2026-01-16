'use client';

import { Note } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import LinkPreview from './LinkPreview';
import MarkdownPreview from './MarkdownPreview';

interface NoteDetailModalProps {
  note: Note;
  onClose: () => void;
  onDelete?: (noteId: string) => void;
  onEdit?: (note: Note) => void;
  isLoadingFullContent?: boolean;
}

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  markdown: { icon: '📝', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  link: { icon: '🔗', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  file: { icon: '📁', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  code: { icon: '💻', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  xml: { icon: '📋', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  default: { icon: '📄', color: 'text-claude-neutral-600', bg: 'bg-claude-neutral-100' },
};

export default function NoteDetailModal({ note, onClose, onDelete, onEdit, isLoadingFullContent = false }: NoteDetailModalProps) {
  const config = typeConfig[note.type] || typeConfig.default;

  const handleDelete = () => {
    if (confirm(`Delete note "${note.title}"?`)) {
      onDelete?.(note.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 modal-backdrop flex items-center justify-center p-0 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-claude-neutral-950 w-full h-full flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-claude-neutral-50 to-claude-neutral-100 dark:from-claude-neutral-900 dark:to-claude-neutral-950 border-b border-claude-neutral-200 dark:border-claude-neutral-800 px-8 py-6">
          <div className="max-w-5xl mx-auto flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center`}>
                <span className="text-2xl">{config.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-claude-neutral-900 dark:text-claude-neutral-50">
                  {note.title}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 text-sm text-claude-neutral-500 dark:text-claude-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {note.folder}
                  </span>
                  <span className="text-claude-neutral-300 dark:text-claude-neutral-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(note.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-claude-neutral-200 dark:hover:bg-claude-neutral-800 
                         text-claude-neutral-500 hover:text-claude-neutral-700 dark:hover:text-claude-neutral-300
                         transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto px-8 py-8">
          <div className="max-w-5xl mx-auto">
            {isLoadingFullContent && (
              <div className="mb-6 flex items-center gap-3 text-claude-neutral-500">
                <div className="w-5 h-5 border-2 border-claude-terracotta border-t-transparent rounded-full animate-spin" />
                <span>Loading full content...</span>
              </div>
            )}

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex gap-2 mb-6 flex-wrap">
                {note.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-sm px-4 py-1.5 rounded-full
                               bg-claude-neutral-100 dark:bg-claude-neutral-800
                               text-claude-neutral-600 dark:text-claude-neutral-400
                               font-medium transition-colors hover:bg-claude-terracotta hover:text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Image */}
            {note.metadata?.image && (
              <div className="mb-8">
                <img
                  src={note.metadata.image}
                  alt={note.title}
                  className="max-w-full max-h-[500px] object-contain rounded-2xl shadow-lifted mx-auto"
                />
              </div>
            )}

            {/* Content */}
            {!isLoadingFullContent && (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {note.type === 'link' && note.metadata?.url ? (
                  <div>
                    <LinkPreview url={note.metadata.url} />
                    <div className="mt-6 p-5 bg-claude-neutral-50 dark:bg-claude-neutral-900 rounded-2xl border border-claude-neutral-200 dark:border-claude-neutral-800">
                      <a
                        href={note.metadata.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-claude-terracotta dark:text-claude-terracotta-light hover:underline break-all flex items-center gap-2"
                      >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {note.metadata.url}
                      </a>
                    </div>
                  </div>
                ) : note.type === 'code' || note.type === 'xml' ? (
                  <pre className="bg-claude-neutral-900 text-claude-neutral-100 p-6 rounded-2xl overflow-x-auto text-sm leading-relaxed">
                    <code>{note.content}</code>
                  </pre>
                ) : note.type === 'markdown' ? (
                  <MarkdownPreview content={note.content} />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">{note.content}</div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-claude-neutral-50 dark:bg-claude-neutral-900 border-t border-claude-neutral-200 dark:border-claude-neutral-800 px-8 py-4">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium
                         transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => onEdit?.(note)}
                className="px-5 py-2.5 bg-gradient-to-r from-claude-terracotta to-claude-terracotta-dark
                           hover:from-claude-terracotta-dark hover:to-claude-terracotta-darker
                           text-white rounded-xl font-medium transition-all duration-200
                           flex items-center gap-2 shadow-sm hover:shadow-md hover:shadow-claude-terracotta/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-claude-neutral-200 dark:bg-claude-neutral-800
                           hover:bg-claude-neutral-300 dark:hover:bg-claude-neutral-700
                           text-claude-neutral-700 dark:text-claude-neutral-300
                           rounded-xl font-medium transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
