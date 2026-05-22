import netlify from '@netlify/vite-plugin-tanstack-start';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	server: {
		allowedHosts: [
			'localhost',
			'127.0.0.1',
			'ommatidial-polly-aoristically.ngrok-free.dev',
		],
	},
	plugins: [devtools(), netlify(), tailwindcss(), tanstackStart(), viteReact()],
});

export default config;
