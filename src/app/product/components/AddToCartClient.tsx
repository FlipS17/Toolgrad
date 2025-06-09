'use client'

import { useCart } from '@/app/cart/components/CartProvider'

interface Props {
	productId: number
}

export default function AddToCartClient({ productId }: Props) {
	const { addToCart, isInCart } = useCart()

	const inCart = isInCart(productId)

	return (
		<button
			onClick={() => addToCart(productId)}
			disabled={inCart}
			className={`w-full mt-1 text-white text-sm font-medium py-2 rounded-xl transition ${
				inCart
					? 'bg-gray-300 cursor-not-allowed'
					: 'bg-[#F89514] hover:bg-[#d97c0f] cursor-pointer'
			}`}
		>
			{inCart ? 'В корзине' : 'В корзину'}
		</button>
	)
}
