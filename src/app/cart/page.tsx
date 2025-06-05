'use client'

import AuthButton from '@/app/account/components/AuthButton'
import CartItem from '@/app/cart/components/CartItem'
import { useCart } from '@/app/cart/components/CartProvider'
import CartSummaryBlock from '@/app/cart/components/CartSummary'
import { useNotification } from '@/app/components/NotificationProvider'
import { useFavorites } from '@/app/favorite/components/FavoriteProvider'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DeliveryTypeButton from './components/DeliveryTypeButton'

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
	const { notify } = useNotification()
	const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(0)
	const router = useRouter()

	useEffect(() => {
		axios
			.get('/api/cart')
			.then(res => {
				setItems(res.data)
				const ids = res.data.map((item: CartItemType) => item.id)
				setSelectedItems(ids)
				localStorage.setItem('selectedItems', JSON.stringify(ids))
			})
			.catch(err => console.error('Ошибка загрузки корзины', err))
	}, [])

	useEffect(() => {
		localStorage.setItem('selectedItems', JSON.stringify(selectedItems))
	}, [selectedItems])

	const handleApplyPromo = async () => {
		try {
			const res = await axios.post('/api/promo/apply', { code: promoCode })
			setPromoDiscountPercent(res.data.discount)
			notify('Промокод применён!', 'success')
		} catch (err: any) {
			notify(err.response?.data?.error || 'Ошибка применения', 'error')
			setPromoDiscountPercent(0)
		}
	}

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

	const handleCheckout = () => {
		const sumBeforeDiscount = selected.reduce(
			(sum, item) => sum + item.product.price * item.quantity,
			0
		)

		const productDiscount = selected.reduce((sum, item) => {
			if (item.product.oldPrice && item.product.oldPrice > item.product.price) {
				return (
					sum + (item.product.oldPrice - item.product.price) * item.quantity
				)
			}
			return sum
		}, 0)

		const promoDiscountValue = promoDiscountPercent
			? (sumBeforeDiscount * promoDiscountPercent) / 100
			: 0

		const totalDiscount = productDiscount + promoDiscountValue
		const totalPrice = sumBeforeDiscount - totalDiscount
		const deliveryPrice = deliveryType === 'delivery' ? 300 : 0
		const totalWithDelivery = totalPrice + deliveryPrice

		localStorage.setItem(
			'finalPrice',
			JSON.stringify({
				total: totalWithDelivery,
				totalDiscount,
				promoDiscount: promoDiscountValue,
				productDiscount,
				deliveryPrice,
			})
		)

		router.push(deliveryType === 'pickup' ? '/pickup' : '/delivery')
	}

	if (isEmpty) {
		return (
			<div className='container mx-auto py-12 px-4 text-center'>
				<h2 className='text-2xl font-semibold text-center mb-6'>Корзина</h2>
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
						<DeliveryTypeButton
							value='pickup'
							active={deliveryType === 'pickup'}
							onClick={() => setDeliveryType('pickup')}
							label='Самовывоз'
							sublabel='Бесплатно'
						/>
						<DeliveryTypeButton
							value='delivery'
							active={deliveryType === 'delivery'}
							onClick={() => setDeliveryType('delivery')}
							label='Курьером'
							sublabel='Стоимость рассчитывается на этапе оформления'
						/>
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
					<CartSummaryBlock
						items={selected}
						promoCode={promoCode}
						setPromoCode={setPromoCode}
						handleApplyPromo={handleApplyPromo}
						promoDiscountPercent={promoDiscountPercent}
					/>

					<AuthButton
						onClick={handleCheckout}
						disabled={isEmpty}
						label='Оформить заказ'
						className={isEmpty ? 'bg-gray-300 cursor-not-allowed' : ''}
					/>
				</div>
			</div>
		</div>
	)
}
