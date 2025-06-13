'use client'

import AuthButton from '@/app/account/components/AuthButton'
import axios from 'axios'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Props {
	onReserve?: () => void
	disabled?: boolean
	onItemsLoaded?: (ids: number[]) => void
}

interface CartItem {
	id: number
	quantity: number
	product: {
		id: number
		name: string
		price: number
		oldPrice?: number
		images: string[]
		brand?: { name: string }
	}
}

export default function PickupCartPreview({
	onReserve,
	disabled,
	onItemsLoaded,
}: Props) {
	const [items, setItems] = useState<CartItem[]>([])
	const [finalPrice, setFinalPrice] = useState<number | null>(null)

	// Получает товары из localStorage и фильтрует по выбранным ID
	useEffect(() => {
		const selected = JSON.parse(localStorage.getItem('selectedItems') || '[]')
		const saved = localStorage.getItem('finalPrice')

		if (saved) {
			try {
				const parsed = JSON.parse(saved)
				if (parsed?.total) {
					setFinalPrice(parsed.total)
				}
			} catch {}
		}

		// Получаем все товары из корзины и фильтруем по выбранным
		axios.get('/api/cart').then(res => {
			const selectedItems = res.data.filter((item: CartItem) =>
				selected.includes(item.id)
			)
			setItems(selectedItems)
			onItemsLoaded?.(selected)
		})
	}, [])

	if (!items.length) return null

	const totalQuantity = items.reduce((a, b) => a + b.quantity, 0)

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<h4 className='font-semibold text-sm'>Выбранные товары</h4>
			</div>

			<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
				{items.map((item: CartItem) => (
					<div
						key={item.id}
						className='bg-white rounded-xl shadow-sm p-3 flex flex-col items-start'
					>
						<div className='w-full h-[80px] flex items-center justify-center bg-gray-100 rounded'>
							<Image
								src={item.product.images[0] || '/placeholder.png'}
								alt={item.product.name}
								width={60}
								height={60}
								className='object-contain'
							/>
						</div>

						<div className='mt-2 text-sm font-medium text-gray-900 line-clamp-2'>
							{item.product.name}
						</div>

						{item.product.brand?.name && (
							<div className='text-xs text-gray-500 truncate'>
								{item.product.brand.name}
							</div>
						)}

						<div className='mt-1 text-sm font-bold text-gray-900'>
							{item.product.price.toLocaleString('ru-RU')} ₽
							{item.product.oldPrice &&
								item.product.oldPrice > item.product.price && (
									<span className='ml-1 text-xs text-gray-400 line-through'>
										{item.product.oldPrice.toLocaleString('ru-RU')} ₽
									</span>
								)}
						</div>
					</div>
				))}
			</div>

			<div className='mt-4 text-base font-bold flex justify-end text-[#F89514]'>
				<span className='mr-2'>Итого</span>
				<span className='mr-2'>{totalQuantity} шт</span>
				<span>
					{finalPrice !== null
						? finalPrice.toLocaleString('ru-RU', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
						  })
						: '—'}{' '}
					₽
				</span>
			</div>

			{onReserve && (
				<div className='pt-4 flex justify-center'>
					<AuthButton
						onClick={onReserve}
						disabled={disabled}
						label='Оформить заказ'
					/>
				</div>
			)}
		</div>
	)
}
