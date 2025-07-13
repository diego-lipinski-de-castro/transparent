export const APP_NAME = 'Transparent';
export const APP_VERSION = '1.0.0';

export const WINDOW_DEFAULTS = {
	width: 600,
	height: 50,
	expandedHeight: 350,
} as const;

export const SHORTCUTS = {
	TOGGLE: 'Cmd+\\',
	SCREENSHOT: 'Cmd+Shift+S',
	AUDIO: 'Cmd+Shift+A',
} as const;

export const SUPPORTED_FILE_TYPES = [
	'application/pdf',
	'application/x-javascript',
	'text/javascript', 
	'application/x-python',
	'text/x-python',
	'text/plain',
	'text/html',
	'text/css',
	'text/md',
	'text/csv',
	'text/xml',
	'text/rtf',
	'image/png',
	'image/jpeg',
	'image/gif',
	'image/webp',
	'image/svg+xml',
	'image/tiff',
] as const;

export const STORAGE_KEYS = {
	CONVERSATIONS: 'conversations',
	SETTINGS: 'settings',
	API_KEY: 'api_key',
} as const;

export const IPC_CHANNELS = {
	AI: {
		GENERATE_TEXT: 'ai:generateText',
		TRANSCRIBE_AUDIO: 'ai:transcribeAudio',
		GENERATE_AUDIO: 'ai:generateAudio',
		GENERATE_IMAGE: 'ai:generateImage',
		READ_FILE: 'ai:readFile',
	},
	SCREENSHOT: {
		CAPTURE: 'screenshot:capture',
	},
	AUDIO: {
		CAPTURE: 'audio:capture',
	},
	FILES: {
		PICK_FILE: 'files:pickFile',
		PROCESS: 'files:process',
	},
	WINDOW: {
		TOGGLE: 'window:toggle',
		RESIZE: 'window:resize',
		GET_STATE: 'window:getState',
	},
	STORAGE: {
		GET: 'storage:get',
		SET: 'storage:set',
		DELETE: 'storage:delete',
	},
} as const; 