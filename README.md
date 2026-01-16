# Nabsidian

Personal multi-format note management application with search and organization capabilities.

## Features

- 📝 Multi-format support (Markdown, links, code, files)
- 🔍 Global search across all notes
- 📁 Folder-based organization
- 🏷️ Tag system
- 🎬 Integrated YouTube preview
- 🐦 Integrated Twitter/X preview
- 🌙 Automatic dark mode
- ⚡ Minimalist and efficient interface

## Installation

```bash
cd nabsidian
npm install
```

## Getting Started

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`

## Structure

```
nabsidian/
├── app/              # Next.js pages
│   ├── api/          # API routes
│   └── page.tsx      # Main page
├── components/       # React components
├── lib/              # Utilities and types
└── data/             # Note storage (JSON)
    ├── security/
    ├── prompts/
    └── dev/
```

## Usage

1. Click on "+ New Note" to create a note
2. Select the type (Markdown, Link, Code, File)
3. Choose an existing folder or create a new one
4. Add tags for better organization
5. Use the search bar to find your notes

## Supported Note Types

- **Markdown**: Text notes with formatting
- **Link**: URLs with preview (YouTube, Twitter, websites)
- **Code**: Code snippets with syntax highlighting
- **File**: References to local files

## Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- File-based storage (JSON)
