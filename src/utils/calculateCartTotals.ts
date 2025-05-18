import { CartItemType } from '@/app/cart/page'

export const DELIVERY_FEE = 259

type Totals = {
	sumBeforeDiscount: number
	productDiscount: number
	totalPrice: number
	totalWithDelivery: number
}

export function calculateCartTotals(
	items: CartItemType[],
	deliveryType: 'pickup' | 'delivery'
): Totals {
	const sumBeforeDiscount = items.reduce((sum, item) => {
		const hasValidOldPrice =
			typeof item.product.oldPrice === 'number' &&
			item.product.oldPrice > item.product.price

		const priceToUse = hasValidOldPrice
			? item.product.oldPrice!
			: item.product.price

		return sum + priceToUse * item.quantity
	}, 0)

	const productDiscount = items.reduce((sum, item) => {
		const hasValidOldPrice =
			typeof item.product.oldPrice === 'number' &&
			item.product.oldPrice > item.product.price

		if (!hasValidOldPrice) return sum

		const discountPerItem = item.product.oldPrice! - item.product.price
		return sum + discountPerItem * item.quantity
	}, 0)

	const totalPrice = sumBeforeDiscount - productDiscount
	const deliveryFee = deliveryType === 'delivery' ? DELIVERY_FEE : 0
	const totalWithDelivery = totalPrice + deliveryFee

	return {
		sumBeforeDiscount,
		productDiscount,
		totalPrice,
		totalWithDelivery,
	}
}
