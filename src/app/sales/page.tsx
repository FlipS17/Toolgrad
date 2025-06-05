'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'

type Promotion = {
	id: number
	name: string
	description: string
	code: string | null
}

export default function SalesPage() {
	const [promos, setPromos] = useState<Promotion[]>([])

	useEffect(() => {
		axios.get('/api/promo/list').then(res => setPromos(res.data))
	}, [])

	const handleCopy = (code: string | null) => {
		if (code) {
			navigator.clipboard.writeText(code)
		}
	}

	return (
		<div className='container mx-auto px-4 py-12 space-y-8'>
			<h1 className='text-3xl font-bold text-center'>Актуальные акции</h1>

			<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{promos.map(promo => (
					<div
						key={promo.id}
						className='bg-white rounded-xl shadow p-6 space-y-4'
					>
						<h2 className='text-xl font-semibold text-gray-900'>
							{promo.name}
						</h2>
						<p className='text-sm text-gray-600'>{promo.description}</p>

						{promo.code && (
							<div className='bg-gray-100 rounded px-3 py-2 flex justify-between items-center'>
								<span className='font-mono text-sm'>{promo.code}</span>
								<button
									onClick={() => handleCopy(promo.code)}
									className='text-[#F89514] text-xs font-medium hover:underline'
								>
									Скопировать
								</button>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	)
}
