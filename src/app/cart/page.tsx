'use client'

import Input from '@/app/account/components/Input'
import CartItem from '@/app/cart/components/CartItem'
import { useCart } from '@/app/cart/components/CartProvider'
import { useFavorites } from '@/app/favorite/components/FavoriteProvider'
import { calculateCartTotals, DELIVERY_FEE } from '@/utils/calculateCartTotals'
import axios from 'axios'
import Link from 'next/link'

import { useEffect, useState } from 'react'

export type CartItemType = {
	id: number
	quantity: number
	product: {
		id: number
		name: string
		brand?: { name: string }
		price: number
		oldPrice?: number
		images: string[]
	}
}

export default function CartPage() {
	const [items, setItems] = useState<CartItemType[]>([])
	const [selectedItems, setSelectedItems] = useState<number[]>([])
	const [promoCode, setPromoCode] = useState('')
	const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>(
		'pickup'
	)

	const { refreshCart } = useCart()

	useEffect(() => {
		axios
			.get('/api/cart')
			.then(res => {
				setItems(res.data)
				setSelectedItems(res.data.map((item: CartItemType) => item.id))
			})
			.catch(err => console.error('Ошибка загрузки корзины', err))
	}, [])

	const handleSelect = (id: number, checked: boolean) => {
		setSelectedItems(prev =>
			checked ? [...prev, id] : prev.filter(i => i !== id)
		)
	}

	const handleRemove = async (id: number) => {
		try {
			await axios.delete('/api/cart', { data: { itemId: id } })
			setItems(prev => prev.filter(item => item.id !== id))
			setSelectedItems(prev => prev.filter(i => i !== id))
			await refreshCart()
		} catch (err) {
			console.error('Ошибка удаления', err)
		}
	}

	const handleQuantityChange = async (id: number, newQuantity: number) => {
		if (newQuantity < 1) return handleRemove(id)
		try {
			await axios.patch('/api/cart', { itemId: id, quantity: newQuantity })
			setItems(prev =>
				prev.map(item =>
					item.id === id ? { ...item, quantity: newQuantity } : item
				)
			)
			await refreshCart()
		} catch (err) {
			console.error('Ошибка изменения количества', err)
		}
	}

	const { favoriteIds, toggleFavorite } = useFavorites()

	const handleToggleFavorite = async (productId: number) => {
		try {
			await toggleFavorite(productId)
		} catch (err) {
			console.error('Ошибка избранного', err)
		}
	}

	const selected = items.filter(item => selectedItems.includes(item.id))
	const isEmpty = selected.length === 0

	const { sumBeforeDiscount, productDiscount, totalWithDelivery } =
		calculateCartTotals(selected, deliveryType)

	if (items.length === 0) {
		return (
			<div className='container mx-auto py-12 px-4 text-center'>
				<h2 className='text-2xl font-semibold mb-4'>Корзина</h2>
				<p className='text-gray-500 mb-6'>В вашей корзине пока нет товаров</p>
				<Link
					href='/catalog'
					className='inline-block bg-[#F89514] text-white px-6 py-2 rounded-xl hover:bg-[#d97c0f] transition'
				>
					К покупкам
				</Link>
			</div>
		)
	}

	return (
		<div className='container mx-auto py-12 px-4'>
			<h2 className='text-2xl font-semibold text-center mb-6'>Корзина</h2>

			<div className='flex flex-col md:flex-row gap-8'>
				<div className='flex-1'>
					<div className='bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-4'>
						<button
							onClick={() => setDeliveryType('pickup')}
							className={`w-full text-sm font-semibold px-6 py-4 rounded-xl border text-center ${
								deliveryType === 'pickup'
									? 'border-[#F89514] text-[#F89514]'
									: 'border-gray-300 text-gray-600'
							}`}
						>
							Самовывоз
							<div className='text-xs font-normal mt-1'>Бесплатно</div>
						</button>
						<button
							onClick={() => setDeliveryType('delivery')}
							className={`w-full text-sm font-semibold px-6 py-4 rounded-xl border text-center ${
								deliveryType === 'delivery'
									? 'border-[#F89514] text-[#F89514]'
									: 'border-gray-300 text-gray-600'
							}`}
						>
							Курьером{' '}
							<div className='text-xs font-normal mt-1'>+{DELIVERY_FEE}₽</div>
						</button>
					</div>

					<div className='flex items-center gap-3 mb-6 px-1'>
						<input
							type='checkbox'
							checked={selectedItems.length === items.length}
							onChange={e =>
								setSelectedItems(e.target.checked ? items.map(i => i.id) : [])
							}
							className='accent-[#F89514] w-5 h-5 rounded border border-gray-300'
						/>
						<span className='text-sm text-gray-700'>Выбрать все</span>
						<button
							onClick={() => selectedItems.forEach(id => handleRemove(id))}
							disabled={selectedItems.length === 0}
							className={`ml-4 flex items-center gap-1 text-sm font-medium ${
								selectedItems.length === 0
									? 'text-gray-300'
									: 'text-red-600 hover:text-red-700'
							}`}
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='w-4 h-4'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14'
								/>
							</svg>
							Удалить
						</button>
					</div>

					<div className='space-y-4'>
						{items.map(item => (
							<CartItem
								key={item.id}
								id={item.id}
								name={item.product.name}
								brand={item.product.brand?.name}
								price={item.product.price}
								oldPrice={item.product.oldPrice}
								image={item.product.images[0] || '/placeholder.png'}
								quantity={item.quantity}
								onIncrement={() =>
									handleQuantityChange(item.id, item.quantity + 1)
								}
								onDecrement={() =>
									handleQuantityChange(item.id, item.quantity - 1)
								}
								onRemove={() => handleRemove(item.id)}
								checked={selectedItems.includes(item.id)}
								onCheck={(id, checked) => handleSelect(id, checked)}
								isFavorite={favoriteIds.includes(item.product.id)}
								onToggleFavorite={() => handleToggleFavorite(item.product.id)}
							/>
						))}
					</div>
				</div>

				<div className='w-full md:w-[380px] shrink-0 space-y-4'>
					<div className='bg-white rounded-xl shadow-sm p-6 space-y-6'>
						<Input
							label='Промокод'
							placeholder='Введите промокод'
							value={promoCode}
							onChange={e => setPromoCode(e.target.value)}
						/>

						<div className='pt-2 border-t space-y-3'>
							<h4 className='text-base font-bold text-gray-900 flex justify-between'>
								<span>Ваш заказ</span>
								<span className='text-sm font-normal text-gray-500'>
									{selected.reduce((a, b) => a + b.quantity, 0)} товаров
								</span>
							</h4>

							<div className='text-sm text-gray-700 space-y-2'>
								<div className='flex justify-between'>
									<span>Сумма:</span>
									<span>{sumBeforeDiscount.toLocaleString('ru-RU')} ₽</span>
								</div>

								<div className='flex justify-between text-green-600'>
									<span>Скидка:</span>
									<span>-{productDiscount.toLocaleString('ru-RU')} ₽</span>
								</div>

								{deliveryType === 'delivery' && (
									<div className='flex justify-between'>
										<span>Доставка:</span>
										<span>{DELIVERY_FEE.toLocaleString('ru-RU')} ₽</span>
									</div>
								)}
							</div>

							<hr className='my-3' />

							<div className='flex justify-between text-xl font-bold text-gray-900'>
								<span>Итого:</span>
								<span>{totalWithDelivery.toLocaleString('ru-RU')} ₽</span>
							</div>
						</div>
					</div>

					<button
						className={`w-full text-white py-3 text-base rounded-xl font-semibold ${
							isEmpty
								? 'bg-gray-300 cursor-not-allowed'
								: 'bg-[#F89514] hover:bg-[#d97c0f]'
						}`}
						disabled={isEmpty}
					>
						Оформить заказ
					</button>
				</div>
			</div>
		</div>
	)
}
