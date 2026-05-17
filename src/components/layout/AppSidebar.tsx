import { Link } from '@tanstack/react-router';

export default function AppSidebar() {
	return (
		<aside className='w-64 border-r border-slate-800 bg-slate-950 p-4'>
			<div className='mb-8 text-lg font-bold text-blue-400'>PulseTrade</div>

			<nav className='flex flex-col gap-2 text-sm'>
				<Link to='/' className={'rounded-lg px-3 py-2 hover:bg-slate-900'}>
					Dashboard
				</Link>
				<Link
					to='/markets'
					className={'rounded-lg px-3 py-2 hover:bg-slate-900'}
					search={{ query: '', sector: '', sort: 'market_cap', page: 1 }}
				>
					Markets
				</Link>
				<Link
					to='/watchlist'
					className={'rounded-lg px-3 py-2 hover:bg-slate-900'}
					search={{}}
				>
					Watchlist
				</Link>
				<Link
					to='/portfolio'
					className={'rounded-lg px-3 py-2 hover:bg-slate-900'}
					search={{}}
				>
					Portfolio
				</Link>
			</nav>
		</aside>
	);
}
