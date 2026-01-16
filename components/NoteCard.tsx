'use client';

import { Note } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
  onDelete?: (noteId: string) => void;
}

const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
  markdown: { icon: '📝', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  link: { icon: '🔗', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  file: { icon: '📁', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  code: { icon: '💻', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  xml: { icon: '📋', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  default: { icon: '📄', color: 'text-claude-neutral-600 dark:text-claude-neutral-400', bg: 'bg-claude-neutral-100 dark:bg-claude-neutral-800' },
};

export default function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
  const config = typeConfig[note.type] || typeConfig.default;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Supprimer la note "${note.title}" ?`)) {
      onDelete?.(note.id);
    }
  };

  return (
    <article
      onClick={onClick}
      className="group relative bg-white dark:bg-claude-neutral-900 rounded-2xl p-5
                 border border-claude-neutral-200 dark:border-claude-neutral-800
                 shadow-soft hover:shadow-lifted
                 transition-all duration-300 ease-out
                 hover:-translate-y-1 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3 pr-8">
        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
          <span className="text-lg">{config.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-lg text-claude-neutral-900 dark:text-claude-neutral-50 truncate">
            {note.title}
          </h3>
          <span className="text-xs text-claude-neutral-500 dark:text-claude-neutral-400">
            {note.folder}
          </span>
        </div>
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {note.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-1 rounded-full
                         bg-claude-neutral-100 dark:bg-claude-neutral-800
                         text-claude-neutral-600 dark:text-claude-neutral-400
                         font-medium"
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-claude-terracotta/10 text-claude-terracotta font-medium">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Image Preview */}
      {note.metadata?.image && (
        <div className="mb-3 rounded-xl overflow-hidden">
          <img
            src={note.metadata.image}
            alt={note.title}
            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content Preview */}
      <div className="mb-4">
        {note.type === 'link' && note.metadata?.url ? (
          <div className="text-sm text-claude-terracotta dark:text-claude-terracotta-light truncate flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="truncate">{note.metadata.url}</span>
          </div>
        ) : note.type === 'markdown' || note.type === 'code' || note.type === 'xml' ? (
          <p className="text-sm text-claude-neutral-600 dark:text-claude-neutral-400 line-clamp-3 font-mono text-xs leading-relaxed">
            {note.content.slice(0, 150) + (note.content.length > 150 ? '...' : '')}
          </p>
        ) : (
          <p className="text-sm text-claude-neutral-600 dark:text-claude-neutral-400 line-clamp-3 leading-relaxed">
            {note.content}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-claude-neutral-100 dark:border-claude-neutral-800">
        <span className="text-xs text-claude-neutral-400 dark:text-claude-neutral-500">
          {formatDate(note.updatedAt)}
        </span>
        <div className={`text-xs font-medium px-2 py-1 rounded-lg ${config.bg} ${config.color}`}>
          {note.type}
        </div>
      </div>
      {/* Delete Button - Moved to end and added z-10 to ensure it's on top */}
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 w-8 h-8 rounded-xl
                   bg-claude-neutral-100 dark:bg-claude-neutral-800
                   text-claude-neutral-500 dark:text-claude-neutral-400
                   opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100
                   transition-all duration-200
                   hover:bg-red-100 dark:hover:bg-red-900/30
                   hover:text-red-500 dark:hover:text-red-400
                   flex items-center justify-center z-10"
        title="Supprimer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </article>
  );
}
