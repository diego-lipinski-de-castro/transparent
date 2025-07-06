import "./index.css";
import { parse } from "marked";

// document
// 	.getElementById("toggle-dark-mode")
// 	.addEventListener("click", async () => {
// 		const isDarkMode = await window.darkMode.toggle();
// 		document.getElementById("theme-source").innerHTML = isDarkMode
// 			? "Dark"
// 			: "Light";
// 	});

// document.getElementById("light-mode").addEventListener("click", async () => {
// 	await window.darkMode.light();
// 	document.getElementById("theme-source").innerHTML = "Light";
// });

// document.getElementById("dark-mode").addEventListener("click", async () => {
// 	await window.darkMode.dark();
// 	document.getElementById("theme-source").innerHTML = "Dark";
// });

// document
// 	.getElementById("reset-to-system")
// 	.addEventListener("click", async () => {
// 		await window.darkMode.system();
// 		document.getElementById("theme-source").innerHTML = "System";
// 	});

// const updateOnlineStatus = () => {
// 	// navigator.onLine is a boolean
// };

// window.addEventListener("online", updateOnlineStatus);
// window.addEventListener("offline", updateOnlineStatus);

// updateOnlineStatus();

let loading = false;
let recording = false;
let mediaRecorder: MediaRecorder;

interface Message {
	role: "user" | "assistant";
	content: string;
}

const messages: Message[] = [];

const outputElement = document.getElementById("output");

const toggleLoading = (loading: boolean) => {
	if (loading) {
		const loadingElement = document.createElement("div");
		loadingElement.id = "loader";
		loadingElement.classList.add("loader");
		outputElement.appendChild(loadingElement);
	} else {
		const loadingElement = document.getElementById("loader");
		if (loadingElement) {
			loadingElement.remove();
		}
	}

	outputElement.scrollTo({
		top: outputElement.scrollHeight,
		behavior: "smooth",
	});
};

const renderMessage = async (message: Message) => {
	if (messages.length === 1) {
		outputElement.classList.add("animate-in");
	}

	const messageElement = document.createElement("div");
	messageElement.classList.add("message");
	messageElement.classList.add(message.role);

	messageElement.innerHTML = await parse(message.content);

	if (message.role === "user") {
		messageElement.innerHTML = `<p>${message.content}</p>`;
	} else {
		messageElement.innerHTML = await parse(message.content);
	}

	outputElement.appendChild(messageElement);

	outputElement.scrollTo({
		top: outputElement.scrollHeight,
		behavior: "smooth",
	});
};

document.getElementById("prompt").addEventListener("keydown", async (event) => {
	console.log(event.key);
	if (event.key === "Enter") {
		event.preventDefault();
		
		if (loading) return;
		loading = true;

		const prompt = document.getElementById("prompt").value;

		if (!prompt) {
			loading = false;
			toggleLoading(false);
			return;
		}

		const userMessage: Message = {
			role: "user",
			content: prompt,
		};

		messages.push(userMessage);
		await renderMessage(userMessage);
		document.getElementById("prompt").value = "";

		toggleLoading(true);

		const { text, groundingMetadata, urlContextMetadata } = await window.gemini.generateText(messages);

		const assistantMessage: Message = {
			role: "assistant",
			content: text,
		};

		toggleLoading(false);
		messages.push(assistantMessage);
		await renderMessage(assistantMessage);

		loading = false;
	}
});

document.getElementById("screenshot-button").addEventListener("click", async () => {
	const userMessage: Message = {
		role: "user",
		content: "Take a screenshot of the current screen",
	};

	messages.push(userMessage);
	await renderMessage(userMessage);
	toggleLoading(true);

	const screenshot = await window.screenshot.capture();
	console.log(screenshot);

	const assistantMessage: Message = {
		role: "assistant",
		content: screenshot,
	};

	toggleLoading(false);
	messages.push(assistantMessage);
	await renderMessage(assistantMessage);
});

document.getElementById("audio-button").addEventListener("click", async () => {
	if (recording) {
		mediaRecorder.stop();
		recording = false;

		document.getElementById("stop-icon").style.display = "none";
		document.getElementById("mic-icon").style.display = "block";
		return;
	}

	recording = true;

	document.getElementById("mic-icon").style.display = "none";
	document.getElementById("stop-icon").style.display = "block";

	const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

	mediaRecorder = new MediaRecorder(stream);
	const audioChunks: BlobPart[] = [];

	mediaRecorder.ondataavailable = (event) => {
		if (event.data.size > 0) audioChunks.push(event.data);
	};

	mediaRecorder.onstop = async () => {
		const blob = new Blob(audioChunks, { type: "audio/webm" });
		const arrayBuffer = await blob.arrayBuffer();

		// toggleLoading(true);

		// Send to main process to save
		const result = await window.audio.capture(arrayBuffer);
		console.log(result);

		const userMessage: Message = {
			role: "user",
			content: result,
		};

		messages.push(userMessage);
		await renderMessage(userMessage);
	};

	mediaRecorder.start();
	console.log("Recording started");
});

window.addEventListener("dragenter", (event) => {
	console.log("dragenter");
	event.preventDefault();
	document.body.style.opacity = '0.8';
});

window.addEventListener("dragover", (event) => {
	console.log("dragover");
	event.preventDefault();
	event.dataTransfer.dropEffect = "copy";
});

window.addEventListener("drop", (event) => {
	console.log("drop");
	event.preventDefault();
	document.body.style.opacity = '1';

	const files = event.dataTransfer.files;
	window.files.drop(files);
});

window.addEventListener("dragleave", (event) => {
	console.log("dragleave");
	event.preventDefault();
	document.body.style.opacity = '1';
});