import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
	build: {
		lib: {
			entry: "src/preload/index.ts",
			formats: ["cjs"],
			fileName: () => "index.js",
		},
		rollupOptions: {
			external: ["electron"],
		},
		outDir: ".vite/preload",
	},
});
