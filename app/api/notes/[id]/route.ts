import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import {
	DATA_DIR,
	HttpError,
	assertValidFolderName,
	assertValidNoteId,
	assertValidNoteMetadata,
	atomicWriteFile,
	ensureDataDir,
	findNotePathById,
	getNotePath,
} from '@/lib/fsSafety';

async function resolveNotePath(id: string, folder?: string | null): Promise<string | null> {
	const safeId = assertValidNoteId(id);
	if (folder) {
		const safeFolder = assertValidFolderName(folder);
		const candidate = getNotePath(safeFolder, safeId);
		try {
			await fs.access(candidate);
			return candidate;
		} catch {
			// fall back to scan
		}
	}
	return findNotePathById(safeId);
}

function getFolderFromNotePath(notePath: string): string {
	const rel = path.relative(DATA_DIR, notePath);
	const dir = path.dirname(rel);
	if (!dir || dir === '.' || dir === path.sep) return 'general';
	// 1-level folders only.
	return dir.split(path.sep)[0] || 'general';
}

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;
		await ensureDataDir();
		const folder = request.nextUrl.searchParams.get('folder');
		const notePath = await resolveNotePath(id, folder);

		if (!notePath) {
			return NextResponse.json({ error: 'Note not found' }, { status: 404 });
		}

		await fs.unlink(notePath);
		return NextResponse.json({ success: true });
	} catch (error) {
		// If the file disappeared between resolve and unlink, surface as a 404.
		if ((error as any)?.code === 'ENOENT') {
			return NextResponse.json({ error: 'Note not found' }, { status: 404 });
		}
		if (error instanceof HttpError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		console.error('Error deleting note:', error);
		return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
	}
}

export async function PUT(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const body = await request.json();
		const bodyObj: any = body && typeof body === 'object' ? body : {};
		const { expectedUpdatedAt, ...bodyPatch } = bodyObj;

		if (bodyPatch.metadata) {
			assertValidNoteMetadata(bodyPatch.metadata);
		}

		const { id } = await context.params;
		const safeId = assertValidNoteId(id);
		await ensureDataDir();
		const folder = request.nextUrl.searchParams.get('folder');
		const resolved = await resolveNotePath(safeId, folder);

		if (!resolved) {
			return NextResponse.json({ error: 'Note not found' }, { status: 404 });
		}

		let notePath = resolved;

		const existingContent = await fs.readFile(notePath, 'utf-8');
		const existingNote = JSON.parse(existingContent);

		// Optional optimistic concurrency guard.
		// Client can pass `expectedUpdatedAt` (ISO string). If the persisted note differs,
		// we reject with 409 to prevent lost updates.
		if (typeof expectedUpdatedAt === 'string') {
			const expected = expectedUpdatedAt;
			const current = typeof existingNote?.updatedAt === 'string' ? existingNote.updatedAt : null;
			if (!current || current !== expected) {
				throw new HttpError(
					409,
					"Conflit: cette note a été modifiée ailleurs. Rechargez la note puis réessayez."
				);
			}
		}

		// Folder counters in the sidebar are computed from the filesystem (see /api/folders).
		// If the note's folder changes, we must move the JSON file to the new folder.
		const currentFolder = getFolderFromNotePath(notePath);
		const requestedFolderRaw = (typeof bodyPatch?.folder === 'string' ? bodyPatch.folder : null) ?? currentFolder;
		const requestedFolder = assertValidFolderName(requestedFolderRaw);

		const updatedNote = {
			...existingNote,
			...bodyPatch,
			id: safeId,
			// Ensure the folder saved in JSON matches the file location.
			folder: requestedFolder,
			updatedAt: new Date(),
		};

		// If the folder changed, prefer a write+unlink approach so we don't lose the
		// original note if the write fails mid-way.
		if (requestedFolder !== currentFolder) {
			const targetDir = path.join(DATA_DIR, requestedFolder);
			const targetPath = path.join(targetDir, `${safeId}.json`);
			await fs.mkdir(targetDir, { recursive: true });
			await atomicWriteFile(targetPath, JSON.stringify(updatedNote, null, 2));
			try {
				await fs.unlink(notePath);
			} catch (err: any) {
				// If source vanished, ignore (we already wrote the target).
				if (err?.code !== 'ENOENT') throw err;
			}
			notePath = targetPath;
		} else {
			await atomicWriteFile(notePath, JSON.stringify(updatedNote, null, 2));
		}

		return NextResponse.json({ note: updatedNote });
	} catch (error) {
		if (error instanceof HttpError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		console.error('Error updating note:', error);
		return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
	}
}

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await context.params;
		await ensureDataDir();
		const folder = request.nextUrl.searchParams.get('folder');
		const notePath = await resolveNotePath(id, folder);

		if (!notePath) {
			return NextResponse.json({ error: 'Note not found' }, { status: 404 });
		}

		const raw = await fs.readFile(notePath, 'utf-8');
		return NextResponse.json({ note: JSON.parse(raw) });
	} catch (error: any) {
		if (error?.code === 'ENOENT') {
			return NextResponse.json({ error: 'Note not found' }, { status: 404 });
		}
		if (error instanceof HttpError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		console.error('Error fetching note by id:', error);
		return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
	}
}
