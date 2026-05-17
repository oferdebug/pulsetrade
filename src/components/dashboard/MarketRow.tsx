type MarketRowProps = {
	symbol: string;
	name: string;
	price: string;
	change: string;
};

export default function MarketRow({
	symbol,
	name,
	price,
	change,
}: MarketRowProps) {
	const isPositive = change.startsWith('+');
	return (
		<div className='flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3'>
			<div>
				<h3 className='font-semibold text-white'>{symbol}</h3>
				<p className='font-semibold text-white'>{name}</p>
			</div>

			<div className='text-right'>
				<p className='font-semibold text-white'>{price}</p>
				<p
					className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}
				>
					{change}
				</p>
			</div>
		</div>
	);
}
