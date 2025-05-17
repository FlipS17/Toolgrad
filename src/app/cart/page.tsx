'use client'

import CartItem from '@/app/cart/components/CartItem'
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

	useEffect(() => {
		axios
			.get('/api/cart')
			.then(res => {
				setItems(res.data)
				setSelectedItems(res.data.map((item: CartItemType) => item.id))
			})
			.catch(err => {
				console.error('Ошибка загрузки корзины', err)
			})
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
		} catch (err) {
			console.error('Ошибка удаления', err)
		}
	}

	const handleQuantityChange = async (id: number, newQuantity: number) => {
		if (newQuantity < 1) {
			handleRemove(id)
			return
		}

		try {
			await axios.patch('/api/cart', { itemId: id, quantity: newQuantity })
			setItems(prev =>
				prev.map(item =>
					item.id === id ? { ...item, quantity: newQuantity } : item
				)
			)
		} catch (err) {
			console.error('Ошибка изменения количества', err)
		}
	}

	const selected = items.filter(item => selectedItems.includes(item.id))
	const totalPrice = selected.reduce(
		(sum, i) => sum + i.product.price * i.quantity,
		0
	)
	const totalOldPrice = selected.reduce(
		(sum, i) => sum + (i.product.oldPrice || i.product.price) * i.quantity,
		0
	)
	const discount = totalOldPrice - totalPrice
	const isEmpty = items.length === 0

	if (isEmpty) {
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

			{/* остальная верстка… */}

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
						onIncrement={() => handleQuantityChange(item.id, item.quantity + 1)}
						onDecrement={() => handleQuantityChange(item.id, item.quantity - 1)}
						onRemove={handleRemove}
					/>
				))}
			</div>
		</div>
	)
}
