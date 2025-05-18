'use client'

import { useCart } from '@/app/cart/components/CartProvider'
import FavoriteToggleButton from '@/app/catalog/components/FavoriteToggleButton'
import { useNotification } from '@/app/components/NotificationProvider'
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
	createdAt: Date
}

type ProductCardProps = {
	product: Product
	isFavorite: boolean
	onToggleFavorite: (id: number) => Promise<boolean>
	onAddToCart: (id: number) => void
}

export default function ProductCard({
	product,
	isFavorite,
	onToggleFavorite,
	onAddToCart,
}: ProductCardProps) {
	const isNew =
		Date.now() - new Date(product.createdAt).getTime() <
		1000 * 60 * 60 * 24 * 14

	const discount =
		product.oldPrice && product.oldPrice > product.price
			? Math.round(100 - (product.price / product.oldPrice) * 100)
			: null

	const { notify } = useNotification()
	const { addToCart, isInCart, refreshCart } = useCart()

	const handleCartClick = async () => {
		if (!isInCart(product.id)) {
			await addToCart(product.id)
			await refreshCart()
		}
	}

	const handleFavoriteClick = async () => {
		const result = await onToggleFavorite(product.id)
		if (result === true) {
			notify('Товар добавлен в избранное', 'success')
		} else if (result === false && isFavorite) {
			notify('Товар удалён из избранного', 'info')
		}
	}

	return (
		<div className='relative flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden w-full max-w-sm mx-auto group'>
			{/* Бейджи */}
			<div className='absolute top-2 left-2 z-10 flex flex-col gap-1'>
				{isNew && (
					<span className='bg-green-500 text-white font-semibold px-2 py-[2px] rounded text-[11px] sm:text-xs text-center min-w-[52px]'>
						Новинка
					</span>
				)}
				{discount && (
					<span className='bg-red-500 text-white font-semibold px-2 py-[2px] rounded text-[11px] sm:text-xs text-center min-w-[52px]'>
						-{discount}%
					</span>
				)}
			</div>

			{/* Сердце */}
			<div className='absolute top-2 right-2 z-10'>
				<FavoriteToggleButton
					isFavorite={isFavorite}
					onToggle={handleFavoriteClick}
					variant='icon-only'
				/>
			</div>

			{/* Картинка */}
			<div className='relative w-full pt-[80%] bg-gray-50'>
				<Link href={`/product/${product.id}`} className='absolute inset-0'>
					<Image
						src={product.images[0] || '/placeholder.png'}
						alt={product.name}
						fill
						className='object-contain p-4 transition-transform duration-200 group-hover:scale-105'
						sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
					/>
				</Link>
			</div>

			{/* Контент */}
			<div className='flex flex-col p-3 gap-2 flex-1'>
				<Link href={`/product/${product.id}`}>
					<h3 className='text-sm font-medium text-gray-900 line-clamp-2 hover:text-[#F89514] transition-colors'>
						{product.name}
					</h3>
				</Link>

				{product.brand?.name && (
					<span className='text-xs text-gray-500'>{product.brand.name}</span>
				)}

				<div className='flex items-baseline gap-2 flex-wrap'>
					<span className='text-base font-bold text-[#F89514]'>
						{product.price.toLocaleString('ru-RU')} ₽
					</span>
					{product.oldPrice && product.oldPrice > product.price && (
						<span className='text-xs text-gray-400 line-through'>
							{product.oldPrice.toLocaleString('ru-RU')} ₽
						</span>
					)}
				</div>

				<button
					onClick={handleCartClick}
					className={`w-full mt-1 ${
						isInCart(product.id)
							? 'bg-gray-300 cursor-not-allowed'
							: 'bg-[#F89514] hover:bg-[#d97c0f]'
					} text-white text-sm font-medium py-2 rounded transition`}
					disabled={isInCart(product.id)}
				>
					{isInCart(product.id) ? 'В корзине' : 'В корзину'}
				</button>
			</div>
		</div>
	)
}
