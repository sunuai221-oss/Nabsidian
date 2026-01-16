import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { Folder } from '@/lib/types';
import {
	DATA_DIR,
	HttpError,
	assertValidFolderName,
	ensureDataDir,
	getFolderNoteCount,
	getFolderPath,
} from '@/lib/fsSafety';

export async function GET() {
  try {
    const folders: Folder[] = [];
		await ensureDataDir();

    const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        let folderName: string;
			try {
				folderName = assertValidFolderName(entry.name);
			} catch {
				continue;
			}
				const noteCount = await getFolderNoteCount(folderName);

        folders.push({
				name: folderName,
				path: folderName,
          noteCount,
        });
      }
    }

    return NextResponse.json({ folders });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json({ folders: [] });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderPathRaw = searchParams.get('path');

    if (!folderPathRaw) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      );
    }
		const folderName = assertValidFolderName(folderPathRaw);

		await ensureDataDir();
			const fullPath = getFolderPath(folderName);

    // Check if folder exists
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        return NextResponse.json(
          { error: 'Path is not a folder' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      );
    }

	    // Prevent deleting a folder that still contains notes.
			const noteCount = await getFolderNoteCount(folderName);
			if (noteCount > 0) {
				throw new HttpError(409, "Impossible de supprimer un dossier non vide. Supprimez d'abord les notes.");
			}

			try {
				await fs.rmdir(fullPath);
			} catch (err: any) {
				if (err?.code === 'ENOTEMPTY' || err?.code === 'EEXIST') {
					return NextResponse.json(
						{ error: 'Impossible de supprimer un dossier non vide.' },
						{ status: 409 }
					);
				}
				throw err;
			}

    return NextResponse.json({
      success: true,
			folderPath: folderName,
    });
  } catch (error) {
		if (error instanceof HttpError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
