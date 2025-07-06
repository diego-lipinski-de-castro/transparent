import { getElement, showElement, hideElement } from "../utils/dom";

export class MediaControlsComponent {
	private micIcon: HTMLElement;
	private stopIcon: HTMLElement;
	private recording = false;
	private mediaRecorder: MediaRecorder | null = null;
	private onAudioCaptured: (arrayBuffer: ArrayBuffer) => void;

	constructor(onAudioCaptured: (arrayBuffer: ArrayBuffer) => void) {
		this.micIcon = getElement<HTMLElement>("#mic-icon");
		this.stopIcon = getElement<HTMLElement>("#stop-icon");
		this.onAudioCaptured = onAudioCaptured;
		this.setupInitialState();
	}

	private setupInitialState(): void {
		hideElement(this.stopIcon);
		showElement(this.micIcon);
	}

	async startRecording(): Promise<void> {
		if (this.recording) return;

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			this.mediaRecorder = new MediaRecorder(stream);
			const audioChunks: BlobPart[] = [];

			this.mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunks.push(event.data);
				}
			};

			this.mediaRecorder.onstop = async () => {
				const blob = new Blob(audioChunks, { type: "audio/webm" });
				const arrayBuffer = await blob.arrayBuffer();
				this.onAudioCaptured(arrayBuffer);
				
				// Stop all tracks
				stream.getTracks().forEach(track => track.stop());
			};

			this.mediaRecorder.start();
			this.recording = true;
			this.updateUI();
			console.log("Recording started");
		} catch (error) {
			console.error("Error starting recording:", error);
			throw error;
		}
	}

	stopRecording(): void {
		if (!this.recording || !this.mediaRecorder) return;

		this.mediaRecorder.stop();
		this.recording = false;
		this.updateUI();
		console.log("Recording stopped");
	}

	toggleRecording(): void {
		if (this.recording) {
			this.stopRecording();
		} else {
			this.startRecording();
		}
	}

	private updateUI(): void {
		if (this.recording) {
			hideElement(this.micIcon);
			showElement(this.stopIcon);
		} else {
			showElement(this.micIcon);
			hideElement(this.stopIcon);
		}
	}

	isRecording(): boolean {
		return this.recording;
	}

	getRecordingState(): {
		isRecording: boolean;
		hasPermission: boolean;
	} {
		return {
			isRecording: this.recording,
			hasPermission: this.mediaRecorder !== null,
		};
	}

	async requestPermission(): Promise<boolean> {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			stream.getTracks().forEach(track => track.stop());
			return true;
		} catch (error) {
			console.error("Microphone permission denied:", error);
			return false;
		}
	}
} 