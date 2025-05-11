'use client'

import { Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type Product = {
	id: number
	name: string
	price: number
	oldPrice?: number | null
	images: string[]
	brand?: {
		name: string
	}
}

type ProductCardProps = {
	product: Product
	isFavorite: boolean
	onToggleFavorite: (id: number) => void
}

export default function ProductCard({
	product,
	isFavorite,
	onToggleFavorite,
}: ProductCardProps) {
	return (
		<div className='relative bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group w-full h-full flex flex-col'>
			{/* Изображение (фиксированная высота) */}
			<Link href={`/product/${product.id}`} className='block flex-shrink-0'>
				<div className='relative w-full pt-[100%] bg-gray-50'>
					<div className='absolute inset-0 flex items-center justify-center p-4'>
						<Image
							src={product.images[0] || '/placeholder.png'}
							alt={product.name}
							fill
							className='object-contain transition-transform duration-200 group-hover:scale-[1.03]'
							sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
							priority={false}
						/>
					</div>
				</div>
			</Link>

			{/* Текстовая часть (гибкий блок) */}
			<div className='p-3 flex-grow flex flex-col'>
				<div className='mb-1 flex-grow'>
					<Link href={`/product/${product.id}`}>
						<h3 className='text-sm font-medium text-gray-800 line-clamp-2 hover:text-[#F89514] transition-colors'>
							{product.name}
						</h3>
					</Link>
				</div>

				{product.brand && (
					<p className='text-xs text-gray-500 mb-1'>{product.brand.name}</p>
				)}

				<div className='mt-auto'>
					{product.oldPrice && (
						<span className='text-xs text-gray-400 line-through block'>
							{product.oldPrice.toLocaleString('ru-RU')} ₽
						</span>
					)}
					<span className='text-base font-bold text-[#F89514]'>
						{product.price.toLocaleString('ru-RU')} ₽
					</span>
				</div>
			</div>

			{/* Кнопка избранного (увеличенное сердечко) */}
			<button
				onClick={e => {
					e.preventDefault()
					onToggleFavorite(product.id)
				}}
				className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
					isFavorite
						? 'text-red-500 opacity-100'
						: 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-400'
				}`}
				aria-label={
					isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'
				}
			>
				<Heart
					className='w-5 h-5'
					fill={isFavorite ? 'currentColor' : 'none'}
					strokeWidth={1.5}
				/>
			</button>
		</div>
	)
}
