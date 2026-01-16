'use client';

import { useState } from 'react';
import { Folder } from '@/lib/types';

interface SidebarProps {
  folders: Folder[];
  currentFolder: string | null;
  onFolderSelect: (folder: string | null) => void;
  onFolderDelete?: (folderPath: string) => void;
}

export default function Sidebar({ folders, currentFolder, onFolderSelect, onFolderDelete }: SidebarProps) {
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent, folder: Folder) => {
    e.stopPropagation();
    setFolderToDelete(folder);
  };

  const confirmDelete = async () => {
    if (!folderToDelete) return;
    if (folderToDelete.noteCount > 0) {
      alert("Impossible de supprimer un dossier non vide. Supprime d'abord les notes.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/folders?path=${encodeURIComponent(folderToDelete.path)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        if (currentFolder === folderToDelete.path) {
          onFolderSelect(null);
        }
        onFolderDelete?.(folderToDelete.path);
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la suppression du dossier');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Erreur lors de la suppression du dossier');
    } finally {
      setIsDeleting(false);
      setFolderToDelete(null);
    }
  };

  return (
    <>
      <aside className="w-72 h-screen flex flex-col bg-claude-neutral-50 dark:bg-claude-neutral-950 border-r border-claude-neutral-200 dark:border-claude-neutral-800">
        {/* Header */}
        <div className="p-6 border-b border-claude-neutral-200 dark:border-claude-neutral-800">
          <h2 className="text-lg font-semibold text-claude-neutral-900 dark:text-claude-neutral-50 flex items-center gap-2">
            <svg className="w-5 h-5 text-claude-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Dossiers
          </h2>
        </div>

        {/* Folder List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* All Notes Button */}
          <button
            onClick={() => onFolderSelect(null)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 group ${currentFolder === null
              ? 'bg-gradient-to-r from-claude-terracotta to-claude-terracotta-dark text-white shadow-md shadow-claude-terracotta/20'
              : 'hover:bg-claude-neutral-100 dark:hover:bg-claude-neutral-900 text-claude-neutral-700 dark:text-claude-neutral-300'
              }`}
          >
            <svg className={`w-5 h-5 flex-shrink-0 ${currentFolder === null ? 'text-white' : 'text-claude-terracotta'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="font-medium">Toutes les notes</span>
          </button>

          {/* Folder Items */}
          {folders.map((folder) => (
            <div
              key={folder.path}
              onClick={() => onFolderSelect(folder.path)}
              className={`group relative w-full text-left px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between ${currentFolder === folder.path
                ? 'bg-gradient-to-r from-claude-terracotta to-claude-terracotta-dark text-white shadow-md shadow-claude-terracotta/20'
                : 'hover:bg-claude-neutral-100 dark:hover:bg-claude-neutral-900 text-claude-neutral-700 dark:text-claude-neutral-300'
                }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <svg className={`w-5 h-5 flex-shrink-0 ${currentFolder === folder.path ? 'text-white' : 'text-claude-terracotta'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="font-medium truncate">{folder.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${currentFolder === folder.path
                  ? 'bg-white/20 text-white'
                  : 'bg-claude-neutral-200 dark:bg-claude-neutral-800 text-claude-neutral-500 dark:text-claude-neutral-400'
                  }`}>
                  {folder.noteCount}
                </span>
                <button
                  onClick={(e) => handleDeleteClick(e, folder)}
                  className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 ${currentFolder === folder.path
                    ? 'hover:bg-white/20 text-white'
                    : 'hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400'
                    }`}
                  title="Supprimer le dossier"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Delete Confirmation Modal */}
      {folderToDelete && (
        <div
          className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => !isDeleting && setFolderToDelete(null)}
        >
          <div
            className="bg-white dark:bg-claude-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-lifted animate-scale-in border border-claude-neutral-200 dark:border-claude-neutral-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-claude-neutral-900 dark:text-claude-neutral-50">
                Supprimer le dossier
              </h3>
            </div>

            <p className="mb-4 text-claude-neutral-600 dark:text-claude-neutral-400">
              Êtes-vous sûr de vouloir supprimer <strong className="text-claude-neutral-900 dark:text-claude-neutral-100">"{folderToDelete.name}"</strong> ?
            </p>

            {folderToDelete.noteCount > 0 && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Impossible :</strong> ce dossier contient <strong>{folderToDelete.noteCount}</strong> note{folderToDelete.noteCount > 1 ? 's' : ''}.
                  Supprimez ou déplacez les notes d'abord.
                </p>
              </div>
            )}

            <p className="mb-6 text-sm text-claude-neutral-500">
              Cette action est irréversible.
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={isDeleting || folderToDelete.noteCount > 0}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                           disabled:hover:bg-red-500 shadow-sm hover:shadow-md"
              >
                {isDeleting ? 'Suppression...' : folderToDelete.noteCount > 0 ? 'Dossier non vide' : 'Supprimer'}
              </button>
              <button
                onClick={() => setFolderToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-claude-neutral-100 dark:bg-claude-neutral-800 text-claude-neutral-700 dark:text-claude-neutral-300
                           rounded-xl font-medium transition-all duration-200 hover:bg-claude-neutral-200 dark:hover:bg-claude-neutral-700
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
