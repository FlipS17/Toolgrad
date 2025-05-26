'use client'

import AuthButton from '@/app/account/components/AuthButton'
import Input from '@/app/account/components/Input'
import { useCart } from '@/app/cart/components/CartProvider'
import { useNotification } from '@/app/components/NotificationProvider'
import axios from 'axios'
import 'cleave.js/dist/addons/cleave-phone.ru'
import Cleave from 'cleave.js/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const DADATA_TOKEN = process.env.NEXT_PUBLIC_DADATA_TOKEN as string

function getDistanceKm(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number {
	const R = 6371
	const dLat = ((lat2 - lat1) * Math.PI) / 180
	const dLon = ((lon2 - lon1) * Math.PI) / 180
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2)
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return R * c
}

interface CartItemType {
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

export default function DeliveryPage() {
	const [addressQuery, setAddressQuery] = useState('')
	const [suggestions, setSuggestions] = useState<any[]>([])
	const [selectedAddress, setSelectedAddress] = useState<any | null>(null)
	const [comment, setComment] = useState('')
	const [phone, setPhone] = useState('')
	const [deliveryPrice, setDeliveryPrice] = useState<number | null>(null)
	const [selectedItemsData, setSelectedItemsData] = useState<CartItemType[]>([])
	const { notify } = useNotification()
	const { refreshCart } = useCart()
	const router = useRouter()

	useEffect(() => {
		const selected = JSON.parse(localStorage.getItem('selectedItems') || '[]')
		axios.get('/api/cart').then(res => {
			const filtered = res.data.filter((item: CartItemType) =>
				selected.includes(item.id)
			)
			setSelectedItemsData(filtered)
		})
	}, [])

	useEffect(() => {
		const fetchSuggestions = async () => {
			if (!addressQuery || selectedAddress) return

			const res = await fetch(
				'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
						Authorization: `Token ${DADATA_TOKEN}`,
					},
					body: JSON.stringify({
						query: addressQuery,
						locations: [{ country_iso_code: 'RU' }],
					}),
				}
			)

			const data = await res.json()
			setSuggestions(data.suggestions || [])
		}

		const timeout = setTimeout(fetchSuggestions, 400)
		return () => clearTimeout(timeout)
	}, [addressQuery, selectedAddress])

	useEffect(() => {
		if (!selectedAddress) return

		const userLat = parseFloat(selectedAddress.data.geo_lat)
		const userLon = parseFloat(selectedAddress.data.geo_lon)

		const STORE_LAT = 55.7558
		const STORE_LON = 37.6173

		const BASE_PRICE = 150
		const PER_KM_PRICE = 20

		const distance = getDistanceKm(STORE_LAT, STORE_LON, userLat, userLon)
		const price = Math.max(BASE_PRICE, Math.round(distance * PER_KM_PRICE))
		setDeliveryPrice(price)
	}, [selectedAddress])

	const handleSelectSuggestion = (suggestion: any) => {
		setSelectedAddress(suggestion)
		setAddressQuery(suggestion.value)
		setSuggestions([])
	}

	const handleSubmit = async () => {
		const cleanedPhone = phone.replace(/\D/g, '')
		if (!selectedAddress || cleanedPhone.length !== 11) {
			notify('Введите корректный номер телефона и выберите адрес', 'error')
			return
		}

		try {
			const res = await fetch('/api/delivery', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					address: selectedAddress.data,
					coordinates: {
						lat: selectedAddress.data.geo_lat,
						lon: selectedAddress.data.geo_lon,
					},
					phone,
					comment,
					deliveryPrice,
					selectedItems: selectedItemsData.map(item => item.id),
				}),
			})

			const data = await res.json()

			if (!res.ok) {
				notify(data.error || 'Ошибка при оформлении доставки', 'error')
				return
			}

			notify('Заказ успешно оформлен', 'success')
			localStorage.removeItem('selectedItems')
			await refreshCart()
			router.push('http://localhost:3000/account/orders')
		} catch (error) {
			console.error('Ошибка при отправке заказа:', error)
			notify('Не удалось отправить заказ', 'error')
		}
	}

	const userCoords = selectedAddress
		? [
				parseFloat(selectedAddress.data.geo_lat),
				parseFloat(selectedAddress.data.geo_lon),
		  ]
		: [55.751244, 37.618423]

	const totalItemsSum = selectedItemsData.reduce(
		(sum, item) => sum + item.quantity * item.product.price,
		0
	)
	const totalWithDelivery =
		deliveryPrice !== null ? totalItemsSum + deliveryPrice : totalItemsSum

	return (
		<div className='container mx-auto py-10 px-4'>
			<h2 className='text-2xl font-semibold text-center mb-6'>
				Оформление доставки
			</h2>

			<div className='flex flex-col lg:flex-row gap-8'>
				<div className='w-full lg:w-2/3 space-y-4'>
					<div className='space-y-1'>
						<label className='text-sm font-medium text-gray-700'>
							Адрес доставки
						</label>
						<input
							value={addressQuery}
							onChange={e => {
								setAddressQuery(e.target.value)
								setSelectedAddress(null)
							}}
							placeholder='Введите адрес'
							className='w-full rounded-xl border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F89514] border-gray-300'
						/>
						{suggestions.length > 0 && (
							<ul className='bg-white border border-gray-200 rounded-xl shadow-sm mt-1 max-h-60 overflow-y-auto'>
								{suggestions.map((s, i) => (
									<li
										key={i}
										onClick={() => handleSelectSuggestion(s)}
										className='px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm'
									>
										{s.value}
									</li>
								))}
							</ul>
						)}
					</div>

					<Input
						label='Комментарий к заказу'
						placeholder='Например: домофон не работает'
						value={comment}
						onChange={e => setComment(e.target.value)}
					/>

					<div className='space-y-1'>
						<label className='text-sm font-medium text-gray-700'>
							Телефон для связи
						</label>
						<Cleave
							options={{
								prefix: '+7',
								delimiters: ['(', ')', '-', '-'],
								blocks: [2, 3, 3, 2, 2],
								numericOnly: true,
							}}
							value={phone}
							onChange={e => setPhone(e.target.value)}
							placeholder='+7 (___) ___-__-__'
							className='w-full rounded-xl border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F89514] border-gray-300'
						/>
					</div>

					<div className='pt-4'>
						<AuthButton label='Оформить заказ' onClick={handleSubmit} />
					</div>
				</div>

				<div className='w-full lg:w-1/3'>
					<div className='bg-white p-4 rounded-xl shadow-sm space-y-4'>
						<h4 className='text-base font-bold mb-2'>Ваш заказ</h4>
						{selectedItemsData.map(item => (
							<div key={item.id} className='flex gap-3 items-center text-sm'>
								<img
									src={item.product.images[0] || '/placeholder.png'}
									alt={item.product.name}
									className='w-12 h-12 object-contain rounded border'
								/>
								<div className='flex-1'>
									<div className='font-medium'>{item.product.name}</div>
									<div className='text-gray-500 text-xs'>× {item.quantity}</div>
								</div>
								<div className='font-semibold whitespace-nowrap'>
									{(item.product.price * item.quantity).toLocaleString('ru-RU')}{' '}
									₽
								</div>
							</div>
						))}
						{deliveryPrice !== null && (
							<p className='text-sm text-gray-800 font-medium'>
								Доставка:{' '}
								<span className='text-[#F89514]'>
									{deliveryPrice.toLocaleString('ru-RU')} ₽
								</span>
							</p>
						)}
						<div className='text-lg font-bold pt-2 border-t'>
							<span>Итого: {totalWithDelivery.toLocaleString('ru-RU')} ₽</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
