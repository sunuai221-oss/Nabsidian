'use client';

import { useEffect, useState } from 'react';
import { Note, Folder } from '@/lib/types';
import { searchNotes } from '@/lib/utils';
import SearchBar from '@/components/SearchBar';
import Sidebar from '@/components/Sidebar';
import NoteCard from '@/components/NoteCard';
import NoteDetailModal from '@/components/NoteDetailModal';
import EditNoteModal from '@/components/EditNoteModal';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loadingNoteId, setLoadingNoteId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
    fetchFolders();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      const notesWithDates = (data.notes || []).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      setNotes(notesWithDates);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetch('/api/folders');
      const data = await res.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      setLoadingNoteId(noteId);
      const note =
        notes.find((n) => n.id === noteId) ??
        (selectedNote?.id === noteId ? selectedNote : null);

      const makeUrl = (withFolder: boolean) => {
        if (withFolder && note?.folder) {
          return `/api/notes/${noteId}?folder=${encodeURIComponent(note.folder)}`;
        }
        return `/api/notes/${noteId}`;
      };

      let res = await fetch(makeUrl(true), { method: 'DELETE' });
      if (!res.ok && note?.folder) {
        res = await fetch(makeUrl(false), { method: 'DELETE' });
      }

      if (res.ok) {
        await fetchNotes();
        await fetchFolders();
      } else {
        let details = '';
        try {
          const data = await res.json();
          details = data?.error ? `\n${data.error}` : '';
        } catch { }
        console.error('Delete note failed', { noteId, status: res.status });
        alert(`Erreur lors de la suppression de la note${details}`);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Erreur lors de la suppression de la note');
    } finally {
      setLoadingNoteId(null);
    }
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(null);
    setEditingNote(note);
  };

  const handleSaveEdit = (updatedNote: Note) => {
    setNotes(prevNotes =>
      prevNotes.map(n => n.id === updatedNote.id ? updatedNote : n)
    );
    setEditingNote(null);
    fetchFolders();
  };

  const handleFolderDelete = () => {
    fetchNotes();
    fetchFolders();
  };

  const filteredNotes = searchNotes(
    currentFolder ? notes.filter(n => n.folder === currentFolder) : notes,
    searchQuery
  );

  const fetchNoteById = async (note: Note): Promise<Note | null> => {
    try {
      const makeUrl = (withFolder: boolean) => {
        if (withFolder && note.folder) {
          return `/api/notes/${note.id}?folder=${encodeURIComponent(note.folder)}`;
        }
        return `/api/notes/${note.id}`;
      };

      let res = await fetch(makeUrl(true));
      if (!res.ok && note.folder) {
        res = await fetch(makeUrl(false));
      }
      if (!res.ok) return null;
      const data = await res.json();
      if (!data?.note) return null;
      return {
        ...data.note,
        createdAt: new Date(data.note.createdAt),
        updatedAt: new Date(data.note.updatedAt),
      } as Note;
    } catch (error) {
      console.error('Error fetching note by id:', error);
      return null;
    }
  };

  const handleOpenNote = async (note: Note) => {
    setSelectedNote(note);
    setLoadingNoteId(note.id);
    try {
      const fullNote = await fetchNoteById(note);
      if (!fullNote) return;
      setSelectedNote((current) => (current?.id === note.id ? fullNote : current));
    } finally {
      setLoadingNoteId((current) => (current === note.id ? null : current));
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-claude-neutral-950">
      <Sidebar
        folders={folders}
        currentFolder={currentFolder}
        onFolderSelect={setCurrentFolder}
        onFolderDelete={handleFolderDelete}
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-claude-terracotta via-claude-terracotta-dark to-claude-terracotta bg-clip-text text-transparent">
                  Nabsidian
                </h1>
                <p className="text-claude-neutral-500 dark:text-claude-neutral-400 mt-1">
                  {notes.length} note{notes.length !== 1 ? 's' : ''} • {folders.length} dossier{folders.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowNewNoteModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-claude-terracotta to-claude-terracotta-dark
                           hover:from-claude-terracotta-dark hover:to-claude-terracotta-darker
                           text-white rounded-xl font-medium transition-all duration-200
                           shadow-md hover:shadow-lg hover:shadow-claude-terracotta/20
                           flex items-center gap-2 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle note
              </button>
            </div>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher dans vos notes..."
            />
          </header>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-claude-neutral-100 dark:bg-claude-neutral-900 flex items-center justify-center">
                <svg className="w-10 h-10 text-claude-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              {searchQuery ? (
                <div>
                  <p className="text-xl font-medium text-claude-neutral-700 dark:text-claude-neutral-300 mb-2">
                    Aucune note trouvée
                  </p>
                  <p className="text-claude-neutral-500 dark:text-claude-neutral-400">
                    Aucun résultat pour "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xl font-medium text-claude-neutral-700 dark:text-claude-neutral-300 mb-2">
                    Aucune note pour le moment
                  </p>
                  <p className="text-claude-neutral-500 dark:text-claude-neutral-400 mb-6">
                    Créez votre première note pour commencer
                  </p>
                  <button
                    onClick={() => setShowNewNoteModal(true)}
                    className="px-5 py-2.5 bg-claude-neutral-200 dark:bg-claude-neutral-800
                               hover:bg-claude-terracotta hover:text-white
                               text-claude-neutral-700 dark:text-claude-neutral-300
                               rounded-xl font-medium transition-all duration-200"
                  >
                    Créer une note
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note, index) => (
                <div
                  key={note.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <NoteCard
                    note={note}
                    onClick={() => handleOpenNote(note)}
                    onDelete={handleDeleteNote}
                  />
                </div>
              ))}
            </div>
          )}

          {selectedNote && (
            <NoteDetailModal
              note={selectedNote}
              isLoadingFullContent={loadingNoteId === selectedNote.id}
              onClose={() => setSelectedNote(null)}
              onDelete={handleDeleteNote}
              onEdit={handleEditNote}
            />
          )}

          {editingNote && (
            <EditNoteModal
              note={editingNote}
              folders={folders}
              onClose={() => setEditingNote(null)}
              onSave={handleSaveEdit}
            />
          )}

          {showNewNoteModal && (
            <NewNoteModal
              onClose={() => setShowNewNoteModal(false)}
              onSave={() => {
                setShowNewNoteModal(false);
                fetchNotes();
                fetchFolders();
              }}
              folders={folders}
            />
          )}
        </div>
      </main>
    </div>
  );
}

