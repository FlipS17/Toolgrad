'use client'

import { Brand } from '@/../generated/prisma'
import { useRouter, useSearchParams } from 'next/navigation'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useMemo, useState } from 'react'

interface CatalogFiltersProps {
	brands: Brand[]
	categories?: { id: number; name: string; slug: string }[]
	isMobile?: boolean
	onClose?: () => void
}

export default function CatalogFilters({
	brands,
	categories = [],
	isMobile = false,
	onClose,
}: CatalogFiltersProps) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const selectedBrands = useMemo(
		() => searchParams.getAll('brand'),
		[searchParams]
	)
	const selectedCategories = useMemo(
		() => searchParams.getAll('category'),
		[searchParams]
	)
	const selectedRating = searchParams.get('rating')
	const showOnlyAvailable = searchParams.get('inStock') === 'true'

	const minPriceParam = parseInt(searchParams.get('minPrice') || '0', 10)
	const maxPriceParam = parseInt(searchParams.get('maxPrice') || '200000', 10)

	const [priceRange, setPriceRange] = useState<[number, number]>([
		minPriceParam,
		maxPriceParam,
	])
	const [searchBrand, setSearchBrand] = useState('')
	const [searchCategory, setSearchCategory] = useState('')

	const updateMultiParam = (key: string, value: string) => {
		const params = new URLSearchParams(searchParams.toString())
		const existing = params.getAll(key)

		if (existing.includes(value)) {
			const filtered = existing.filter(v => v !== value)
			params.delete(key)
			filtered.forEach(val => params.append(key, val))
		} else {
			params.append(key, value)
		}

		router.push(`?${params.toString()}`)
	}

	const updateParam = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString())
		if (value === null) {
			params.delete(key)
		} else {
			params.set(key, value)
		}
		router.push(`?${params.toString()}`)
	}

	const resetFilters = () => {
		router.push('?')
		if (onClose) onClose()
	}

	const applyPriceFilter = () => {
		updateParam('minPrice', String(priceRange[0]))
		updateParam('maxPrice', String(priceRange[1]))
		if (isMobile && onClose) onClose()
	}

	const filteredBrands = useMemo(() => {
		if (searchBrand.trim()) {
			return brands.filter(b =>
				b.name.toLowerCase().includes(searchBrand.toLowerCase())
			)
		}
		return brands
	}, [brands, searchBrand])

	const filteredCategories = useMemo(() => {
		if (searchCategory.trim()) {
			return categories.filter(c =>
				c.name.toLowerCase().includes(searchCategory.toLowerCase())
			)
		}
		return categories
	}, [categories, searchCategory])

	return (
		<div className='space-y-6 text-sm text-gray-800'>
			{/* Цена */}
			<div>
				<h3 className='font-semibold mb-2'>Цена, ₽</h3>
				<div className='flex gap-2 mb-3'>
					<input
						type='number'
						className='w-full border rounded-lg px-3 py-2 text-sm'
						value={priceRange[0]}
						onChange={e =>
							setPriceRange([Number(e.target.value), priceRange[1]])
						}
					/>
					<input
						type='number'
						className='w-full border rounded-lg px-3 py-2 text-sm'
						value={priceRange[1]}
						onChange={e =>
							setPriceRange([priceRange[0], Number(e.target.value)])
						}
					/>
				</div>
				<Slider
					range
					min={0}
					max={200000}
					step={100}
					defaultValue={priceRange}
					value={priceRange}
					onChange={val => setPriceRange(val as [number, number])}
					trackStyle={[{ backgroundColor: '#F89514' }]}
					handleStyle={[
						{ borderColor: '#F89514', backgroundColor: '#F89514' },
						{ borderColor: '#F89514', backgroundColor: '#F89514' },
					]}
				/>
				<button
					onClick={applyPriceFilter}
					className='mt-2 w-full bg-[#F89514] text-white py-2 rounded-xl hover:bg-orange-600 transition'
				>
					Применить
				</button>
			</div>

			{/* Поиск бренда */}
			<div>
				<h3 className='font-semibold mb-2'>Бренды</h3>
				<input
					type='text'
					placeholder='Поиск бренда...'
					value={searchBrand}
					onChange={e => setSearchBrand(e.target.value)}
					className='w-full border px-3 py-2 rounded-lg text-sm mb-2'
				/>
				<div className='max-h-56 overflow-y-auto pr-1 space-y-2'>
					{filteredBrands.map(brand => (
						<label key={brand.id} className='flex items-center space-x-2'>
							<input
								type='checkbox'
								checked={selectedBrands.includes(brand.slug)}
								onChange={() => updateMultiParam('brand', brand.slug)}
							/>
							<span>{brand.name}</span>
						</label>
					))}
				</div>
			</div>

			{/* Категории */}
			<div>
				<h3 className='font-semibold mb-2'>Категории</h3>
				<input
					type='text'
					placeholder='Поиск категории...'
					value={searchCategory}
					onChange={e => setSearchCategory(e.target.value)}
					className='w-full border px-3 py-2 rounded-lg text-sm mb-2'
				/>
				<div className='max-h-56 overflow-y-auto pr-1 space-y-2'>
					{filteredCategories.map(cat => (
						<label key={cat.id} className='flex items-center space-x-2'>
							<input
								type='checkbox'
								checked={selectedCategories.includes(cat.slug)}
								onChange={() => updateMultiParam('category', cat.slug)}
							/>
							<span>{cat.name}</span>
						</label>
					))}
				</div>
			</div>

			{/* Рейтинг */}
			<div>
				<h3 className='font-semibold mb-2'>Рейтинг</h3>
				<div className='space-y-2'>
					{['5', '4', '3'].map(r => (
						<label key={r} className='flex items-center space-x-2'>
							<input
								type='radio'
								name='rating'
								checked={selectedRating === r}
								onChange={() => updateParam('rating', r)}
							/>
							<span>{r} звезды и выше</span>
						</label>
					))}
					<label className='flex items-center space-x-2'>
						<input
							type='radio'
							name='rating'
							checked={!selectedRating}
							onChange={() => updateParam('rating', null)}
						/>
						<span>Все</span>
					</label>
				</div>
			</div>

			{/* В наличии */}
			<div>
				<h3 className='font-semibold mb-2'>Наличие</h3>
				<label className='flex items-center space-x-2'>
					<input
						type='checkbox'
						checked={showOnlyAvailable}
						onChange={() =>
							updateParam('inStock', showOnlyAvailable ? null : 'true')
						}
					/>
					<span>Только в наличии</span>
				</label>
			</div>

			{/* Сброс и закрытие */}
			{isMobile && (
				<div className='pt-4 border-t border-gray-200 mt-4 flex justify-between items-center'>
					<button
						onClick={resetFilters}
						className='text-sm text-[#F89514] underline'
					>
						Сбросить фильтры
					</button>
					<button onClick={onClose} className='text-sm text-gray-500'>
						Закрыть
					</button>
				</div>
			)}
		</div>
	)
}
