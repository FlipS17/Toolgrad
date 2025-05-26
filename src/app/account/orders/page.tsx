'use client'

import OrderCard from '@/app/account/orders/components/OrderCard'
import axios from 'axios'
import { useEffect, useState } from 'react'

interface OrderProduct {
	id: number
	name: string
	quantity: number
	price: number
	image: string
	productId: number
}

interface Order {
	id: number
	orderNumber: string
	status: string
	total: number
	createdAt: string
	address?: string
	deliveryType: 'PICKUP' | 'DELIVERY'
	items: OrderProduct[]
}

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [openOrderId, setOpenOrderId] = useState<number | null>(null)

	useEffect(() => {
		axios
			.get('/api/account/orders')
			.then(res => setOrders(res.data))
			.finally(() => setLoading(false))
	}, [])

	if (loading) return <div>Загрузка...</div>

	return (
		<div className='space-y-6'>
			<h1 className='text-2xl font-bold text-center'>Заказы</h1>

			{orders.length === 0 ? (
				<p className='text-center text-gray-600 mt-10'>
					У вас пока нет заказов.
				</p>
			) : (
				orders.map(order => (
					<OrderCard
						key={order.id}
						number={order.orderNumber}
						date={new Date(order.createdAt).toLocaleDateString('ru-RU', {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric',
						})}
						status={order.status}
						total={order.total}
						deliveryType={order.deliveryType}
						address={order.address}
						products={order.items}
						isOpen={openOrderId === order.id}
						onToggle={() =>
							setOpenOrderId(prev => (prev === order.id ? null : order.id))
						}
					/>
				))
			)}
		</div>
	)
}
