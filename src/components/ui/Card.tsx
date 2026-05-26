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
			className={`rounded-3xl border border-white/6 bg-slate-900/80 p-5 shadow-xl shadow-black/30 ${className}`}
			{...props}
		>
			{children}
		</div>
	);
}
