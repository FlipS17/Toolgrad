'use client'

import { useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string
	error?: string
	type?: string
}

export default function Input({
	label,
	error,
	type = 'text',
	...props
}: InputProps) {
	const [show, setShow] = useState(false)
	const isPassword = type === 'password'

	return (
		<div className='space-y-1 w-full'>
			<label className='text-sm font-medium text-gray-700'>{label}</label>
			<div className='relative'>
				<input
					{...props}
					type={isPassword && !show ? 'password' : 'text'}
					className={`w-full rounded-xl border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F89514] transition ${
						error ? 'border-red-500' : 'border-gray-300'
					}`}
				/>
				{isPassword && (
					<button
						type='button'
						onClick={() => setShow(!show)}
						className='absolute inset-y-0 right-3 flex items-center'
					>
						{/* SVG-глазик */}
						{show ? (
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='w-5 h-5 text-gray-500'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7
                         -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
								/>
							</svg>
						) : (
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='w-5 h-5 text-gray-500'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943
                         -9.542-7a9.957 9.957 0 012.198-3.568M6.163 6.163A9.956
                         9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.964
                         9.964 0 01-4.284 5.163M3 3l18 18'
								/>
							</svg>
						)}
					</button>
				)}
			</div>
			{error && <p className='text-sm text-red-500'>{error}</p>}
		</div>
	)
}
