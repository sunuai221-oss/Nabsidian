import fs from 'fs/promises';
import type { Dirent } from 'fs';
import path from 'path';

export class HttpError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

export const DATA_DIR = path.join(process.cwd(), 'data');

export async function ensureDataDir() {
	try {
		await fs.access(DATA_DIR);
	} catch {
		await fs.mkdir(DATA_DIR, { recursive: true });
	}
}

// Dossier 1 niveau: un nom simple. Interdit: /, \\, chemins absolus, . et .., et caractères invalides Windows.
export function assertValidFolderName(raw: unknown): string {
	if (typeof raw !== 'string') {
		throw new HttpError(400, 'Invalid folder name');
	}

	const folder = raw.trim();
	if (!folder) {
		throw new HttpError(400, 'Folder name is required');
	}
	if (folder === '.' || folder === '..') {
		throw new HttpError(400, 'Invalid folder name');
	}
	if (folder.includes('/') || folder.includes('\\')) {
		throw new HttpError(400, 'Invalid folder name');
	}
	// Windows reserved/invalid chars and control chars.
	if (/[<>:"/\\|?*\x00-\x1F]/.test(folder)) {
		throw new HttpError(400, 'Invalid folder name');
	}
	// Windows does not allow folder names ending with dot or space.
	if (folder.endsWith(' ') || folder.endsWith('.')) {
		throw new HttpError(400, 'Invalid folder name');
	}
	if (path.isAbsolute(folder)) {
		throw new HttpError(400, 'Invalid folder name');
	}
	return folder;
}

// Allow existing numeric IDs (legacy Date.now()) and future UUIDs.
export function assertValidNoteId(raw: unknown): string {
	if (typeof raw !== 'string') {
		throw new HttpError(400, 'Invalid note id');
	}
	const id = raw.trim();
	if (!id) {
		throw new HttpError(400, 'Invalid note id');
	}
	if (id.length > 128) {
		throw new HttpError(400, 'Invalid note id');
	}
	if (id.includes('/') || id.includes('\\')) {
		throw new HttpError(400, 'Invalid note id');
	}
	if (!/^[a-zA-Z0-9-]+$/.test(id)) {
		throw new HttpError(400, 'Invalid note id');
	}
	return id;
}

export function getFolderPath(folder: string): string {
	return path.join(DATA_DIR, assertValidFolderName(folder));
}

export async function getFolderNoteCount(folder: string): Promise<number> {
	await ensureDataDir();
	const folderPath = getFolderPath(folder);
	try {
		const files = await fs.readdir(folderPath, { withFileTypes: true });
		return files.filter((f) => f.isFile() && f.name.endsWith('.json')).length;
	} catch {
		return 0;
	}
}

export function getNotePath(folder: string, id: string): string {
	const safeFolder = assertValidFolderName(folder);
	const safeId = assertValidNoteId(id);
	return path.join(DATA_DIR, safeFolder, `${safeId}.json`);
}

export async function atomicWriteFile(targetPath: string, content: string) {
	const dir = path.dirname(targetPath);
	const base = path.basename(targetPath);
	const tmpPath = path.join(dir, `.${base}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`);

	try {
		await fs.writeFile(tmpPath, content, 'utf-8');
		// On Windows, rename fails if destination exists.
		try {
			await fs.access(targetPath);
			await fs.unlink(targetPath);
		} catch {
			// ignore
		}
		await fs.rename(tmpPath, targetPath);
	} catch (err) {
		try {
			await fs.unlink(tmpPath);
		} catch {
			// ignore
		}
		throw err;
	}
}

export async function findNotePathById(rawId: string): Promise<string | null> {
	const id = assertValidNoteId(rawId);
	await ensureDataDir();

	let entries: Dirent[] = [];
	try {
		entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
	} catch {
		return null;
	}

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		let folder: string;
		try {
			folder = assertValidFolderName(entry.name);
		} catch {
			continue;
		}
		const candidate = path.join(DATA_DIR, folder, `${id}.json`);
		try {
			await fs.access(candidate);
			return candidate;
		} catch {
			// continue
		}
	}
	return null;
}

// Limit metadata size, especially for Base64 images.
// 2.5MB limit allows for slightly more than 2MB binary data.
const MAX_METADATA_SIZE = 2.5 * 1024 * 1024;

export function assertValidNoteMetadata(metadata: unknown): void {
	if (!metadata) return; // Optional field

	if (typeof metadata !== 'object' || metadata === null) {
		throw new HttpError(400, 'Invalid metadata format');
	}

	const stringified = JSON.stringify(metadata);
	if (stringified.length > MAX_METADATA_SIZE) {
		throw new HttpError(413, 'Metadata too large (max 2.5MB). Please use a smaller image.');
	}

	const meta = metadata as Record<string, unknown>;

	// Validate specific fields if present
	if (meta.url !== undefined && typeof meta.url !== 'string') {
		throw new HttpError(400, 'Metadata URL must be a string');
	}
	if (meta.image !== undefined && typeof meta.image !== 'string') {
		throw new HttpError(400, 'Metadata image must be a string');
	}
}
