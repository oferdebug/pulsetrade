export default function MarketChartCard() {
	return (
		<section className='rounded-2xl border border-slate-800 bg-slate-950 p-6'>
			<div className='mb-6 flex items-center justify-between'>
				<div>
					<h2 className='text-lg font-semibold text-white'>S&P 500 Overview</h2>
					<p className='mt-2 text-sm text-slate-400'>
						Market trend and intraday movement
					</p>
				</div>

				<div className='flex items-center gap-2'>
					<button
						type='button'
						className='h-8 min-w-10 rounded-lg bg-slate-900 px-3 text-xs text-slate-300'
					>
						1D
					</button>
					<button
						type='button'
						className='h-8 min-w-10 rounded-lg bg-slate-900 px-3 text-xs text-slate-300'
					>
						1W
					</button>
					<button
						type='button'
						className='h-8 min-w-10 rounded-lg bg-emerald-500 px-3 text-xs font-medium text-black'
					>
						1M
					</button>
				</div>
			</div>

			<div className='relative h-[380px] overflow-hidden rounded-2xl border border-slate-800 bg-linear-to-b from-slate-900 to-slate-950 p-2'>
				<div className='absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[40px_40px] opacity-30' />

				<svg
					viewBox='0 0 600 300'
					className='relative z-10 h-full w-full'
					preserveAspectRatio='none'
					aria-labelledby='market-chart-title'
				>
					<title id='market-chart-title'>Market price chart</title>
					<path
						d='M0 240 C60 220, 100 180, 160 190 C220 200, 260 120, 320 140 C380 160, 420 100, 480 120 C540 140, 570 80, 600 60'
						fill='none'
						stroke='#00ffb2'
						strokeWidth='4'
						strokeLinecap='round'
					/>
					<path
						d='M0 240 C60 220, 100 180, 160 190 C220 200, 260 120, 320 140 C380 160, 420 100, 480 120 C540 140, 570 80, 600 60'
						fill='url(#gradient)'
						stroke='none'
						opacity='0.15'
					/>
					<defs>
						<linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
							<stop offset='0%' stopColor='#00ffb2' />
							<stop offset='100%' stopColor='#00ffb2' stopOpacity='0' />
						</linearGradient>
					</defs>
				</svg>
			</div>
		</section>
	);
}
