'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CatalogSearch() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const [query, setQuery] = useState(searchParams.get('q') || '')

	useEffect(() => {
		setQuery(searchParams.get('q') || '')
	}, [searchParams])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value)
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		const params = new URLSearchParams(searchParams.toString())

		if (query.trim()) {
			params.set('q', query.trim())
		} else {
			params.delete('q')
		}

		params.set('page', '1')

		router.push(`/catalog?${params.toString()}`)
	}

	return (
		<div className='relative max-w-3xl mx-auto w-full'>
			<form onSubmit={handleSubmit} className='relative w-full'>
				<div className='relative w-full'>
					<input
						type='text'
						value={query}
						onChange={handleChange}
						placeholder='Поиск инструментов...'
						className='w-full px-5 py-3 pl-10 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F89514] focus:border-transparent shadow-sm transition-all duration-200 hover:shadow-md focus:shadow-md outline-none'
					/>
					<div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='18'
							height='18'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<circle cx='11' cy='11' r='8'></circle>
							<line x1='21' y1='21' x2='16.65' y2='16.65'></line>
						</svg>
					</div>
					<button
						type='submit'
						className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#F89514] transition-colors'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='20'
							height='20'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<line x1='5' y1='12' x2='19' y2='12'></line>
							<polyline points='12 5 19 12 12 19'></polyline>
						</svg>
					</button>
				</div>
			</form>
		</div>
	)
}
