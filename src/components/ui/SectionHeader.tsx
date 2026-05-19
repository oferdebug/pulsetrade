type SectionHeaderProps = {
	title: string;
	description?: string;
	rightSlot?: React.ReactNode;
};

export default function SectionHeader({
	title,
	description,
	rightSlot,
}: SectionHeaderProps) {
	return (
		<div className={'mb-4 flex items-center justify-between'}>
			<div>
				<h2 className={'text-lg font-semibold text-white'}>{title}</h2>

				{description ? (
					<p className={'mt-1 text-sm text-slate-400'}>{description}</p>
				) : null}
			</div>

			{rightSlot ? <div>{rightSlot}</div> : null}
		</div>
	);
}
