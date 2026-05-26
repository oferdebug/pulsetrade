import { createFileRoute } from '@tanstack/react-router';
import { Mail, Pencil, User } from 'lucide-react';
import { authClient } from '#/lib/auth-client';

export const Route = createFileRoute('/profile')({
	component: ProfilePage,
});

function ProfilePage() {
	const { data: session } = authClient.useSession();
	const userName = session?.user?.name || 'User';
	const userEmail = session?.user?.email || 'user@example.com';
	const avatarInitial = userName.charAt(0).toUpperCase();

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-white'>Profile</h1>
				<p className='mt-1 text-sm text-slate-400'>
					Manage your PulseTrade identity.
				</p>
			</div>

			<section className='rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl'>
				<div className='flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between'>
					<div className='flex items-center gap-5'>
						<div className='relative'>
							<div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-2xl font-bold text-white shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/30 ring-offset-2 ring-offset-[#020617]'>
								{avatarInitial}
							</div>
						</div>
						<div>
							<h2 className='text-lg font-bold text-white'>{userName}</h2>
							<p className='mt-0.5 text-sm text-slate-400'>{userEmail}</p>
							<span className='mt-2 inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400'>
								Active
							</span>
						</div>
					</div>

					<button
						type='button'
						disabled
						className='flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/5 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 opacity-50 transition'
					>
						<Pencil size={13} aria-hidden='true' />
						Edit Profile
					</button>
				</div>

				<div className='mt-6 space-y-0 divide-y divide-white/5 rounded-2xl border border-white/5 bg-white/[0.02]'>
					<div className='flex items-center gap-4 px-5 py-4'>
						<User
							size={14}
							className='shrink-0 text-slate-500'
							aria-hidden='true'
						/>
						<div className='min-w-0'>
							<p className='text-[11px] font-medium uppercase tracking-widest text-slate-600'>
								Name
							</p>
							<p className='mt-0.5 truncate text-sm font-medium text-white'>
								{userName}
							</p>
						</div>
					</div>
					<div className='flex items-center gap-4 px-5 py-4'>
						<Mail
							size={14}
							className='shrink-0 text-slate-500'
							aria-hidden='true'
						/>
						<div className='min-w-0'>
							<p className='text-[11px] font-medium uppercase tracking-widest text-slate-600'>
								Email
							</p>
							<p className='mt-0.5 truncate text-sm font-medium text-white'>
								{userEmail}
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
