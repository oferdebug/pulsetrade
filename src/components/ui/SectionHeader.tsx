import type { ReactNode } from 'react';

type SectionHeaderProps = {
	title: string;
	description?: string;
	rightSlot?: ReactNode;
};

export default function SectionHeader({
	title,
	description,
	rightSlot,
}: SectionHeaderProps) {
	return (
		<div className='mb-5 flex items-start justify-between gap-4'>
			<div>
				<h2 className='text-base font-semibold tracking-tight text-white'>
					{title}
				</h2>

				{description ? (
					<p className='mt-1 text-sm leading-6 text-slate-500'>{description}</p>
				) : null}
			</div>

			{rightSlot ? <div className='shrink-0'>{rightSlot}</div> : null}
		</div>
	);
}
