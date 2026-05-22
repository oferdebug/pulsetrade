import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { authClient } from '#/lib/auth-client';
export default function AppTopbar() {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const handleSignOut = async () => {
		try {
			await authClient.signOut();
			await navigate({ to: '/login' });
		} catch (error) {
			console.error('Failed to Sign Out', error);
			toast.error('Failed to Sign Out');
		}
	};

	return (
		<header
			className={
				'flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6'
			}
		>
			<input
				type='text'
				placeholder='Search Tickets, News, Markets...'
				className={
					'w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-blue-500'
				}
			/>
			<div className={'ml-4 flex items-center gap-4 text-sm'}>
				<span className={'text-emerald-400'}>Market Open</span>
				<div className={'hidden flex-col text-right sm:flex'}>
					<span className={'font-medium text-slate-100'}>
						{session?.user?.name || 'User'}
					</span>
					<span className={'text-xs text-slate-500'}>
						{session?.user?.email}
					</span>
				</div>
				<button
					type='button'
					onClick={handleSignOut}
					className={'rounded-lg border border-slate-700 px-3 py-2 text-xs'}
				>
					Sign Out
				</button>
			</div>
		</header>
	);
}
