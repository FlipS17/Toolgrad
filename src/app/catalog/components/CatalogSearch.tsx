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

		// Создаем новый объект параметров на основе текущих
		const params = new URLSearchParams(searchParams.toString())

		if (query.trim()) {
			params.set('q', query.trim())
		} else {
			params.delete('q')
		}

		// При изменении запроса сбрасываем страницу на первую
		params.set('page', '1')

		router.push(`/catalog?${params.toString()}`)
	}

	return (
		<form onSubmit={handleSubmit} className='relative flex items-center'>
			<input
				type='text'
				value={query}
				onChange={handleChange}
				placeholder='Поиск по каталогу'
				className='w-full px-6 py-3 rounded-xl border border-gray-300 focus:ring-[#F89514] focus:border-transparent shadow-sm'
			/>
			<button
				type='submit'
				className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#F89514] transition'
			>
				🔍
			</button>
		</form>
	)
}
