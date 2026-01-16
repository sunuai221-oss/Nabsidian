'use client';

import { useState } from 'react';
import { Note, Folder, NoteType } from '@/lib/types';

interface EditNoteModalProps {
  note: Note;
  folders: Folder[];
  onClose: () => void;
  onSave: (updatedNote: Note) => void;
}

export default function EditNoteModal({ note, folders, onClose, onSave }: EditNoteModalProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [folder, setFolder] = useState(note.folder);
  const [newFolder, setNewFolder] = useState('');
  const [type, setType] = useState<NoteType>(note.type);
  const [tags, setTags] = useState(note.tags?.join(', ') || '');
  const [image, setImage] = useState<string | null>(note.metadata?.image || null);
  const [imagePreview, setImagePreview] = useState<string | null>(note.metadata?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 2 Mo');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const finalFolder = newFolder || folder || 'general';

    const metadata: { url?: string; image?: string; fileType?: string; language?: string } = {
      ...note.metadata,
    };
    if (type === 'link') {
      metadata.url = content;
    }
    if (image) {
      metadata.image = image;
    } else {
      delete metadata.image;
    }

    const updatedData = {
      title,
      content,
      folder: finalFolder,
      type,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      metadata,
      expectedUpdatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : String(note.updatedAt),
    };

    try {
      const res = await fetch(`/api/notes/${note.id}?folder=${encodeURIComponent(note.folder)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      const data = await res.json();
      const updatedNote: Note = {
        ...data.note,
        createdAt: new Date(data.note.createdAt),
        updatedAt: new Date(data.note.updatedAt),
      };

      onSave(updatedNote);
    } catch (err) {
      console.error('Error updating note:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-claude-neutral-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto
                   shadow-lifted animate-scale-in border border-claude-neutral-200 dark:border-claude-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-claude-neutral-900 px-6 py-5 border-b border-claude-neutral-200 dark:border-claude-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-claude-neutral-900 dark:text-claude-neutral-50">
              Modifier la note
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-claude-neutral-100 dark:hover:bg-claude-neutral-800 
                         text-claude-neutral-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2 text-claude-neutral-700 dark:text-claude-neutral-300">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-claude-neutral-200 dark:border-claude-neutral-700
                         bg-white dark:bg-claude-neutral-800 text-claude-neutral-900 dark:text-claude-neutral-50
                         focus:outline-none focus:border-claude-terracotta focus:ring-2 focus:ring-claude-terracotta/20
                         transition-all duration-200"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-2 text-claude-neutral-700 dark:text-claude-neutral-300">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NoteType)}
              className="w-full px-4 py-3 rounded-xl border border-claude-neutral-200 dark:border-claude-neutral-700
                         bg-white dark:bg-claude-neutral-800 text-claude-neutral-900 dark:text-claude-neutral-50
                         focus:outline-none focus:border-claude-terracotta focus:ring-2 focus:ring-claude-terracotta/20
                         transition-all duration-200"
            >
              <option value="markdown">📝 Markdown</option>
              <option value="link">🔗 Lien (YouTube, Twitter, etc.)</option>
              <option value="code">💻 Code</option>
              <option value="xml">📋 XML</option>
              <option value="file">📁 Fichier</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2 text-claude-neutral-700 dark:text-claude-neutral-300">
              {type === 'link' ? 'URL' : 'Contenu'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={8}
              placeholder={type === 'link' ? 'https://...' : type === 'xml' ? '<?xml version="1.0"?>...' : 'Entrez votre contenu...'}
              className="w-full px-4 py-3 rounded-xl border border-claude-neutral-200 dark:border-claude-neutral-700
                         bg-white dark:bg-claude-neutral-800 text-claude-neutral-900 dark:text-claude-neutral-50
                         focus:outline-none focus:border-claude-terracotta focus:ring-2 focus:ring-claude-terracotta/20
                         font-mono text-sm transition-all duration-200 resize-none"
            />
          </div>

          {/* Folder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-claude-neutral-700 dark:text-claude-neutral-300">Dossier</label>
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-claude-neutral-200 dark:border-claude-neutral-700
                           bg-white dark:bg-claude-neutral-800 text-claude-neutral-900 dark:text-claude-neutral-50
                           focus:outline-none focus:border-claude-terracotta focus:ring-2 focus:ring-claude-terracotta/20
                           transition-all duration-200"
              >
                <option value="">-- Sélectionner --</option>
                {folders.map((f) => (
                  <option key={f.path} value={f.path}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-claude-neutral-700 dark:text-claude-neutral-300">Nouveau dossier</label>
              <input
                type="text"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                placeholder="Nom du dossier..."
                className="w-full px-4 py-3 rounded-xl border border-claude-neutral-200 dark:border-claude-neutral-700
                           bg-white dark:bg-claude-neutral-800 text-claude-neutral-900 dark:text-claude-neutral-50
                           focus:outline-none focus:border-claude-terracotta focus:ring-2 focus:ring-claude-terracotta/20
                           transition-all duration-200"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2 text-claude-neutral-700 dark:text-claude-neutral-300">Tags (séparés par des virgules)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, typescript, api..."
              className="w-full px-4 py-3 rounded-xl border border-claude-neutral-200 dark:border-claude-neutral-700
                         bg-white dark:bg-claude-neutral-800 text-claude-neutral-900 dark:text-claude-neutral-50
                         focus:outline-none focus:border-claude-terracotta focus:ring-2 focus:ring-claude-terracotta/20
                         transition-all duration-200"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-2 text-claude-neutral-700 dark:text-claude-neutral-300">Image (optionnel)</label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="w-full max-h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-xl
                             transition-colors shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed 
                                border-claude-neutral-300 dark:border-claude-neutral-700 rounded-xl
                                hover:border-claude-terracotta dark:hover:border-claude-terracotta
                                transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <svg className="w-10 h-10 text-claude-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-claude-neutral-500">Cliquez pour ajouter une image (max 2 Mo)</span>
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-claude-terracotta to-claude-terracotta-dark
                         hover:from-claude-terracotta-dark hover:to-claude-terracotta-darker
                         text-white rounded-xl font-medium transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-sm hover:shadow-md hover:shadow-claude-terracotta/20"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 bg-claude-neutral-100 dark:bg-claude-neutral-800
                         hover:bg-claude-neutral-200 dark:hover:bg-claude-neutral-700
                         text-claude-neutral-700 dark:text-claude-neutral-300
                         rounded-xl font-medium transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
