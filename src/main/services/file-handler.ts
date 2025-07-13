import fs from "node:fs";
import path from "node:path";
import { FileResult } from "../../shared/types";
import { SUPPORTED_FILE_TYPES } from "../../shared/constants";
import { aiService } from "./ai";
import { dialog } from "electron";

class FileHandlerService {
	private uploadDir = "uploads";

	constructor() {
		this.ensureUploadDir();
	}

	private ensureUploadDir() {
		if (!fs.existsSync(this.uploadDir)) {
			fs.mkdirSync(this.uploadDir, { recursive: true });
		}
	}

	async pickFile(): Promise<string | null> {
		const result = await dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [
				{
					name: 'Supported Files',
					extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'pdf', 'csv', 'mp3', 'wav', 'ogg', 'json', 'xml', 'js', 'py', 'txt', 'html', 'css', 'md']
				}
			],
		});

		if(result.canceled || result.filePaths.length !== 1) {
			return null;
		}
		
		return result.filePaths[0];
	}	

	async processFile(filePath: string, prompt?: string): Promise<FileResult> {
		const mimeType = this.getMimeType(filePath);
		
		try {
			if (!SUPPORTED_FILE_TYPES.includes(mimeType as any)) {
				return {
					text: `Unsupported file type: ${mimeType}`,
					fileName: path.basename(filePath),
					fileType: mimeType,
					error: 'Unsupported file type',
				};
			}

			// Read file and convert to base64
			const buffer = fs.readFileSync(filePath);
			const base64File = buffer.toString("base64");

			// Copy file to uploads directory
			const fileName = path.basename(filePath);
			const timestamp = Date.now();
			const uploadPath = path.join(this.uploadDir, `${timestamp}_${fileName}`);
			fs.copyFileSync(filePath, uploadPath);

			// Process with AI
			const aiResponse = await aiService.readFile(base64File, mimeType, prompt);

			return {
				text: aiResponse.text,
				fileName,
				fileType: mimeType,
				error: aiResponse.error,
			};
		} catch (error) {
			console.error('File processing error:', error);
			return {
				text: "Failed to process file",
				fileName: path.basename(filePath),
				fileType: mimeType,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	private getMimeType(filePath: string): string {
		const ext = path.extname(filePath).toLowerCase();
		
		const mimeTypes: Record<string, string> = {
			'.pdf': 'application/pdf',
			'.js': 'text/javascript',
			'.py': 'text/x-python',
			'.txt': 'text/plain',
			'.html': 'text/html',
			'.htm': 'text/html',
			'.css': 'text/css',
			'.md': 'text/md',
			'.csv': 'text/csv',
			'.xml': 'text/xml',
			'.rtf': 'text/rtf',
			'.png': 'image/png',
			'.jpg': 'image/jpeg',
			'.jpeg': 'image/jpeg',
			'.gif': 'image/gif',
			'.webp': 'image/webp',
			'.svg': 'image/svg+xml',
			'.tiff': 'image/tiff',
			'.tif': 'image/tiff',
		};

		return mimeTypes[ext] || 'application/octet-stream';
	}

	getUploadDir(): string {
		return this.uploadDir;
	}

	setUploadDir(dir: string) {
		this.uploadDir = dir;
		this.ensureUploadDir();
	}

	cleanupOldFiles(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
		// Clean up files older than maxAge (default: 7 days)
		try {
			const files = fs.readdirSync(this.uploadDir);
			const now = Date.now();

			for (const file of files) {
				const filePath = path.join(this.uploadDir, file);
				const stats = fs.statSync(filePath);
				
				if (now - stats.mtime.getTime() > maxAge) {
					fs.unlinkSync(filePath);
					console.log(`Cleaned up old file: ${file}`);
				}
			}
		} catch (error) {
			console.error('Error cleaning up old files:', error);
		}
	}
}

export const fileHandlerService = new FileHandlerService(); 