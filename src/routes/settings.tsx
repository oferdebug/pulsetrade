import { createFileRoute } from '@tanstack/react-router';
import { Bell, Moon, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/settings')({
	component: SettingsPage,
});

type SettingRowProps = {
	label: string;
	description: string;
};

function SettingToggleRow({ label, description }: SettingRowProps) {
	return (
		<div className='flex items-center justify-between gap-6 py-4'>
			<div>
				<p className='text-sm font-medium text-white'>{label}</p>
				<p className='mt-0.5 text-xs text-slate-500'>{description}</p>
			</div>
			<div className='relative h-6 w-11 cursor-not-allowed rounded-full bg-white/[0.08] opacity-50'>
				<div className='absolute left-1 top-1 h-4 w-4 rounded-full bg-slate-500 transition-transform' />
			</div>
		</div>
	);
}

function SettingsPage() {
	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-white'>Settings</h1>
				<p className='mt-1 text-sm text-slate-400'>
					Configure your account and workspace preferences.
				</p>
			</div>

			<section className='rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl'>
				<div className='mb-1 flex items-center gap-2.5'>
					<Moon size={15} className='text-slate-500' aria-hidden='true' />
					<h2 className='text-sm font-semibold uppercase tracking-widest text-slate-500'>
						Appearance
					</h2>
				</div>
				<div className='divide-y divide-white/5'>
					<SettingToggleRow
						label='Dark Mode'
						description='Use the dark theme across the application.'
					/>
					<SettingToggleRow
						label='Compact View'
						description='Reduce spacing between UI elements.'
					/>
				</div>
			</section>

			<section className='rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl'>
				<div className='mb-1 flex items-center gap-2.5'>
					<Bell size={15} className='text-slate-500' aria-hidden='true' />
					<h2 className='text-sm font-semibold uppercase tracking-widest text-slate-500'>
						Notifications
					</h2>
				</div>
				<div className='divide-y divide-white/5'>
					<SettingToggleRow
						label='Price Alerts'
						description='Get notified when a watched asset moves significantly.'
					/>
					<SettingToggleRow
						label='Portfolio Updates'
						description='Daily summary of your portfolio performance.'
					/>
					<SettingToggleRow
						label='Market News'
						description='Breaking news and market-moving events.'
					/>
				</div>
			</section>

			<section className='rounded-3xl border border-rose-500/10 bg-rose-500/[0.03] p-6 backdrop-blur-xl'>
				<div className='mb-4 flex items-center gap-2.5'>
					<Trash2 size={15} className='text-rose-500/70' aria-hidden='true' />
					<h2 className='text-sm font-semibold uppercase tracking-widest text-rose-500/70'>
						Danger Zone
					</h2>
				</div>
				<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
					<div>
						<p className='text-sm font-medium text-white'>Delete Account</p>
						<p className='mt-0.5 text-xs text-slate-500'>
							Permanently remove your account and all associated data. This
							cannot be undone.
						</p>
					</div>
					<button
						type='button'
						disabled
						className='shrink-0 cursor-not-allowed rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 opacity-50 transition'
					>
						Delete Account
					</button>
				</div>
			</section>
		</div>
	);
}
