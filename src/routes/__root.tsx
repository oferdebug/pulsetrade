import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { Toaster } from 'sonner';
import AppShell from '#/components/layout/AppShell';
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';
import appCss from '../styles.css?url';

interface MyRouterContext {
	queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: 'PulseTrade',
				description: 'PulseTrade Is An AI-Powered Trading Platform',
			},
			{
				name: 'description',
				content: 'PulseTrade Is An AI-Powered Trading Platform',
			},
			{
				name: 'keywords',
				content:
					'PulseTrade, AI, Trading, Platform, Trading Platform, AI Trading Platform, Trading Bot, AI Trading Bot, Trading Signals, AI Trading Signals, Trading Strategies, AI Trading Strategies, Trading Education, AI Trading Education, Trading Tools, AI Trading Tools, Trading News, AI Trading News, Trading Analysis, AI Trading Analysis, Trading Alerts, AI Trading Alerts, Trading Notifications, AI Trading Notifications, Trading Alerts, AI Trading Alerts, Trading Notifications, AI Trading Notifications, Trading Alerts, AI Trading Alerts, Trading Notifications, AI Trading Notifications',
			},
		],
		links: [
			{
				rel: 'stylesheet',
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				{/* eslint-disable-next-line react/no-danger */}
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: Safe inline theme hydration script */}
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className='font-sans antialiased wrap-anywhere selection:bg-[rgba(79,184,178,0.24)]'>
				<AppShell>{children}</AppShell>
				<TanStackDevtools
					config={{
						position: 'bottom-right',
					}}
					plugins={[
						{
							name: 'Tanstack Router',
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Toaster richColors position='top-right' />
				<Scripts />
			</body>
		</html>
	);
}