interface NewNoteModalProps {
  onClose: () => void;
  onSave: () => void;
  folders: Folder[];
}

function NewNoteModal({ onClose, onSave, folders }: NewNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folder, setFolder] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [type, setType] = useState<'markdown' | 'link' | 'code' | 'file' | 'xml'>('markdown');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

    const finalFolder = newFolder || folder || 'general';

    const metadata: { url?: string; image?: string } = {};
    if (type === 'link') {
      metadata.url = content;
    }
    if (image) {
      metadata.image = image;
    }

    const note = {
      title,
      content,
      folder: finalFolder,
      type,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      metadata,
    };

    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      onSave();
    } catch (error) {
      console.error('Error creating note:', error);
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
              Nouvelle note
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
              onChange={(e) => setType(e.target.value as any)}
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
              rows={6}
              placeholder={type === 'link' ? 'https://...' : 'Entrez votre contenu...'}
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
              className="flex-1 px-5 py-3 bg-gradient-to-r from-claude-terracotta to-claude-terracotta-dark
                         hover:from-claude-terracotta-dark hover:to-claude-terracotta-darker
                         text-white rounded-xl font-medium transition-all duration-200
                         shadow-sm hover:shadow-md hover:shadow-claude-terracotta/20"
            >
              Créer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 bg-claude-neutral-100 dark:bg-claude-neutral-800
                         hover:bg-claude-neutral-200 dark:hover:bg-claude-neutral-700
                         text-claude-neutral-700 dark:text-claude-neutral-300
                         rounded-xl font-medium transition-all duration-200"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
