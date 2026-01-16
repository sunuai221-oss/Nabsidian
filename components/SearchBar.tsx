'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Rechercher...' }: SearchBarProps) {
  return (
    <div className="relative group">
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-claude-neutral-400 dark:text-claude-neutral-500 transition-colors group-focus-within:text-claude-terracotta">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3.5 text-base rounded-2xl
                   bg-white dark:bg-claude-neutral-900
                   border border-claude-neutral-200 dark:border-claude-neutral-700
                   text-claude-neutral-900 dark:text-claude-neutral-50
                   placeholder-claude-neutral-400 dark:placeholder-claude-neutral-500
                   transition-all duration-200
                   focus:outline-none focus:border-claude-terracotta dark:focus:border-claude-terracotta-light
                   focus:shadow-lg focus:shadow-claude-terracotta/10"
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg
                     text-claude-neutral-400 hover:text-claude-neutral-600 dark:hover:text-claude-neutral-300
                     hover:bg-claude-neutral-100 dark:hover:bg-claude-neutral-800
                     transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
