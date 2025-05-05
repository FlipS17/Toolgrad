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
				<input
					type='text'
					value={query}
					onChange={e => setQuery(e.target.value)}
					onFocus={() => {
						if (results.length > 0) setShowDropdown(true)
					}}
					placeholder='Ищите инструменты...'
					className='w-full px-6 py-4 rounded-full border border-gray-300 focus:ring-[#F89514] shadow-lg focus:outline-none'
				/>
			</form>

			{showDropdown && (
				<div className='absolute bg-white shadow-lg w-full mt-2 rounded-xl z-50 max-h-[300px] overflow-y-auto'>
					{loading && <p className='p-4 text-gray-500'>Загрузка...</p>}
					{!loading && results.length === 0 && (
						<p className='p-4 text-gray-500'>Ничего не найдено</p>
					)}
					{results.map(product => (
						<SearchCard key={product.id} product={product} />
					))}
				</div>
			)}
		</div>
	)
}
