# Nabsidian - Claude Code Guidelines

## Project Overview

Nabsidian is a personal multi-format note management application with search and organization capabilities. It's built with Next.js 14, React 18, TypeScript, and Tailwind CSS, featuring a file-based JSON storage system. The application is fully internationalized in English and follows WCAG accessibility standards.

## Tech Stack

- **Framework**: Next.js 14.2.0 (App Router)
- **Language**: TypeScript 5.4.0
- **UI**: React 18.3.1, React DOM 18.3.1, Tailwind CSS 3.4.4
- **Styling**: PostCSS 8.4.38, Autoprefixer 10.4.19
- **Storage**: JSON file-based storage in `data/` directory

## Project Structure

```
nabsidian/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for CRUD operations
│   │   ├── folders/       # Folder management endpoints
│   │   └── notes/         # Note management endpoints (create, read, update, delete)
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── EditNoteModal.tsx  # Modal for editing notes
│   ├── LinkPreview.tsx    # Generic link preview component
│   ├── MarkdownPreview.tsx # Markdown rendering component
│   ├── NoteCard.tsx       # Individual note display card
│   ├── NoteDetailModal.tsx # Modal for viewing note details
│   ├── SearchBar.tsx      # Global search functionality
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── TwitterPreview.tsx # Twitter/X link preview
│   └── YouTubePreview.tsx # YouTube video preview
├── lib/                   # Utilities and type definitions
│   ├── types.ts          # TypeScript type definitions
│   ├── utils.ts          # Helper functions
│   └── fsSafety.ts       # File system safety utilities
└── data/                 # JSON storage for notes
    ├── security/         # Security-related notes
    ├── prompts/          # AI prompt notes
    └── dev/              # Development notes
```

## Key Features

1. **Multi-format Note Support**:
   - Markdown notes with formatting
   - Link notes with rich previews (YouTube, Twitter, general web)
   - Code snippets with syntax highlighting
   - File references to local files

2. **Organization**:
   - Folder-based organization
   - Tag system for categorization
   - Global search across all notes

3. **UI/UX**:
   - Automatic dark mode
   - Minimalist, efficient interface
   - Modal-based editing and viewing
   - Full accessibility support (ARIA labels, keyboard navigation)
   - Responsive design for all screen sizes

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow React functional component patterns with hooks
- Prefer server components unless client interactivity is needed
- Use Tailwind CSS utility classes for styling
- Maintain consistent naming conventions (PascalCase for components, camelCase for functions)
- All UI text must be in English
- Follow accessibility best practices (ARIA labels, proper form labels with htmlFor)

### Component Patterns

- **Server Components**: Default for static content and data fetching
- **Client Components**: Mark with `'use client'` when using useState, useEffect, or event handlers
- **API Routes**: Use Next.js Route Handlers in the `app/api/` directory

### State Management

- Use React hooks (useState, useEffect) for component-level state
- No external state management library currently in use
- API calls are made directly from components to `/api` routes

### File Organization

- Place reusable components in `/components`
- Place types in `/lib/types.ts`
- Place utility functions in `/lib/utils.ts`
- API routes follow REST conventions in `/app/api`

### Data Storage

- Notes are stored as JSON files in the `/data` directory
- Organized by category folders (security, prompts, dev, etc.)
- File system operations are handled server-side through API routes

### Styling Conventions

- Use Tailwind CSS utility classes
- Follow the existing dark mode color scheme
- Maintain responsive design patterns
- Keep the minimalist aesthetic consistent
- Use the custom color palette:
  - `claude-terracotta` for primary actions
  - `claude-neutral-*` for backgrounds and text
  - Consistent spacing and rounded corners (rounded-xl, rounded-2xl)

## Common Tasks

### Adding a New Note Type

1. Update the `NoteType` type in `/lib/types.ts`
2. Add handling logic in `/components/NoteCard.tsx`
3. Create a new preview component if needed in `/components/`
4. Update the note creation flow in the main page

### Adding a New API Endpoint

1. Create a new directory in `/app/api/`
2. Add a `route.ts` file with GET, POST, PUT, DELETE handlers as needed
3. Follow the existing patterns in `/app/api/notes/route.ts`

### Adding a New Component

1. Create the component file in `/components/`
2. Use TypeScript with proper prop types
3. Add `'use client'` directive if client-side features are needed
4. Import and use in the appropriate parent component

## Important Notes

- The application uses file-based JSON storage, not a database
- All note data is stored in the `/data` directory
- The app runs on port 3000 by default (`http://localhost:3000`)
- The UI is fully in English for international accessibility
- All components follow WCAG accessibility guidelines
- The project is version controlled with Git and hosted on GitHub

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## When Working with This Project

1. **Preserve the minimalist design** - Don't over-engineer or add unnecessary complexity
2. **Maintain TypeScript types** - Always update types when modifying data structures
3. **Follow the existing patterns** - Match the code style and component structure already in place
4. **Test with JSON storage** - Remember that data persistence is file-based, not database-driven
5. **Respect the file structure** - Keep components, API routes, and utilities properly organized
6. **Consider server vs client** - Default to server components unless client interactivity is required
7. **Accessibility first** - Always add proper ARIA labels, link labels with inputs using htmlFor/id
8. **English only** - All UI text, comments, and user-facing content must be in English

## Accessibility Guidelines

### Form Elements
- Always use `htmlFor` attribute on `<label>` elements linked to input `id`
- Example: `<label htmlFor="note-title">Title</label>` with `<input id="note-title" />`

### Interactive Elements
- All icon-only buttons must have `aria-label` attributes
- Example: `<button aria-label="Close modal">...</button>`
- Interactive divs/articles should be replaced with proper semantic HTML (button, a, etc.)

### Testing
- Run Snyk security checks regularly to catch accessibility issues
- Test keyboard navigation (Tab, Enter, Escape keys)
- Verify all form fields are accessible with screen readers

## Git Workflow

- Repository: https://github.com/sunuai221-oss/Nabsidian
- Main branch: `main`
- Commit messages should be descriptive and include Co-Authored-By tag
- Always add `.gitignore` entries for temporary files and IDE configurations
