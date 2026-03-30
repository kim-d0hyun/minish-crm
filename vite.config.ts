import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import cssInjectedByJs from "vite-plugin-css-injected-by-js";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
	base: command === "build" ? "https://minish-crm.vercel.app" : "/",
	plugins: [
		react(),
		tailwindcss(),
		// CSS를 JS 번들에 인라인으로 포함 — shell에서 별도 CSS 요청 없이 즉시 적용
		cssInjectedByJs(),
		federation({
			name: "crm",
			filename: "remoteEntry.js",
			exposes: {
				"./App": "./src/CrmApp",
			},
			shared: ["react", "react-dom"],
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
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
}));
