import netlify from '@netlify/vite-plugin-tanstack-start';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	server: {
		allowedHosts: ['ommatidial-polly-aoristically.ngrok-free.dev'],
	},
	plugins: [
		devtools(),
		netlify(),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		babel({ presets: [reactCompilerPreset()] }),
	],
});

export default config;
