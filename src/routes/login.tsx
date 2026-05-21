import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { authClient } from '#/lib/auth-client';
export const Route = createFileRoute('/login')({
	component: LoginComponent,
});

function LoginComponent() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');
		try {
			const result = await authClient.signIn.email({ email, password });
			if (result.error) {
				setError(result.error.message || 'Authentication failed');
			} else {
				window.location.href = '/';
			}
		} catch {
			setError('An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');
		// TODO: Implement sign up logic
		setIsLoading(false);
	};
	return (
		<div className={'min-h-screen flex items-center justify-center bg-gray-50'}>
			<div className={'max-w-md w-full space-y-8'}>
				<div>
					<h2
						className={'mt-6 text-center text-3xl font-extrabold text-gray-900'}
					>
						Sign In To Your Account
					</h2>
				</div>
				<form className={'mt-8 space-y-6'} onSubmit={handleSignIn}>
					{error && (
						<div
							className={
								'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
							}
							role='alert'
						>
							{error}
						</div>
					)}
					<div className={'rounded-md shadow-sm -space-y-px'}>
						<div>
							<label htmlFor='email' className={'sr-only'}>
								Email address
							</label>
							<input
								id='email'
								name='email'
								type='email'
								autoComplete='email'
								required
								className={
									'appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
								}
								placeholder='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
					</div>
					<div>
						<label htmlFor='password' className={'sr-only'}>
							Password
						</label>
						<input
							id='password'
							name='password'
							type='password'
							autoComplete='password'
							required
							className={
								'appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
							}
							placeholder='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
				</form>
				<div className={'flex-space-x-4'}>
					<button
						type='submit'
						disabled={isLoading}
						className={
							'group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
						}
					>
						{isLoading ? 'Signing in...' : 'Sign in'}
					</button>
					<button
						type='button'
						onClick={handleSignUp}
						disabled={isLoading}
						className={
							'group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50'
						}
					>
						{isLoading ? 'Signing up...' : 'Sign up'}
					</button>
				</div>
			</div>
		</div>
	);
}
