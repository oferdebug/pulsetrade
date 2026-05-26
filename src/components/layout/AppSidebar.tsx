import { Link } from '@tanstack/react-router';
import { BarChart2, Briefcase, LayoutDashboard, Star } from 'lucide-react';

const navItems = [
	{
		label: 'Dashboard',
		to: '/',
		icon: LayoutDashboard,
	},
	{
		label: 'Markets',
		to: '/markets',
		icon: BarChart2,
		search: {
			query: '',
			sector: '',
			sort: 'market_cap',
			page: 1,
		},
	},
	{
		label: 'Watchlist',
		to: '/watchlist',
		icon: Star,
		search: {},
	},
	{
		label: 'Portfolio',
		to: '/portfolio',
		icon: Briefcase,
		search: {},
	},
] as const;

export default function AppSidebar() {
	return (
		<aside
			className={
				'sticky top-0 flex h-screen w-[88px] flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl'
			}
			aria-label='Main navigation'
		>
			<div
				className={
					'flex h-20 items-center justify-center border-b border-white/5'
				}
			>
				<div
					className={
						'flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-500/30'
					}
				>
					PT
				</div>
			</div>

			<nav
				className={'flex flex-1 flex-col gap-2 px-3 py-6'}
				aria-label='Primary'
			>
				{navItems.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							key={item.label}
							to={item.to}
							search={'search' in item ? item.search : undefined}
							title={item.label}
							aria-label={item.label}
							activeProps={{
								className:
									'bg-blue-600 text-white shadow-lg shadow-blue-500/20 [&_svg]:text-white',
								'aria-current': 'page' as const,
							}}
							className={
								'group flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-slate-500 transition-all hover:bg-white/5 hover:text-white'
							}
						>
							<Icon size={18} strokeWidth={1.75} aria-hidden='true' />
							<span className='text-[9px] font-semibold uppercase tracking-wider'>
								{item.label.charAt(0) + item.label.slice(1, 3)}
							</span>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
