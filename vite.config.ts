import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
	// production 빌드 시 모든 asset URL을 CRM Vercel 도메인 기준으로 생성
	// → shell에서 로드해도 /assets/splash-logo.png가 minish-crm.vercel.app 기준으로 resolve됨
	base: command === "build" ? "https://minish-crm.vercel.app" : "/",
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
			// react-router-dom은 공유하지 않음 — 쉘과 CRM이 각자의 Router context를 가짐
			shared: ["react", "react-dom"],
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
}));
