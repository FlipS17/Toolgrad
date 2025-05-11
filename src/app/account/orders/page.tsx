'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'

interface Order {
	id: number
	orderNumber: string
	status: string
	total: number
	createdAt: string
}

export default function OrdersPage() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		axios
			.get('/api/account/orders')
			.then(res => setOrders(res.data))
			.finally(() => setLoading(false))
	}, [])

	if (loading) return <div>Загрузка...</div>

	return (
		<div className='space-y-4'>
			<h1 className='text-2xl font-semibold text-center'>Мои заказы</h1>
			{orders.length === 0 ? (
				<p className='text-center text-gray-600 mt-10'>
					У вас пока нет заказов.
				</p>
			) : (
				orders.map(order => (
					<div key={order.id} className='border rounded-xl p-4 bg-white shadow'>
						<p>
							<strong>Заказ №:</strong> {order.orderNumber}
						</p>
						<p>
							<strong>Статус:</strong> {order.status}
						</p>
						<p>
							<strong>Сумма:</strong> {order.total} ₽
						</p>
						<p>
							<strong>Дата:</strong>{' '}
							{new Date(order.createdAt).toLocaleDateString()}
						</p>
					</div>
				))
			)}
		</div>
	)
}
