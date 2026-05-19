import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'danger'
	| 'ghost'
	| 'outline';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode;
	variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
	primary: 'bg-blue-600 text-white hover:bg-blue-500',
	secondary: 'bg-slate-900 text-slate-300 hover:bg-slate-800',
	success: 'bg-emerald-500 text-black hover:bg-emerald-400',
	danger: 'bg-rose-500 text-white hover:bg-rose-400',
	ghost: 'bg-slate-900 text-slate-300 hover:bg-slate-800',
	outline:
		'border border-blue-500/60 bg-transparent text-blue-400 hover:bg-blue-500/10',
};

export default function Button({
	children,
	variant = 'secondary',
	className = '',
	type = 'button',
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${variantClasses[variant]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}
