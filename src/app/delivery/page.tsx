// Полный обновлённый DeliveryPage с SMS-подтверждением, 30 сек таймером

'use client'

import AuthButton from '@/app/account/components/AuthButton'
import Input from '@/app/account/components/Input'
import { useCart } from '@/app/cart/components/CartProvider'
import DeliverySummaryBlock from '@/app/cart/components/CartSummary'
import { useNotification } from '@/app/components/NotificationProvider'
import PhoneVerification from '@/app/delivery/components/PhoneVerification'
import { Map, Placemark, YMaps } from '@pbe/react-yandex-maps'
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
	const [entrance, setEntrance] = useState('')
	const [floor, setFloor] = useState('')
	const [deliveryPrice, setDeliveryPrice] = useState<number | null>(null)
	const [selectedItemsData, setSelectedItemsData] = useState<CartItemType[]>([])
	const [verifyingPhone, setVerifyingPhone] = useState(false)
	const [pendingOrder, setPendingOrder] = useState<any>(null)
	const [errors, setErrors] = useState<{
		address?: string
		phone?: string
		comment?: string
	}>({})
	const { notify } = useNotification()
	const [user, setUser] = useState<{
		phone?: string
		phoneVerified?: boolean
	} | null>(null)

	const { refreshCart } = useCart()
	const router = useRouter()

	const MAX_WORDS = 50
	const MAX_CHARS = 300

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
		const fetchUser = async () => {
			try {
				const res = await axios.get('/api/account/profile')
				setUser(res.data)
				if (res.data.phoneVerified && res.data.phone) {
					setPhone(res.data.phone)
				}
			} catch (err) {
				console.error('Ошибка получения данных пользователя', err)
			}
		}
		fetchUser()
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
		const distance = getDistanceKm(55.7558, 37.6173, userLat, userLon)
		setDeliveryPrice(Math.max(150, Math.round(distance * 20)))
	}, [selectedAddress])

	const handleSelectSuggestion = (suggestion: any) => {
		setSelectedAddress(suggestion)
		setAddressQuery(suggestion.value)
		setSuggestions([])
		setErrors(prev => ({ ...prev, address: undefined }))
	}

	const handleCommentChange = (value: string) => {
		const wordCount = value.trim().split(/\s+/).length
		if (wordCount > MAX_WORDS || value.length > MAX_CHARS) {
			setErrors(prev => ({
				...prev,
				comment: `Комментарий до ${MAX_WORDS} слов и ${MAX_CHARS} символов`,
			}))
			return
		}
		setErrors(prev => ({ ...prev, comment: undefined }))
		setComment(value)
	}

	const handleSubmit = async () => {
		const cleanedPhone = phone.replace(/\D/g, '')
		const newErrors: typeof errors = {}
		if (!selectedAddress) newErrors.address = 'Заполните адрес доставки'
		if (cleanedPhone.length !== 11)
			newErrors.phone = 'Введите корректный номер телефона'
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}

		const phoneCheck = await axios.post('/api/sms/send', { phone })
		if (phoneCheck.data?.alreadyVerified) {
			return await submitFinalOrder()
		} else {
			setPendingOrder({
				address: selectedAddress.data,
				coordinates: {
					lat: selectedAddress.data.geo_lat,
					lon: selectedAddress.data.geo_lon,
				},
				phone,
				comment,
				deliveryPrice,
				selectedItems: selectedItemsData.map(item => item.id),
				addressExtra: { entrance, floor },
			})
			setVerifyingPhone(true)
		}
	}

	const submitFinalOrder = async () => {
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
					addressExtra: { entrance, floor },
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

	if (verifyingPhone) {
		return (
			<div className='container mx-auto py-10 px-4'>
				<PhoneVerification
					phone={phone}
					onVerified={async () => {
						setVerifyingPhone(false)
						if (pendingOrder) {
							await submitFinalOrder()
							setPendingOrder(null)
						}
					}}
					onCancel={() => {
						setVerifyingPhone(false)
						setPendingOrder(null)
					}}
				/>
			</div>
		)
	}

	return (
		<div className='container mx-auto py-10 px-4'>
			<h2 className='text-2xl font-semibold text-center mb-6'>
				Оформление доставки
			</h2>
			<div className='flex flex-col lg:flex-row gap-8'>
				<div className='w-full lg:w-2/3 space-y-6'>
					<div className='space-y-1'>
						<label className='text-sm font-medium text-gray-700'>
							Адрес доставки (укажите также дом и квартиру)
						</label>
						<input
							value={addressQuery}
							onChange={e => {
								setAddressQuery(e.target.value)
								setSelectedAddress(null)
							}}
							placeholder='Введите адрес доставки'
							className='w-full rounded-xl border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F89514] border-gray-300'
						/>
						{errors.address && (
							<p className='text-sm text-red-500'>{errors.address}</p>
						)}
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

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<Input
							label='Подъезд'
							value={entrance}
							onChange={e => setEntrance(e.target.value)}
							placeholder='Введите номер подъезда'
						/>
						<Input
							label='Этаж'
							value={floor}
							onChange={e => setFloor(e.target.value)}
							placeholder='Введите этаж'
						/>
					</div>

					<div>
						<label className='text-sm font-medium text-gray-700 block mb-1'>
							Комментарий к заказу
						</label>
						<textarea
							value={comment}
							onChange={e => handleCommentChange(e.target.value)}
							placeholder='Например, код от домофона'
							className='w-full rounded-xl border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F89514] border-gray-300 resize-none overflow-hidden'
							rows={3}
							onInput={e => {
								const el = e.currentTarget
								el.style.height = 'auto'
								el.style.height = el.scrollHeight + 'px'
							}}
						/>
						{errors.comment && (
							<p className='text-sm text-red-500'>{errors.comment}</p>
						)}
					</div>

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
							disabled={user?.phoneVerified}
							onChange={e => {
								if (!user?.phoneVerified) {
									setPhone(e.target.value)
									setErrors(prev => ({ ...prev, phone: undefined }))
								}
							}}
							placeholder='+7 (___) ___-__-__'
							className='w-full rounded-xl border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F89514] border-gray-300 disabled:bg-gray-100 disabled:text-gray-500'
						/>
						{errors.phone && (
							<p className='text-sm text-red-500'>{errors.phone}</p>
						)}
					</div>

					{selectedAddress && (
						<YMaps>
							<Map
								state={{ center: userCoords, zoom: 17 }}
								width='100%'
								height='300px'
							>
								<Placemark geometry={userCoords} />
							</Map>
						</YMaps>
					)}
				</div>

				<div className='w-full lg:w-1/3 space-y-4'>
					<div className='bg-white p-4 rounded-xl shadow-sm space-y-4'>
						<h4 className='text-base font-bold mb-2'>Выбранные товары</h4>
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
								<div className='text-right whitespace-nowrap'>
									<div className='font-semibold'>
										{item.product.price.toLocaleString('ru-RU')} ₽
									</div>
									{item.product.oldPrice &&
										item.product.oldPrice > item.product.price && (
											<div className='text-xs text-gray-400 line-through'>
												{item.product.oldPrice.toLocaleString('ru-RU')} ₽
											</div>
										)}
								</div>
							</div>
						))}
					</div>

					{selectedAddress && (
						<div className='bg-white p-4 rounded-xl border border-gray-200 text-sm text-gray-800'>
							<h4 className='font-semibold mb-2'>Адрес доставки</h4>
							{`${selectedAddress.value}`}
							{entrance && <div>Подъезд: {entrance}</div>}
							{floor && <div>Этаж: {floor}</div>}
						</div>
					)}

					<DeliverySummaryBlock
						items={selectedItemsData}
						deliveryPrice={deliveryPrice}
					/>

					<AuthButton label='Оформить заказ' onClick={handleSubmit} />
				</div>
			</div>
		</div>
	)
}
