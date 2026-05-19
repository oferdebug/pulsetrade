import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
	children: ReactNode;
};

export default function Card({
	children,
	className = '',
	...props
}: CardProps) {
	return (
		<div
			className={`rounded-2xl border border-slate-800 bg-slate-950 p-5 ${className}`}
			{...props}
		>
			{children}
		</div>
	);
}
