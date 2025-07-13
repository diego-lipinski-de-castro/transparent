import { addEventListeners, getElement, hideElement, showElement } from "../utils/dom";

export class FilePickerComponent {
	private fileButton: HTMLButtonElement;
	private onFilePick: () => void;

	constructor(
		onFilePick: () => void
	) {
		this.fileButton = getElement<HTMLButtonElement>("#file-button");
		this.onFilePick = onFilePick;
		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		addEventListeners(this.fileButton, {
			click: this.handleButtonClick.bind(this),
		});
	}

	private handleButtonClick(): void {
		this.onFilePick();
	}

	enable(): void {
		this.fileButton.disabled = false;
	}

	disable(): void {
		this.fileButton.disabled = true;
	}

	show(): void {
		showElement(this.fileButton);
	}

	hide(): void {
		hideElement(this.fileButton);
	}

	isEnabled(): boolean {
		return !this.fileButton.disabled;
	}
} 