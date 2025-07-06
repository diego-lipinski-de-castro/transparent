import { desktopCapturer } from "electron";
import fs from "node:fs";
import path from "node:path";
import { ScreenshotResult } from "../../shared/types";
import { aiService } from "./ai";

class ScreenshotService {
	private screenshotDir = "screenshots";

	constructor() {
		this.ensureScreenshotDir();
	}

	private ensureScreenshotDir() {
		if (!fs.existsSync(this.screenshotDir)) {
			fs.mkdirSync(this.screenshotDir, { recursive: true });
		}
	}

	async capture(): Promise<ScreenshotResult> {
		try {
			const sources = await desktopCapturer.getSources({
				types: ["screen"],
				thumbnailSize: { width: 1920, height: 1080 },
			});

			if (sources.length === 0) {
				return {
					text: "No screen sources found",
					error: "No screen sources available",
				};
			}

			const source = sources[0];
			const dataURL = source.thumbnail.toDataURL();
			const base64Image = dataURL.split(",")[1];
			
			// Save screenshot to file
			const timestamp = Date.now();
			const filePath = path.join(this.screenshotDir, `screenshot_${timestamp}.png`);
			
			fs.writeFileSync(filePath, base64Image, "base64");

			// Process with AI
			const aiResponse = await aiService.readFile(
				base64Image,
				"image/png",
				"This is a screenshot of the user computer screen. The user wants to know about the content of the screen. Do not describe the elements, just do a research and resume the content."
			);

			return {
				text: aiResponse.text,
				filePath,
				error: aiResponse.error,
			};
		} catch (error) {
			console.error('Screenshot capture error:', error);
			return {
				text: "Failed to capture screenshot",
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	async captureWithoutAI(): Promise<ScreenshotResult> {
		try {
			const sources = await desktopCapturer.getSources({
				types: ["screen"],
				thumbnailSize: { width: 1920, height: 1080 },
			});

			if (sources.length === 0) {
				return {
					text: "No screen sources found",
					error: "No screen sources available",
				};
			}

			const source = sources[0];
			const dataURL = source.thumbnail.toDataURL();
			const base64Image = dataURL.split(",")[1];
			
			const timestamp = Date.now();
			const filePath = path.join(this.screenshotDir, `screenshot_${timestamp}.png`);
			
			fs.writeFileSync(filePath, base64Image, "base64");

			return {
				text: "Screenshot captured successfully",
				filePath,
			};
		} catch (error) {
			console.error('Screenshot capture error:', error);
			return {
				text: "Failed to capture screenshot",
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	getScreenshotDir(): string {
		return this.screenshotDir;
	}

	setScreenshotDir(dir: string) {
		this.screenshotDir = dir;
		this.ensureScreenshotDir();
	}
}

export const screenshotService = new ScreenshotService(); 