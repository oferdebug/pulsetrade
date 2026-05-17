type StartCardProps = {
	title: string;
	value: string;
	change?: string;
};
export default function StatCard({ title, value, change }: StartCardProps) {
	return (
		<div className={'rounded-2xl border border-slate-800 bg-slate-900 p-5'}>
			<p className={'text-sm text-slate-400'}>{title}</p>
			<div className={'mt-3 flex items-end justify-between'}>
				<h3 className={'text-2xl font-bold text-white'}>{value}</h3>
				{change ? (
					<span className={'text-sm font-medium text-emerald-400'}>
						{change}
					</span>
				) : null}
			</div>
		</div>
	);
}
