import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import type { Dirent } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { Note } from '@/lib/types';
import {
	DATA_DIR,
	HttpError,
	assertValidFolderName,
	assertValidNoteMetadata,
	atomicWriteFile,
	ensureDataDir,
	getFolderPath,
	getNotePath,
} from '@/lib/fsSafety';

async function getAllNotes(): Promise<Note[]> {
	await ensureDataDir();
	const notes: Note[] = [];

	const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;

		let folderName: string;
		try {
			folderName = assertValidFolderName(entry.name);
		} catch {
			// Ignore unexpected folder names.
			continue;
		}

		const folderPath = getFolderPath(folderName);
		let files: Dirent[] = [];
		try {
			files = await fs.readdir(folderPath, { withFileTypes: true });
		} catch {
			continue;
		}

		for (const file of files) {
			if (!file.isFile()) continue;
			if (!file.name.endsWith('.json')) continue;

			const fullPath = path.join(folderPath, file.name);
			try {
				const content = await fs.readFile(fullPath, 'utf-8');
				const note = JSON.parse(content);
				// Source of truth: file location.
				note.folder = folderName;
				note.createdAt = new Date(note.createdAt);
				note.updatedAt = new Date(note.updatedAt);
				notes.push(note);
			} catch (err) {
				console.error(`Error reading note ${fullPath}:`, err);
			}
		}
	}

	return notes;
}

export async function GET() {
	try {
		const notes = await getAllNotes();
		return NextResponse.json({ notes });
	} catch (error) {
		console.error('Error fetching notes:', error);
		return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const folder = assertValidFolderName(body?.folder ?? 'general');
		assertValidNoteMetadata(body.metadata);

		const note: Note = {
			...body,
			id: randomUUID(),
			createdAt: new Date(),
			updatedAt: new Date(),
			folder,
		};

		await ensureDataDir();
		const folderPath = getFolderPath(folder);
		await fs.mkdir(folderPath, { recursive: true });
		const notePath = getNotePath(folder, note.id);
		await atomicWriteFile(notePath, JSON.stringify(note, null, 2));

		return NextResponse.json({ note });
	} catch (error) {
		if (error instanceof HttpError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		console.error('Error creating note:', error);
		return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
	}
}
