'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'

interface Review {
	id: number
	rating: number
	comment: string
	productName: string
	createdAt: string
}

export default function ReviewsPage() {
	const [reviews, setReviews] = useState<Review[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		axios
			.get('/api/account/reviews')
			.then(res => setReviews(res.data))
			.finally(() => setLoading(false))
	}, [])

	if (loading) return <div>Загрузка...</div>

	return (
		<div className='space-y-4'>
			<h1 className='text-2xl font-semibold text-center'>Мои отзывы</h1>
			{reviews.length === 0 ? (
				<p className='text-center text-gray-600 mt-10'>
					Вы ещё не оставили отзывов.
				</p>
			) : (
				reviews.map(r => (
					<div key={r.id} className='border rounded-xl p-4 bg-white shadow'>
						<p>
							<strong>Товар:</strong> {r.productName}
						</p>
						<p>
							<strong>Оценка:</strong> {r.rating} / 5
						</p>
						<p>
							<strong>Комментарий:</strong> {r.comment}
						</p>
						<p>
							<strong>Дата:</strong>{' '}
							{new Date(r.createdAt).toLocaleDateString()}
						</p>
					</div>
				))
			)}
		</div>
	)
}
