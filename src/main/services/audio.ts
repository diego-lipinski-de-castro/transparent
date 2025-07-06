import fs from "node:fs";
import path from "node:path";
import { AudioResult } from "../../shared/types";
import { aiService } from "./ai";

class AudioService {
	private audioDir = "audio";

	constructor() {
		this.ensureAudioDir();
	}

	private ensureAudioDir() {
		if (!fs.existsSync(this.audioDir)) {
			fs.mkdirSync(this.audioDir, { recursive: true });
		}
	}

	async capture(arrayBuffer: ArrayBuffer): Promise<AudioResult> {
		try {
			const buffer = Buffer.from(arrayBuffer);
			const timestamp = Date.now();
			const filePath = path.join(this.audioDir, `audio_${timestamp}.webm`);
			
			// Save audio to file
			fs.writeFileSync(filePath, buffer);
			
			// Convert to base64 for AI processing
			const base64Audio = buffer.toString("base64");
			
			// Transcribe with AI
			const transcription = await aiService.transcribeAudio(base64Audio);

			return {
				text: transcription.text,
				filePath,
				error: transcription.error,
			};
		} catch (error) {
			console.error('Audio capture error:', error);
			return {
				text: "Failed to process audio",
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	async saveAudio(arrayBuffer: ArrayBuffer): Promise<AudioResult> {
		try {
			const buffer = Buffer.from(arrayBuffer);
			const timestamp = Date.now();
			const filePath = path.join(this.audioDir, `audio_${timestamp}.webm`);
			
			fs.writeFileSync(filePath, buffer);

			return {
				text: "Audio saved successfully",
				filePath,
			};
		} catch (error) {
			console.error('Audio save error:', error);
			return {
				text: "Failed to save audio",
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	async transcribeFile(filePath: string): Promise<AudioResult> {
		try {
			const buffer = fs.readFileSync(filePath);
			const base64Audio = buffer.toString("base64");
			
			const transcription = await aiService.transcribeAudio(base64Audio);

			return {
				text: transcription.text,
				filePath,
				error: transcription.error,
			};
		} catch (error) {
			console.error('Audio transcribe error:', error);
			return {
				text: "Failed to transcribe audio file",
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	getAudioDir(): string {
		return this.audioDir;
	}

	setAudioDir(dir: string) {
		this.audioDir = dir;
		this.ensureAudioDir();
	}
}

export const audioService = new AudioService(); 