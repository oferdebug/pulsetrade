import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
	title: string;
	value: string;
	change?: string;
	icon?: LucideIcon;
};

export default function StatCard({
	title,
	value,
	change,
	icon: Icon,
}: StatCardProps) {
	const isPositive = change?.startsWith('+');

	return (
		<div className='group rounded-3xl border border-white/5 bg-white/3 p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition hover:border-white/10 hover:bg-white/5'>
			<div className='flex items-start justify-between gap-4'>
				<div className='flex items-center gap-2'>
					{Icon ? (
						<span className='flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.06] text-slate-400'>
							<Icon size={14} aria-hidden='true' />
						</span>
					) : null}
					<p className='text-xs font-medium uppercase tracking-[0.18em] text-slate-500'>
						{title}
					</p>
				</div>

				{change ? (
					<span
						className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
							isPositive
								? 'bg-emerald-500/10 text-emerald-400'
								: 'bg-rose-500/10 text-rose-400'
						}`}
					>
						{change}
					</span>
				) : null}
			</div>

			<h3 className='mt-5 text-3xl font-bold tracking-tight text-white'>
				{value}
			</h3>

			<div className='mt-5 h-1 overflow-hidden rounded-full bg-white/[0.06]'>
				<div
					className={`h-full rounded-full ${
						isPositive ? 'bg-emerald-400/70' : 'bg-blue-500/70'
					}`}
					style={{ width: change ? '60%' : '40%' }}
				/>
			</div>
		</div>
	);
}
