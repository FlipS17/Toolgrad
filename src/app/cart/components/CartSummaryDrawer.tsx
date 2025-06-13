'use client'

import { CartItemType } from '@/app/cart/page'
import { X } from 'lucide-react'
import { useState } from 'react'
import CartSummaryBlock from './CartSummary'

interface Props {
	items: CartItemType[]
	deliveryPrice?: number | null
	promoCode?: string
	setPromoCode?: (code: string) => void
	promoDiscountPercent?: number
	handleApplyPromo?: () => void
}

export default function CartSummaryDrawer({
	items,
	deliveryPrice,
	promoCode,
	setPromoCode,
	promoDiscountPercent,
	handleApplyPromo,
}: Props) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<>
			{/* Desktop summary — видим только на md+ */}
			<div className='hidden md:block w-full md:w-[380px] shrink-0 space-y-4'>
				<CartSummaryBlock
					items={items}
					deliveryPrice={deliveryPrice}
					promoCode={promoCode}
					setPromoCode={setPromoCode}
					promoDiscountPercent={promoDiscountPercent}
					handleApplyPromo={handleApplyPromo}
				/>
			</div>

			{/* Mobile trigger — кнопка оформить */}
			<div className='block md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 p-4'>
				<button
					onClick={() => setIsOpen(true)}
					className='w-full text-center bg-[#F89514] text-white py-3 text-base rounded-xl font-semibold hover:bg-[#d97c0f] transition'
				>
					Оформить заказ
				</button>
			</div>

			{/* Модалка на весь экран */}
			{isOpen && (
				<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end md:items-center'>
					<div className='w-full h-[90vh] md:h-auto bg-white rounded-t-2xl md:rounded-xl p-4 overflow-auto relative max-w-md'>
						{/* Кнопка закрытия */}
						<button
							onClick={() => setIsOpen(false)}
							className='absolute top-4 right-4 text-gray-500 hover:text-black'
						>
							<X className='w-5 h-5' />
						</button>

						<CartSummaryBlock
							items={items}
							deliveryPrice={deliveryPrice}
							promoCode={promoCode}
							setPromoCode={setPromoCode}
							promoDiscountPercent={promoDiscountPercent}
							handleApplyPromo={handleApplyPromo}
						/>

						{/* Кнопка оформления заказа */}
						<button
							onClick={() => {
								setIsOpen(false)
							}}
							className='mt-4 w-full text-center bg-[#F89514] text-white py-3 text-base rounded-xl font-semibold hover:bg-[#d97c0f] transition'
						>
							Оформить заказ
						</button>
					</div>
				</div>
			)}
		</>
	)
}
