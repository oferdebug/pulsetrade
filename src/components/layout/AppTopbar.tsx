import { Link, useNavigate } from '@tanstack/react-router';
import { Bell, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { authClient } from '#/lib/auth-client';
import {
	getSessionBadge,
	useDashboardSessionStore,
} from '#/lib/dashboard/session';

export default function AppTopbar() {
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const status = useDashboardSessionStore((state) => state.status);
	const badge = getSessionBadge(status);

	const userName = session?.user?.name || 'User';
	const userEmail = session?.user?.email || '';
	const avatarInitial = userName.charAt(0).toUpperCase();

	useEffect(() => {
		if (!isMenuOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isMenuOpen]);

	const handleSignOut = async () => {
		try {
			await authClient.signOut();
			setIsMenuOpen(false);
			await navigate({ to: '/login' });
		} catch (error) {
			console.error('Failed to sign out:', error);
			toast.error('Failed to sign out');
		}
	};

	return (
		<header className='sticky top-0 z-40 flex h-20 items-center justify-between border-b border-white/5 bg-[#020617]/80 px-6 backdrop-blur-xl lg:px-10'>
			<div className='flex min-w-0 flex-1 items-center gap-4'>
				<div>
					<p className='text-xs font-semibold uppercase tracking-[0.22em] text-slate-500'>
						PulseTrade
					</p>
					<h1 className='mt-1 hidden text-sm font-medium text-slate-200 sm:block'>
						Market Intelligence Dashboard
					</h1>
				</div>

				<div className='ml-4 hidden w-full max-w-xl md:block'>
					<input
						type='text'
						placeholder='Search tickers, news, markets...'
						className='w-full rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:bg-white/[0.05] focus:ring-4 focus:ring-blue-500/10'
					/>
				</div>
			</div>

			<div className='ml-4 flex shrink-0 items-center gap-3 text-sm'>
				<span
					className={`hidden shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold 2xl:inline ${badge.className}`}
				>
					{badge.label}
				</span>

				<button
					type='button'
					aria-label='Notifications'
					className='relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-white/5 bg-white/[0.04] text-slate-400 transition hover:border-white/10 hover:bg-white/[0.07] hover:text-white'
				>
					<Bell size={16} aria-hidden='true' />
				</button>

				<div className='relative' ref={menuRef}>
					<button
						type='button'
						onClick={() => setIsMenuOpen((current) => !current)}
						aria-haspopup='true'
						aria-expanded={isMenuOpen}
						className='flex cursor-pointer shrink-0 items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.04] px-3 py-2 transition hover:border-white/10 hover:bg-white/[0.07]'
					>
						<div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-500/25'>
							{avatarInitial}
						</div>

						<div className='hidden max-w-44 items-center gap-2 text-left xl:flex'>
							<div className='min-w-0'>
								<p className='truncate font-medium text-slate-100'>
									{userName}
								</p>
								<p className='truncate text-xs text-slate-500'>{userEmail}</p>
							</div>
							<ChevronDown
								size={14}
								aria-hidden='true'
								className={`shrink-0 text-slate-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
							/>
						</div>
					</button>

					{isMenuOpen ? (
						<div
							role='menu'
							aria-label='User menu'
							className='absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl'
						>
							<div className='border-b border-white/5 px-5 py-5'>
								<div className='flex items-center gap-3'>
									<div className='flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white'>
										{avatarInitial}
									</div>

									<div className='min-w-0'>
										<p className='truncate font-semibold text-white'>
											{userName}
										</p>
										<p className='mt-1 truncate text-xs text-slate-500'>
											{userEmail}
										</p>
									</div>
								</div>
							</div>

							<nav className='p-2' aria-label='User actions'>
								<Link
									to='/profile'
									role='menuitem'
									onClick={() => setIsMenuOpen(false)}
									className='block cursor-pointer rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white'
								>
									Profile
								</Link>

								<Link
									to='/settings'
									role='menuitem'
									onClick={() => setIsMenuOpen(false)}
									className='block cursor-pointer rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white'
								>
									Settings
								</Link>
							</nav>

							<div className='border-t border-white/5 p-2'>
								<button
									type='button'
									role='menuitem'
									onClick={handleSignOut}
									className='w-full cursor-pointer rounded-2xl px-4 py-3 text-left text-sm font-medium text-rose-400 transition hover:bg-rose-500/10'
								>
									Sign out
								</button>
							</div>
						</div>
					) : null}
				</div>
			</div>
		</header>
	);
}
