'use client'

import AuthButton from '@/app/account/components/AuthButton'
import { useCart } from '@/app/cart/components/CartProvider'
import DeliverySummaryBlock from '@/app/cart/components/CartSummary'
import { useNotification } from '@/app/components/NotificationProvider'
import { Map, Placemark, YMaps } from '@pbe/react-yandex-maps'
import axios from 'axios'
import DOMPurify from 'dompurify'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Input from '../account/components/Input'

// Токен дадаты
const DADATA_TOKEN = process.env.NEXT_PUBLIC_DADATA_TOKEN as string

// Высчитывание дистанции от склада до пользователя
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
	const [promoDiscountPercent, setPromoDiscountPercent] = useState(0)
	const [addressQuery, setAddressQuery] = useState('')
	const [suggestions, setSuggestions] = useState<any[]>([])
	const [selectedAddress, setSelectedAddress] = useState<any | null>(null)
	const [comment, setComment] = useState('')
	const [entrance, setEntrance] = useState('')
	const [floor, setFloor] = useState('')
	const [deliveryPrice, setDeliveryPrice] = useState<number | null>(null)
	const [selectedItemsData, setSelectedItemsData] = useState<CartItemType[]>([])
	const [userEmail, setUserEmail] = useState<string | null>(null)
	const [errors, setErrors] = useState<{ address?: string; comment?: string }>(
		{}
	)
	const { notify } = useNotification()
	const { refreshCart } = useCart()
	const router = useRouter()

	const MAX_WORDS = 50
	const MAX_CHARS = 300

	// Получение выбранных товаров из корзины и итоговая сумма
	useEffect(() => {
		const selected = JSON.parse(localStorage.getItem('selectedItems') || '[]')
		const promoData = JSON.parse(localStorage.getItem('finalPrice') || '{}')
		if (promoData?.promoDiscount && promoData?.sumBeforeDiscount) {
			const percent = Math.round(
				(promoData.promoDiscount / promoData.sumBeforeDiscount) * 100
			)
			setPromoDiscountPercent(percent)
		}
		axios.get('/api/cart').then(res => {
			const filtered = res.data.filter((item: CartItemType) =>
				selected.includes(item.id)
			)
			setSelectedItemsData(filtered)
		})
	}, [])

	// Почта пользователя
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const res = await axios.get('/api/account/profile')
				setUserEmail(res.data.email)
			} catch (err) {
				console.error('Ошибка получения профиля пользователя', err)
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

	// xss защита и ограничение по символам и словам
	const handleCommentChange = (value: string) => {
		const clean = DOMPurify.sanitize(value, {
			ALLOWED_TAGS: [],
			ALLOWED_ATTR: [],
		})
		const wordCount = clean.trim().split(/\s+/).length
		if (wordCount > MAX_WORDS || clean.length > MAX_CHARS) {
			setErrors(prev => ({
				...prev,
				comment: `Комментарий до ${MAX_WORDS} слов и ${MAX_CHARS} символов`,
			}))
			return
		}
		setErrors(prev => ({ ...prev, comment: undefined }))
		setComment(clean)
	}

	// Валидация адреса
	const handleSubmit = async () => {
		const newErrors: typeof errors = {}
		if (!selectedAddress) {
			newErrors.address = 'Заполните адрес доставки'
		} else {
			const data = selectedAddress.data
			if (!data.house) {
				newErrors.address = 'Укажите номер дома в адресе'
			}
		}
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}
		await submitFinalOrder()
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
					comment,
					deliveryPrice,
					selectedItems: selectedItemsData.map(item => item.id),
					addressExtra: {
						entrance: DOMPurify.sanitize(entrance, {
							ALLOWED_TAGS: [],
							ALLOWED_ATTR: [],
						}),
						floor: DOMPurify.sanitize(floor, {
							ALLOWED_TAGS: [],
							ALLOWED_ATTR: [],
						}),
					},
				}),
			})
			const data = await res.json()
			if (!res.ok) {
				notify(data.error || 'Ошибка при оформлении доставки', 'error')
				return
			}
			if (userEmail) {
				await fetch('/api/send-confirmation-email', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: userEmail,
						address: selectedAddress.value,
						entrance: DOMPurify.sanitize(entrance, {
							ALLOWED_TAGS: [],
							ALLOWED_ATTR: [],
						}),
						floor: DOMPurify.sanitize(floor, {
							ALLOWED_TAGS: [],
							ALLOWED_ATTR: [],
						}),
						comment,
					}),
				})
			}
			notify('Заказ успешно оформлен', 'success')
			localStorage.removeItem('selectedItems')
			await refreshCart()
			router.push('http://localhost:3000/account/delivery')
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

	return (
		<div className='container mx-auto py-10 px-4'>
			<h2 className='text-2xl font-bold text-center mb-6'>
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
						promoDiscountPercent={promoDiscountPercent}
					/>

					<AuthButton label='Оформить заказ' onClick={handleSubmit} />
				</div>
			</div>
		</div>
	)
}
