'use client'

import StoreDetails from '@/app/pickup/components/StoreDetails'
import { Map, Placemark, YMaps } from '@pbe/react-yandex-maps'
import { useEffect, useState } from 'react'
import StoreList from './StoreList'

export type Store = {
	id: number
	name: string
	city: string
	address: string
	phone: string | null
	schedule: string | null
	latitude: number
	longitude: number
}

export default function PickupPage({ stores }: { stores: Store[] }) {
	const [selectedStore, setSelectedStore] = useState<Store | null>(null)
	const [mapState, setMapState] = useState({
		center: stores.length
			? [stores[0].latitude, stores[0].longitude]
			: [55.7558, 37.6173],
		zoom: 8,
	})

	const [shouldScroll, setShouldScroll] = useState(false)

	// Проверяем ширину экрана и количество магазинов — включаем скролл, если нужно
	useEffect(() => {
		const updateScroll = () => {
			const width = window.innerWidth
			setShouldScroll(width < 1024 || stores.length > 6)
		}
		updateScroll()
		window.addEventListener('resize', updateScroll)
		return () => window.removeEventListener('resize', updateScroll)
	}, [stores])

	// Если выбран магазин — центрируем карту
	useEffect(() => {
		if (selectedStore) {
			setMapState({
				center: [selectedStore.latitude, selectedStore.longitude],
				zoom: 17,
			})
		}
	}, [selectedStore])

	return (
		<div className='container mx-auto py-10 px-4 flex flex-col lg:flex-row gap-6'>
			<div className='lg:w-1/3 w-full max-w-full'>
				<StoreList
					stores={stores}
					selectedStoreId={selectedStore?.id}
					onSelect={store => setSelectedStore(store)}
					scrollable={shouldScroll}
				/>
			</div>

			<div className='lg:w-2/3 space-y-4'>
				{selectedStore && (
					<div className='space-y-1'>
						<h3 className='text-lg font-semibold text-gray-900'>
							{selectedStore.name}
						</h3>
						<p className='text-sm text-gray-600'>
							{selectedStore.city}, {selectedStore.address}
						</p>
						{selectedStore.phone && (
							<p className='text-sm text-gray-600'>
								Телефон: {selectedStore.phone}
							</p>
						)}
						{selectedStore.schedule && (
							<p className='text-sm text-gray-600'>
								Режим работы: {selectedStore.schedule}
							</p>
						)}
					</div>
				)}

				<YMaps>
					<Map
						state={mapState}
						width='100%'
						height='400px'
						options={{ suppressMapOpenBlock: true }}
					>
						{stores.map(store => (
							<Placemark
								key={store.id}
								geometry={[store.latitude, store.longitude]}
								properties={{
									iconCaption: store.name,
									balloonContent: 'ToolGrad',
								}}
								options={{
									iconLayout: 'default#image',
									iconImageHref: '/images/marker.png',
									iconImageSize: [45, 45],
								}}
								onClick={() => setSelectedStore(store)}
							/>
						))}
					</Map>
				</YMaps>

				{selectedStore && <StoreDetails store={selectedStore} />}
			</div>
		</div>
	)
}
