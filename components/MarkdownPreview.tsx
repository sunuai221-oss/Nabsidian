'use client';

interface MarkdownPreviewProps {
  content: string;
  preview?: boolean;
}

export default function MarkdownPreview({ content, preview = false }: MarkdownPreviewProps) {
	const escapeHtml = (value: string) =>
		value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');

  // Convertir le markdown basique en HTML
  const formatContent = (text: string) => {
		const lines = text.split('\n');
		const out: string[] = [];
		let inList = false;

		const closeListIfNeeded = () => {
			if (inList) {
				out.push('</ul>');
				inList = false;
			}
		};

		for (const rawLine of lines) {
			const line = rawLine.replace(/\r$/, '');

			// Ignore fenced code markers for now (we don't render blocks, but we keep it safe).
			if (line.startsWith('```')) continue;

			// Titres
			if (line.startsWith('# ')) {
				closeListIfNeeded();
				out.push(
					`<h1 class="text-3xl font-bold mb-4 mt-6">${escapeHtml(line.substring(2))}</h1>`
				);
				continue;
			}
			if (line.startsWith('## ')) {
				closeListIfNeeded();
				out.push(
					`<h2 class="text-2xl font-bold mb-3 mt-5">${escapeHtml(line.substring(3))}</h2>`
				);
				continue;
			}
			if (line.startsWith('### ')) {
				closeListIfNeeded();
				out.push(
					`<h3 class="text-xl font-bold mb-2 mt-4">${escapeHtml(line.substring(4))}</h3>`
				);
				continue;
			}

			// Listes
			if (line.startsWith('- ')) {
				if (!inList) {
					out.push('<ul class="list-disc pl-6 my-2">');
					inList = true;
				}
				out.push(`<li class="mb-1">${escapeHtml(line.substring(2))}</li>`);
				continue;
			}

			// Ligne vide
			if (line.trim() === '') {
				closeListIfNeeded();
				out.push('<br/>');
				continue;
			}

			// Paragraphe normal
			closeListIfNeeded();
			out.push(`<p class="mb-2">${escapeHtml(line)}</p>`);
		}

		closeListIfNeeded();
		return out.join('\n');
  };

  const wrapperClass = preview
    ? 'prose dark:prose-invert max-w-none'
    : 'prose prose-lg dark:prose-invert max-w-none';
  const contentClass = preview
    ? 'whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-300 dark:border-gray-700'
    : 'whitespace-pre-wrap text-base leading-7';

  return (
    <div className={wrapperClass}>
      <div
        className={contentClass}
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
    </div>
  );
}
