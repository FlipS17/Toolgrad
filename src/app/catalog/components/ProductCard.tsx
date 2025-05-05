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
		<div className='relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group'>
			<Link href={`/product/${product.id}`} className='block'>
				<div className='relative w-full aspect-[3/4] bg-gray-50 flex items-center justify-center p-4'>
					<Image
						src={product.images[0] || '/placeholder.png'}
						alt={product.name}
						fill
						className='object-contain transition-transform duration-300 group-hover:scale-[1.03]'
						sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
					/>
				</div>
			</Link>

			<div className='p-4'>
				<Link href={`/product/${product.id}`}>
					<h3 className='text-sm font-semibold text-gray-900 line-clamp-2 mb-1 hover:text-[#F89514] transition'>
						{product.name}
					</h3>
				</Link>

				{product.brand && (
					<p className='text-xs text-gray-500 mb-2'>{product.brand.name}</p>
				)}

				<div className='flex flex-col'>
					<span className='text-base font-bold text-[#F89514]'>
						{product.price.toLocaleString('ru-RU')} ₽
					</span>
					{product.oldPrice && (
						<span className='text-xs text-gray-400 line-through'>
							{product.oldPrice.toLocaleString('ru-RU')} ₽
						</span>
					)}
				</div>
			</div>

			<button
				onClick={e => {
					e.preventDefault()
					onToggleFavorite(product.id)
				}}
				className='absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow hover:scale-110 transition-all duration-200'
				aria-label={
					isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'
				}
			>
				<Heart
					className={`w-4 h-4 ${
						isFavorite ? 'text-red-500' : 'text-gray-400'
					} transition-colors`}
					fill={isFavorite ? 'currentColor' : 'none'}
					strokeWidth={1.5}
				/>
			</button>
		</div>
	)
}
