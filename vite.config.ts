import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		federation({
			name: "crm",
			filename: "remoteEntry.js",
			exposes: {
				// shell이 import("crm/App")으로 사용
				"./App": "./src/CrmApp",
			},
			shared: {
				react: { singleton: true, requiredVersion: "^19.2.4" },
				"react-dom": { singleton: true, requiredVersion: "^19.2.4" },
				"react-router-dom": { singleton: true, requiredVersion: "^7.13.2" },
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		// vite-plugin-federation 필수 옵션
		target: "esnext",
		minify: false,
	},
	preview: {
		port: 3001,
		strictPort: true,
		cors: true,
	},
	server: {
		port: 5173,
	},
});
