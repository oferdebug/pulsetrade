import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { authClient } from '#/lib/auth-client';

export const Route = createFileRoute('/login')({
	component: LoginPage,
});

type AuthMode = 'login' | 'register';

function LoginPage() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<AuthMode>('login');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const isRegister = mode === 'register';

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			const result = isRegister
				? await authClient.signUp.email({
						name,
						email,
						password,
					})
				: await authClient.signIn.email({
						email,
						password,
					});

			if (result.error) {
				setError(result.error.message || 'Authentication failed');
				return;
			}

			await navigate({ to: '/' });
		} catch (error) {
			console.error('Authentication Failed', error);
			setError('Something went wrong. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const switchMode = () => {
		setMode((currentMode) => (currentMode === 'login' ? 'register' : 'login'));
		setError('');
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white'>
			<div className='grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-blue-950/30 md:grid-cols-[1.1fr_0.9fr]'>
				<section className='hidden bg-linear-to-br from-blue-600 via-slate-950 to-emerald-500 p-10 md:block'>
					<div className='flex h-full flex-col justify-between'>
						<div>
							<p className='text-sm font-semibold uppercase tracking-[0.3em] text-blue-100'>
								PulseTrade
							</p>
							<h1 className='mt-6 text-4xl font-bold leading-tight'>
								Trade smarter with a portfolio built around your signals.
							</h1>
							<p className='mt-4 max-w-md text-sm leading-6 text-blue-100/90'>
								Track markets, manage your watchlist, and prepare your trading
								workflow with a secure account foundation.
							</p>
						</div>

						<div className='grid gap-3 text-sm text-slate-100'>
							<div className='rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur'>
								<p className='text-slate-300'>Portfolio Sync</p>
								<p className='mt-1 text-2xl font-bold'>+18.4%</p>
							</div>
							<div className='rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur'>
								<p className='text-slate-300'>Protected Watchlist</p>
								<p className='mt-1 text-2xl font-bold'>Ready</p>
							</div>
						</div>
					</div>
				</section>

				<section className='p-6 sm:p-8 md:p-10'>
					<div>
						<p className='text-sm font-medium text-blue-400'>
							{isRegister ? 'Create your account' : 'Welcome back'}
						</p>
						<h2 className='mt-2 text-3xl font-bold'>
							{isRegister ? 'Start trading smarter' : 'Sign in to PulseTrade'}
						</h2>
						<p className='mt-2 text-sm text-slate-400'>
							{isRegister
								? 'Create your secure trading workspace.'
								: 'Access your watchlist, portfolio and market dashboard.'}
						</p>
					</div>

					<form onSubmit={handleSubmit} className='mt-8 space-y-4'>
						{isRegister ? (
							<div>
								<label
									htmlFor='name'
									className='mb-2 block text-sm font-medium text-slate-300'
								>
									Name
								</label>
								<input
									id='name'
									name='name'
									type='text'
									autoComplete='name'
									required={isRegister}
									value={name}
									onChange={(event) => setName(event.target.value)}
									className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
									placeholder='Ofer Cohen'
								/>
							</div>
						) : null}

						<div>
							<label
								htmlFor='email'
								className='mb-2 block text-sm font-medium text-slate-300'
							>
								Email
							</label>
							<input
								id='email'
								name='email'
								type='email'
								autoComplete='email'
								required
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
								placeholder='you@example.com'
							/>
						</div>

						<div>
							<label
								htmlFor='password'
								className='mb-2 block text-sm font-medium text-slate-300'
							>
								Password
							</label>
							<input
								id='password'
								name='password'
								type='password'
								autoComplete={isRegister ? 'new-password' : 'current-password'}
								required
								minLength={8}
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
								placeholder='Minimum 8 characters'
							/>
						</div>

						{error ? (
							<div className='rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300'>
								{error}
							</div>
						) : null}

						<button
							type='submit'
							disabled={isLoading}
							className='w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60'
						>
							{isLoading
								? isRegister
									? 'Creating account...'
									: 'Signing in...'
								: isRegister
									? 'Create account'
									: 'Sign in'}
						</button>
					</form>

					<div className='mt-6 grid gap-3'>
						<button
							type='button'
							onClick={async () => {
								try {
									await authClient.signIn.social({
										provider: 'google',
										callbackURL: '/',
									});
								} catch (error) {
									console.error('Google Sign In Failed:', error);
									setError('Failed to Sign In With Google');
								}
							}}
							className={
								'w-full rounded-xl border border-slate-700 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100'
							}
						>
							Continue with Google
						</button>
						<button
							type='button'
							disabled
							className='w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-400 opacity-60'
						>
							Continue with GitHub — coming next
						</button>
					</div>

					<p className='mt-6 text-center text-sm text-slate-400'>
						{isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
						<button
							type='button'
							onClick={switchMode}
							className='font-semibold text-blue-400 hover:text-blue-300'
						>
							{isRegister ? 'Sign in' : 'Create one'}
						</button>
					</p>
				</section>
			</div>
		</div>
	);
}
