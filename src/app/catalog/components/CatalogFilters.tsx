'use client'

import { Brand } from '@/../generated/prisma'
import AuthButton from '@/app/account/components/AuthButton'
import DOMPurify from 'dompurify'
import { useRouter, useSearchParams } from 'next/navigation'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useEffect, useMemo, useState } from 'react'

interface CatalogFiltersProps {
	brands: Brand[]
	categories?: { id: number; name: string; slug: string }[]
	maxAvailablePrice?: number
	isMobile?: boolean
	onClose?: () => void
}

export default function CatalogFilters({
	brands,
	categories = [],
	maxAvailablePrice = 200000,
	isMobile = false,
	onClose,
}: CatalogFiltersProps) {
	const router = useRouter()
	const searchParams = useSearchParams()

	//Выводим бренды и категории
	const selectedBrands = useMemo(
		() => searchParams.getAll('brand'),
		[searchParams]
	)
	const selectedCategories = useMemo(
		() => searchParams.getAll('category'),
		[searchParams]
	)

	//Выставление цены, шаг
	const minPriceParam = parseInt(searchParams.get('minPrice') || '0', 10)
	const maxPriceParam = parseInt(
		searchParams.get('maxPrice') || String(maxAvailablePrice),
		10
	)

	const [priceRange, setPriceRange] = useState<[number, number]>([
		minPriceParam,
		maxPriceParam,
	])
	const [searchBrand, setSearchBrand] = useState('')
	const [searchCategory, setSearchCategory] = useState('')

	useEffect(() => {
		setPriceRange([minPriceParam, maxPriceParam])
	}, [minPriceParam, maxPriceParam])

	// Обновление параметров для множественного выбора
	const toggleParam = (key: string, value: string) => {
		const params = new URLSearchParams(searchParams.toString())
		const currentValues = new Set(params.getAll(key))
		if (currentValues.has(value)) {
			currentValues.delete(value)
		} else {
			currentValues.add(value)
		}
		params.delete(key)
		currentValues.forEach(v => params.append(key, v))
		router.replace(`?${params.toString()}`)
	}

	// Применение фильтра по цене
	const applyPriceFilter = () => {
		const params = new URLSearchParams(searchParams.toString())
		params.set('minPrice', String(priceRange[0]))
		params.set('maxPrice', String(priceRange[1]))
		router.replace(`?${params.toString()}`)
		if (isMobile && onClose) onClose()
	}

	// Сброс всех фильтров
	const resetFilters = () => {
		router.replace('?')
		setPriceRange([0, maxAvailablePrice])
		if (onClose) onClose()
	}

	// Поиск по брендам и категориям
	const filteredBrands = useMemo(() => {
		return searchBrand.trim()
			? brands.filter(b =>
					b.name.toLowerCase().includes(searchBrand.toLowerCase())
			  )
			: brands
	}, [brands, searchBrand])

	const filteredCategories = useMemo(() => {
		return searchCategory.trim()
			? categories.filter(c =>
					c.name.toLowerCase().includes(searchCategory.toLowerCase())
			  )
			: categories
	}, [categories, searchCategory])

	return (
		<div className='space-y-6 text-sm text-gray-800'>
			{/* Фильтр по цене */}
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
					max={maxAvailablePrice}
					step={100}
					value={priceRange}
					onChange={val => setPriceRange(val as [number, number])}
					trackStyle={[{ backgroundColor: '#F89514' }]}
					handleStyle={[
						{ borderColor: '#F89514', backgroundColor: '#F89514' },
						{ borderColor: '#F89514', backgroundColor: '#F89514' },
					]}
				/>
				<div className='mt-2'>
					<AuthButton label='Применить' onClick={applyPriceFilter} />
				</div>
			</div>

			{/* Фильтр по брендам */}
			<div>
				<h3 className='font-semibold mb-2'>Бренды</h3>
				<input
					type='text'
					placeholder='Поиск бренда...'
					value={searchBrand}
					onChange={e => setSearchBrand(DOMPurify.sanitize(e.target.value))}
					className='w-full border px-3 py-2 rounded-lg text-sm mb-2'
				/>
				<div
					className={`space-y-2 ${
						filteredBrands.length > 9 ? 'max-h-56 overflow-y-auto pr-1' : ''
					}`}
					style={{ overscrollBehavior: 'contain' }}
				>
					{filteredBrands.map(brand => (
						<label key={brand.id} className='flex items-center space-x-2'>
							<input
								type='checkbox'
								checked={selectedBrands.includes(brand.slug)}
								onChange={() => toggleParam('brand', brand.slug)}
							/>
							<span>{brand.name}</span>
						</label>
					))}
				</div>
			</div>

			{/* Фильтр по категориям */}
			<div>
				<h3 className='font-semibold mb-2'>Категории</h3>
				<input
					type='text'
					placeholder='Поиск категории...'
					value={searchCategory}
					onChange={e => setSearchCategory(DOMPurify.sanitize(e.target.value))}
					className='w-full border px-3 py-2 rounded-lg text-sm mb-2'
				/>
				<div
					className={`space-y-2 ${
						filteredCategories.length > 9 ? 'max-h-56 overflow-y-auto pr-1' : ''
					}`}
					style={{ overscrollBehavior: 'contain' }}
				>
					{filteredCategories.map(cat => (
						<label key={cat.id} className='flex items-center space-x-2'>
							<input
								type='checkbox'
								checked={selectedCategories.includes(cat.slug)}
								onChange={() => toggleParam('category', cat.slug)}
							/>
							<span>{cat.name}</span>
						</label>
					))}
				</div>
			</div>

			{/* Сброс фильтров и закрытие на мобилке */}
			<div className='pt-2 border-t border-gray-200 mt-4 flex justify-between items-center'>
				<AuthButton label='Сбросить фильтры' onClick={resetFilters} />
			</div>
		</div>
	)
}
