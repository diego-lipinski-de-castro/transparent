import { GoogleGenAI, Modality } from "@google/genai";
import { Message, AIResponse } from "../../shared/types";
import { SUPPORTED_FILE_TYPES } from "../../shared/constants";

class AIService {
	private ai: GoogleGenAI;
	private systemInstruction = `You are a helpful assistant.`;

	constructor() {
		this.ai = new GoogleGenAI({
			apiKey: process.env.GEMINI_API_KEY,
		});
	}

	async generateText(messages: Message[]): Promise<AIResponse> {
		try {
			const response = await this.ai.models.generateContent({
				model: "gemini-2.5-flash",
				config: {
					systemInstruction: this.systemInstruction,
					responseMimeType: "text/plain",
					tools: [
						{
							googleSearch: {},
						},
						{
							urlContext: {},
						},
					],
				},
				contents: messages.map((message) => ({
					role: message.role === "assistant" ? "model" : message.role,
					parts: [{ text: message.content }],
				})),
			});

			return {
				text: response.text,
				groundingMetadata: response.candidates[0].groundingMetadata,
				urlContextMetadata: response.candidates[0].urlContextMetadata,
			};
		} catch (error) {
			console.error('AI generateText error:', error);
			return {
				text: "I'm sorry, I'm having trouble generating a response. Please try again.",
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	async transcribeAudio(base64AudioFile: string, prompt = "Transcribe this audio"): Promise<AIResponse> {
		try {
			const response = await this.ai.models.generateContent({
				model: "gemini-2.5-pro",
				contents: [
					{
						text: prompt,
					},
					{
						inlineData: {
							mimeType: "audio/webm",
							data: base64AudioFile,
						},
					},
				],
			});

			return { text: response.text };
		} catch (error) {
			console.error('AI transcribeAudio error:', error);
			return {
				text: "I'm sorry, I'm having trouble transcribing the audio. Please try again.",
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	async generateAudio(text: string): Promise<{ text: string; audio: Buffer | null; error?: string }> {
		try {
			const response = await this.ai.models.generateContent({
				model: "gemini-2.5-flash-preview-tts",
				config: {
					responseModalities: [Modality.AUDIO],
					speechConfig: {
						languageCode: "en-US",
						voiceConfig: {
							prebuiltVoiceConfig: {
								voiceName: "alloy",
							},
						},
					},
				},
				contents: [
					{
						parts: [{ text: text }],
					},
				],
			});

			const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
			const audioBuffer = data ? Buffer.from(data, "base64") : null;

			return {
				text: response.text,
				audio: audioBuffer,
			};
		} catch (error) {
			console.error('AI generateAudio error:', error);
			return {
				text: "I'm sorry, I'm having trouble generating the audio. Please try again.",
				audio: null,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	async generateImage(text: string): Promise<{ text: string; image: Buffer | null; error?: string }> {
		try {
			const response = await this.ai.models.generateContent({
				model: "gemini-2.0-flash-preview-image-generation",
				contents: text,
				config: {
					responseModalities: [Modality.TEXT, Modality.IMAGE],
				},
			});

			const parts = response.candidates[0].content.parts;
			if (!parts || !parts[0].inlineData) {
				return {
					text: response.text,
					image: null,
				};
			}

			const imageText = parts[0].text;
			const imageBuffer = Buffer.from(parts[0].inlineData.data, "base64");

			return {
				text: imageText,
				image: imageBuffer,
			};
		} catch (error) {
			console.error('AI generateImage error:', error);
			return {
				text: "I'm sorry, I'm having trouble generating the image. Please try again.",
				image: null,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	async readFile(base64File: string, mimeType: string, prompt: string): Promise<AIResponse> {
		if (!SUPPORTED_FILE_TYPES.includes(mimeType as any)) {
			return {
				text: `Unsupported file type: ${mimeType}. Supported types are: PDF, JavaScript, Python, TXT, HTML, CSS, Markdown, CSV, XML, RTF, PNG, JPEG, GIF, WEBP, SVG, TIFF`,
				error: 'Unsupported file type',
			};
		}

		try {
			const response = await this.ai.models.generateContent({
				model: "gemini-2.5-flash",
				contents: [
					{
						inlineData: {
							mimeType: mimeType,
							data: base64File,
						},
					},
					{
						text: prompt,
					},
				],
			});

			return { text: response.text };
		} catch (error) {
			console.error('AI readFile error:', error);
			return {
				text: "I'm sorry, I'm having trouble reading the file. Please try again.",
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	setApiKey(apiKey: string) {
		this.ai = new GoogleGenAI({ apiKey });
	}

	setSystemInstruction(instruction: string) {
		this.systemInstruction = instruction;
	}
}

export const aiService = new AIService(); 