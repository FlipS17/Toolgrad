'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Category = {
	id: number
	name: string
	slug: string
	image: string
}

export default function PopularCategories() {
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const res = await fetch('/api/categories')
				if (!res.ok) throw new Error('Ошибка при загрузке категорий')
				const data = await res.json()
				setCategories(data)
			} catch (error) {
				console.error(error)
			} finally {
				setLoading(false)
			}
		}
		fetchCategories()
	}, [])

	return (
		<section className='container mx-auto px-4 py-7'>
			<h2 className='text-2xl font-bold text-center mb-8'>Категории</h2>
			<div className='max-w-7xl mx-auto'>
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center'>
					{loading ? (
						<p>Загрузка...</p>
					) : (
						categories.map(category => (
							<Link
								key={category.id}
								href={`/catalog/${category.slug}`}
								className='group block text-center p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-all w-full max-w-[180px]'
							>
								<div className='relative h-24 w-24 mx-auto mb-3'>
									<Image
										src={category.image}
										alt={category.name}
										fill
										className='object-contain group-hover:scale-105 transition-transform'
										sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw'
									/>
								</div>
								<span className='font-medium text-gray-800 group-hover:text-orange-500'>
									{category.name}
								</span>
							</Link>
						))
					)}
				</div>
			</div>
		</section>
	)
}
