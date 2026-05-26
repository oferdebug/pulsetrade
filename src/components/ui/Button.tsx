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
	primary:
		'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500',
	secondary:
		'border border-white/5 bg-white/[0.04] text-slate-300 hover:border-white/10 hover:bg-white/[0.07] hover:text-white',
	success:
		'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-300',
	danger:
		'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300',
	ghost: 'bg-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white',
	outline:
		'border border-blue-500/40 bg-transparent text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/60',
};

export default function Button({
	children,
	variant = 'secondary',
	className = '',
	type = 'button',
	disabled = false,
	...props
}: ButtonProps) {
	const disabledClasses = disabled
		? 'cursor-not-allowed opacity-40 pointer-events-none'
		: 'cursor-pointer';

	return (
		<button
			type={type}
			disabled={disabled}
			className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 ${variantClasses[variant]} ${disabledClasses} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}
