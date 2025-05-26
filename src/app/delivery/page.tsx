'use client'

import AuthButton from '@/app/account/components/AuthButton'
import Input from '@/app/account/components/Input'
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

interface Store {
	id: number
	name: string
	lat: number
	lon: number
}

export default function DeliveryPage() {
	const [addressQuery, setAddressQuery] = useState('')
	const [suggestions, setSuggestions] = useState<any[]>([])
	const [selectedAddress, setSelectedAddress] = useState<any | null>(null)
	const [comment, setComment] = useState('')
	const [phone, setPhone] = useState('')
	const [stores, setStores] = useState<Store[]>([])
	const [deliveryPrice, setDeliveryPrice] = useState<number | null>(null)
	const { notify } = useNotification()
	const router = useRouter()

	useEffect(() => {
		axios.get('/api/stores').then(res => {
			const formatted = res.data.map((store: any) => ({
				id: store.id,
				name: store.name,
				lat: store.latitude,
				lon: store.longitude,
			}))
			setStores(formatted)
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
		if (!selectedAddress || !stores.length) return

		const userLat = parseFloat(selectedAddress.data.geo_lat)
		const userLon = parseFloat(selectedAddress.data.geo_lon)

		let minDistance = Infinity
		let nearestStore: Store | null = null

		for (const store of stores) {
			const distance = getDistanceKm(store.lat, store.lon, userLat, userLon)
			if (distance < minDistance) {
				minDistance = distance
				nearestStore = store
			}
		}

		const BASE_PRICE = 150
		const PER_KM_PRICE = 20
		const price = Math.max(BASE_PRICE, Math.round(minDistance * PER_KM_PRICE))
		setDeliveryPrice(price)
	}, [selectedAddress, stores])

	const handleSelectSuggestion = (suggestion: any) => {
		setSelectedAddress(suggestion)
		setAddressQuery(suggestion.value)
		setSuggestions([])
	}

	const handleSubmit = async () => {
		if (!selectedAddress || !phone.trim()) {
			notify('Пожалуйста, выберите адрес и введите телефон', 'error')
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
					selectedItems: JSON.parse(
						localStorage.getItem('selectedItems') || '[]'
					),
				}),
			})

			const data = await res.json()

			if (!res.ok) {
				notify(data.error || 'Ошибка при оформлении доставки', 'error')
				return
			}

			notify('Заказ успешно оформлен', 'success')
			localStorage.removeItem('selectedItems')
			router.push('http://localhost:3000/account/orders')
		} catch (error) {
			console.error('Ошибка при отправке заказа:', error)
			notify('Не удалось отправить заказ', 'error')
		}
	}

	return (
		<div className='container mx-auto py-10 px-4'>
			<h2 className='text-2xl font-semibold text-center mb-6'>
				Оформление доставки
			</h2>

			<div className='flex flex-col lg:flex-row gap-8'>
				{/* Левая колонка */}
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
						placeholder='Например: Код от домофона, пожелания'
						value={comment}
						onChange={e => setComment(e.target.value)}
					/>

					<div className='space-y-1'>
						<label className='text-sm font-medium text-gray-700'>
							Телефон для связи
						</label>
						<Cleave
							options={{ phone: true, phoneRegionCode: 'RU' }}
							value={phone}
							onChange={e => setPhone(e.target.value)}
							placeholder='+7 (___) ___-__-__'
							className='w-full rounded-xl border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F89514] border-gray-300'
						/>
					</div>

					{deliveryPrice !== null && (
						<div className='text-sm font-medium text-gray-800'>
							Стоимость доставки:{' '}
							<span className='text-[#F89514]'>
								{deliveryPrice.toLocaleString('ru-RU')} ₽
							</span>
						</div>
					)}

					<div className='pt-4'>
						<AuthButton label='Оформить заказ' onClick={handleSubmit} />
					</div>
				</div>

				{/* Правая колонка */}
				<div className='w-full lg:w-1/3'>
					{/* Можно заменить на кастомный итог заказа */}
					<div className='bg-white p-4 rounded-xl shadow-sm'>
						<h4 className='text-base font-bold mb-2'>Ваш заказ</h4>
						<p>Итоговая стоимость + доставка появятся после выбора адреса.</p>
					</div>
				</div>
			</div>
		</div>
	)
}
