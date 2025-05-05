'use client'

import { Brand } from '@/../generated/prisma'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Props = {
	brands: Brand[]
	isMobile?: boolean
	onClose?: () => void
}

export default function CatalogFilters({
	brands,
	isMobile = false,
	onClose,
}: Props) {
	const searchParams = useSearchParams()
	const router = useRouter()

	const [minPrice, setMinPrice] = useState<number>(0)
	const [maxPrice, setMaxPrice] = useState<number>(100000)
	const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

	useEffect(() => {
		const brand = searchParams.get('brand')
		const min = Number(searchParams.get('minPrice') || 0)
		const max = Number(searchParams.get('maxPrice') || 100000)

		setSelectedBrand(brand)
		setMinPrice(min)
		setMaxPrice(max)
	}, [searchParams])

	const updateParams = (newParams: Record<string, string | null>) => {
		const params = new URLSearchParams(searchParams.toString())

		Object.entries(newParams).forEach(([key, value]) => {
			if (value === null || value === '') {
				params.delete(key)
			} else {
				params.set(key, value)
			}
		})

		router.push(`?${params.toString()}`)
		if (onClose) onClose()
	}

	return (
		<div className='flex flex-col gap-6'>
			<div>
				<h3 className='font-medium text-gray-900 mb-3'>Бренды</h3>
				<div className='max-h-60 overflow-y-auto pr-2 space-y-2'>
					{brands.map(brand => (
						<div key={brand.id} className='flex items-center gap-2'>
							<input
								type='radio'
								name='brand'
								checked={selectedBrand === brand.slug}
								onChange={() => updateParams({ brand: brand.slug })}
								className='w-4 h-4 accent-[#F89514]'
							/>
							<label className='text-sm text-gray-700'>{brand.name}</label>
						</div>
					))}
				</div>
				<button
					onClick={() => updateParams({ brand: null })}
					className='mt-2 text-sm text-[#F89514] hover:underline'
				>
					Сбросить выбор
				</button>
			</div>

			<div>
				<h3 className='font-medium text-gray-900 mb-3'>Цена, ₽</h3>
				<div className='grid grid-cols-2 gap-3'>
					<input
						type='number'
						value={minPrice}
						onChange={e => setMinPrice(Number(e.target.value))}
						placeholder='От'
						className='border px-3 py-2 rounded-lg text-sm'
					/>
					<input
						type='number'
						value={maxPrice}
						onChange={e => setMaxPrice(Number(e.target.value))}
						placeholder='До'
						className='border px-3 py-2 rounded-lg text-sm'
					/>
				</div>
				<button
					onClick={() =>
						updateParams({
							minPrice: String(minPrice),
							maxPrice: String(maxPrice),
						})
					}
					className='mt-2 text-sm text-[#F89514] hover:underline'
				>
					Применить
				</button>
			</div>

			{isMobile && (
				<button
					onClick={onClose}
					className='bg-[#F89514] text-white px-4 py-2 rounded-xl mt-6'
				>
					Применить фильтры
				</button>
			)}
		</div>
	)
}
