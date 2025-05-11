'use client'

import SearchCard from '@/app/components/SearchCard'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Product = {
	id: number
	name: string
	price: number
	images: string[]
	brand?: { name: string }
}

export default function HomeSearch() {
	const router = useRouter()
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<Product[]>([])
	const [loading, setLoading] = useState(false)
	const [showDropdown, setShowDropdown] = useState(false)

	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setShowDropdown(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	useEffect(() => {
		const delay = setTimeout(() => {
			if (query.trim().length > 1) {
				setLoading(true)
				fetch(`/api/search?q=${encodeURIComponent(query)}`)
					.then(res => res.json())
					.then(data => {
						setResults(data)
						setShowDropdown(true)
					})
					.finally(() => setLoading(false))
			} else {
				setResults([])
				setShowDropdown(false)
			}
		}, 400)

		return () => clearTimeout(delay)
	}, [query])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		router.push(`/catalog?q=${encodeURIComponent(query)}`)
		setShowDropdown(false)
	}

	return (
		<div className='relative max-w-3xl mx-auto' ref={ref}>
			<form onSubmit={handleSubmit}>
				<div className='relative'>
					<input
						type='text'
						value={query}
						onChange={e => setQuery(e.target.value)}
						onFocus={() => {
							if (results.length > 0) setShowDropdown(true)
						}}
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
				</div>
			</form>

			{showDropdown && (
				<div className='absolute bg-white shadow-xl w-full mt-2 rounded-xl z-50 max-h-[400px] overflow-y-auto border border-gray-100'>
					{loading && (
						<div className='p-4 flex justify-center'>
							<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-[#F89514]'></div>
						</div>
					)}
					{!loading && results.length === 0 && (
						<p className='p-4 text-gray-500 text-center'>Ничего не найдено</p>
					)}
					{results.map(product => (
						<SearchCard key={product.id} product={product} />
					))}
				</div>
			)}
		</div>
	)
}
