import { GenerateContentResponse, GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY,
});

export interface Message {
	role: "user" | "assistant";
	content: string;
}

const systemInstruction = `
You are a helpful assistant.
`;

const addCitations = (response: GenerateContentResponse) => {
	const text = response.text;

	return text;
};

const generateText = async (messages: Message[]) => {
	try {
		const response = await ai.models.generateContent({
			model: "gemini-2.5-pro",
			config: {
				systemInstruction,
				responseMimeType: "text/plain",
				tools: [
					{
						googleSearch: {},
					},
					{
						urlContext: {},
					},
					// {
					// 	googleMaps: {},
					// }
				],
			},
			contents: messages.map((message) => ({
				role: message.role,
				parts: [{ text: message.content }],
			})),
		});

		const text = response.text;
		console.log(response.candidates[0].groundingMetadata);

		return {
			text: text,
			groundingMetadata: response.candidates[0].groundingMetadata,
			urlContextMetadata: response.candidates[0].urlContextMetadata,
		};
	} catch (error) {
		console.error(error);
		return {
			text: "I'm sorry, I'm having trouble generating a response. Please try again.",
			groundingMetadata: null,
			urlContextMetadata: null,
		};
	}
};

const transcribeAudio = async (
	base64AudioFile: string,
	prompt = "Transcribe this audio"
) => {
	try {
		const response = await ai.models.generateContent({
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

		return response.text;
	} catch (error) {
		console.error(error);
		return {
			text: "I'm sorry, I'm having trouble transcribing the audio. Please try again.",
		};
	}
};

const generateAudio = async (text: string) => {
	try {
		const response = await ai.models.generateContent({
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

		const data =
			response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
		const audioBuffer = Buffer.from(data, "base64");

		return {
			text: response.text,
			audio: audioBuffer,
		};
	} catch (error) {
		console.error(error);
		return {
			text: "I'm sorry, I'm having trouble generating the audio. Please try again.",
			audio: null,
		};
	}
};

const generateImage = async (text: string) => {
	try {
		const response = await ai.models.generateContent({
			model: "gemini-2.0-flash-preview-image-generation",
			contents: text,
			config: {
				responseModalities: [Modality.TEXT, Modality.IMAGE],
			},
		});

		if (!response.candidates[0].content.parts) {
			return null;
		}

		if (!response.candidates[0].content.parts[0].inlineData) {
			return null;
		}

		const imageText = response.candidates[0].content.parts[0].text;
		const imageBuffer =
			response.candidates[0].content.parts[0].inlineData.data;
		const image = Buffer.from(imageBuffer, "base64");

		return {
			text: imageText,
			image,
		};
	} catch (error) {
		console.error(error);
		return {
			text: "I'm sorry, I'm having trouble generating the image. Please try again.",
			image: null,
		};
	}
};

const readFile = async (
	base64File: string,
	mimeType: string,
	prompt: string
) => {
	const validMimeTypes = [
		"application/pdf",
		"application/x-javascript",
		"text/javascript", 
		"application/x-python",
		"text/x-python",
		"text/plain",
		"text/html",
		"text/css",
		"text/md",
		"text/csv",
		"text/xml",
		"text/rtf",
		"image/png",
		"image/jpeg",
		"image/gif",
		"image/webp",
		"image/svg+xml",
		"image/tiff",
	];

	if (!validMimeTypes.includes(mimeType)) {
		return {
			text: `Unsupported file type: ${mimeType}. Supported types are: PDF, JavaScript, Python, TXT, HTML, CSS, Markdown, CSV, XML, RTF, PNG, JPEG, GIF, WEBP, SVG, TIFF`,
		};
	}

	try {
		const response = await ai.models.generateContent({
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

		return {
			text: response.text,
		};
	} catch (error) {
		console.error(error);
		return {
			text: "I'm sorry, I'm having trouble reading the PDF. Please try again.",
		};
	}
};

export {
	generateText,
	transcribeAudio,
	generateAudio,
	generateImage,
	readFile,
};
