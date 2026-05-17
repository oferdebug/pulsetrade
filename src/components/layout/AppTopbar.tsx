export default function AppTopbar() {
	return (
		<header
			className={
				'flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6'
			}
		>
			<input
				type='text'
				placeholder='Search tickers, news, markets...'
				className={
					'w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none'
				}
			/>

			<div className={'ml-4 flex items-center gap-3 text-sm text-slate-400'}>
				<span>Market Open</span>
				<span>👤</span>
			</div>
		</header>
	);
}
