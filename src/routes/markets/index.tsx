import { createFileRoute } from '@tanstack/react-router';
import MarketRow from '#/components/dashboard/MarketRow';
import { marketsData } from '#/data/mockMarkets';

export const Route = createFileRoute('/markets/')({
	validateSearch: (search) => ({
		query: String(search.query ?? ''),
		sector: String(search.sector ?? ''),
		sort: String(search.sort ?? ''),
		page: Number(search.page ?? 1),
	}),
	component: MarketsPage,
});

function MarketsPage() {
	const search = Route.useSearch();
	const currentPage = search.page;
	const navigate = Route.useNavigate();

	const filteredMarkets = marketsData.filter((market) => {
		const query = search.query.toLowerCase();

		const matchesQuery =
			market.symbol.toLowerCase().includes(query) ||
			market.name.toLowerCase().includes(query);

		const matchesSector =
			!search.sector ||
			market.sector.toLowerCase() === search.sector.toLowerCase();

		return matchesQuery && matchesSector;
	});

	const sortedMarkets = [...filteredMarkets].sort((a, b) => {
		if (search.sort === 'symbol') {
			return a.symbol.localeCompare(b.symbol);
		}

		if (search.sort === 'price-desc') {
			return (
				Number(b.price.replace('$', '')) - Number(a.price.replace('$', ''))
			);
		}

		if (search.sort === 'price-asc') {
			return (
				Number(a.price.replace('$', '')) - Number(b.price.replace('$', ''))
			);
		}

		return 0;
	});

	const itemsPerPage = 4;
	const totalPages = Math.ceil(sortedMarkets.length / itemsPerPage);
	const pageintedMarkets = sortedMarkets.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold text-white'>Markets</h1>

				<p className='mt-1 text-sm text-slate-400'>
					Track market performance, search assets and monitor trends.
				</p>
			</div>

			<section className='rounded-2xl border border-slate-800 bg-slate-950 p-5'>
				<div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
					<div className='flex flex-col gap-3 md:flex-row'>
						<input
							type='text'
							placeholder='Search symbol...'
							className='rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-white outline-none'
							value={search.query}
							onChange={(e) =>
								navigate({
									search: (prev) => ({
										...prev,
										query: e.target.value,
										page: 1,
									}),
								})
							}
						/>

						<select
							className='rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-white outline-none'
							value={search.sort}
							onChange={(e) =>
								navigate({
									search: (prev) => ({
										...prev,
										sort: e.target.value,
										page: 1,
									}),
								})
							}
						>
							<option value=''>Default</option>
							<option value='symbol'>Symbol A-Z</option>
							<option value='price-desc'>Price High-Low</option>
							<option value='price-asc'>Price Low-High</option>
						</select>
					</div>

					<div className='flex flex-wrap items-center gap-2'>
						<button
							type='button'
							className={`rounded-lg px-3 py-2 text-sm ${
								search.sector === 'tech'
									? 'bg-emerald-500 text-black'
									: 'bg-slate-900 text-slate-300'
							}`}
							onClick={() =>
								navigate({
									search: (prev) => ({
										...prev,
										sector: 'tech',
										page: 1,
									}),
								})
							}
						>
							Technology
						</button>

						<button
							type='button'
							className={`rounded-lg px-3 py-2 text-sm ${
								search.sector === 'crypto'
									? 'bg-emerald-500 text-black'
									: 'bg-slate-900 text-slate-300'
							}`}
							onClick={() =>
								navigate({
									search: (prev) => ({
										...prev,
										sector: 'crypto',
										page: 1,
									}),
								})
							}
						>
							Crypto
						</button>

						<button
							type='button'
							className={`rounded-lg px-3 py-2 text-sm ${
								search.sector === 'energy'
									? 'bg-emerald-500 text-black'
									: 'bg-slate-900 text-slate-300'
							}`}
							onClick={() =>
								navigate({
									search: (prev) => ({
										...prev,
										sector: 'energy',
										page: 1,
									}),
								})
							}
						>
							Energy
						</button>

						<button
							type='button'
							className={`rounded-lg px-3 py-2 text-sm ${
								!search.sector
									? 'bg-emerald-500 text-black'
									: 'bg-slate-900 text-slate-300'
							}`}
							onClick={() =>
								navigate({
									search: (prev) => ({
										...prev,
										sector: '',
										page: 1,
									}),
								})
							}
						>
							All
						</button>
					</div>
				</div>

				<div className='mt-6 space-y-3'>
					{pageintedMarkets.map((market) => (
						<MarketRow
							key={market.symbol}
							symbol={market.symbol}
							name={market.name}
							price={market.price}
							change={market.change}
						/>
					))}
				</div>
			</section>

			<div className='flex items-center gap-3'>
				<button
					disabled={currentPage === 1}
					type='button'
					className={`rounded-lg px-4 py-2 text-sm ${
						currentPage === 1
							? 'cursor-not-allowed bg-slate-800 text-slate-500'
							: 'bg-slate-900 text-white'
					}`}
					onClick={() =>
						navigate({
							search: (prev) => ({
								...prev,
								page: Math.max(1, prev.page - 1),
							}),
						})
					}
				>
					Previous
				</button>

				<button
					disabled={currentPage >= totalPages}
					type='button'
					className={`rounded-lg px-4 py-2 text-sm ${
						currentPage >= totalPages
							? 'cursor-not-allowed bg-slate-800 text-slate-500'
							: 'bg-slate-900 text-white'
					}`}
					onClick={() =>
						navigate({
							search: (prev) => ({
								...prev,
								page: prev.page + 1,
							}),
						})
					}
				>
					Next
				</button>

				<p className='text-sm text-slate-400'>Page {currentPage}</p>
			</div>
		</div>
	);
}
