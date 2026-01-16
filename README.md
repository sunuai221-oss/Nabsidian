# Nabsidian

Application personnelle de gestion de notes multi-formats avec recherche et organisation.

## Fonctionnalités

- 📝 Support multi-formats (Markdown, liens, code, fichiers)
- 🔍 Recherche globale dans toutes les notes
- 📁 Organisation par dossiers
- 🏷️ Système de tags
- 🎬 Aperçu YouTube intégré
- 🐦 Aperçu Twitter/X intégré
- 🌙 Dark mode automatique
- ⚡ Interface minimaliste et efficace

## Installation

```bash
cd nabsidian
npm install
```

## Démarrage

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## Structure

```
nabsidian/
├── app/              # Pages Next.js
│   ├── api/          # API routes
│   └── page.tsx      # Page principale
├── components/       # Composants React
├── lib/              # Utilitaires et types
└── data/             # Stockage des notes (JSON)
    ├── security/
    ├── prompts/
    └── dev/
```

## Utilisation

1. Cliquez sur "+ Nouvelle note" pour créer une note
2. Sélectionnez le type (Markdown, Lien, Code, Fichier)
3. Choisissez un dossier existant ou créez-en un nouveau
4. Ajoutez des tags pour mieux organiser
5. Utilisez la barre de recherche pour retrouver vos notes

## Types de notes supportés

- **Markdown** : Notes texte avec formatage
- **Lien** : URLs avec aperçu (YouTube, Twitter, sites web)
- **Code** : Snippets de code avec coloration
- **Fichier** : Références vers des fichiers locaux

## Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Stockage fichier (JSON)
