// Тип одного товара в заказе
export interface OrderProduct {
	id: number
	name: string
	quantity: number
	price: number
	image: string
	productId: number
}

// Тип адреса
export interface Address {
	city: string
	street: string
	settlement?: string
	building: string
	apartment: string
	entrance?: string
	floor?: string
}

// Тип магазина (если самовывоз)
export interface Store {
	city: string
	address: string
}

// Тип самого заказа
export interface Order {
	id: number
	orderNumber: string
	status: string
	statusChangedAt?: string | Date | null
	total: number
	createdAt: string
	deliveryType: 'PICKUP' | 'DELIVERY'
	address?: Address
	store?: Store
	items: OrderProduct[]
}
