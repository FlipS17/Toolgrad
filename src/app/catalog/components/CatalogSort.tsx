'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function CatalogSort() {
	const searchParams = useSearchParams()
	const router = useRouter()

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('sort', e.target.value)
		router.push(`?${params.toString()}`)
	}

	return (
		<select
			defaultValue={searchParams.get('sort') || 'newest'}
			onChange={handleChange}
			className='bg-white border border-gray-200 text-gray-700 py-2 px-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F89514] text-sm shadow-sm'
		>
			<option value='newest'>Сначала новые</option>
			<option value='priceAsc'>Сначала дешевые</option>
			<option value='priceDesc'>Сначала дорогие</option>
		</select>
	)
}
