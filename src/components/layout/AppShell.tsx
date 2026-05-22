import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { authClient } from '#/lib/auth-client';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';

type AppShellProps = {
	children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const { data: session, isPending } = authClient.useSession();
	const isAuthPage = pathname === '/login';
	const isAuthenticeted = Boolean(session?.user);
	useEffect(() => {
		if (!isPending && !isAuthenticeted && !isAuthPage) {
			void navigate({ to: '/login' });
		}
		if (!isPending && isAuthenticeted && isAuthPage) {
			void navigate({ to: '/' });
		}
	}, [isPending, isAuthenticeted, isAuthPage, navigate]);
	if (isPending) {
		return (
			<div
				className={
					'flex min-h-screen items-center justify-center bg-slate-900 text-slate-400'
				}
			>
				Loading Session...
			</div>
		);
	}
	if (isAuthPage) {
		return (
			<div className={'min-h-screen bg-slate-950 text-slate-100'}>
				{children}
			</div>
		);
	}
	if (!isAuthenticeted) {
		return null;
	}

	return (
		<div className={'min-h-screen bg-slate-950 text-slate-100'}>
			<div className={'flex min-h-screen'}>
				<AppSidebar />
				<div className={'flex min-w-0 flex-1 flex-col'}>
					<AppTopbar />
					<main className={'flex-1 p-6'}>
						<div className='mx-auto w-full max-w-7xl'>{children}</div>
					</main>
				</div>
			</div>
		</div>
	);
}
