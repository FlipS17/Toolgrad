import Input from '@/app/account/components/Input'
import { CartItemType } from '@/app/cart/page'

interface Props {
	items: CartItemType[]
	deliveryPrice?: number | null
	promoCode?: string
	setPromoCode?: (code: string) => void
}

export default function CartSummaryBlock({
	items,
	deliveryPrice = 0,
	promoCode = '',
	setPromoCode,
}: Props) {
	const totalQuantity = items.reduce((a, b) => a + b.quantity, 0)
	const sumBeforeDiscount = items.reduce(
		(sum, item) => sum + item.product.price * item.quantity,
		0
	)
	const productDiscount = items.reduce((sum, item) => {
		if (item.product.oldPrice && item.product.oldPrice > item.product.price) {
			return sum + (item.product.oldPrice - item.product.price) * item.quantity
		}
		return sum
	}, 0)
	const totalPrice = sumBeforeDiscount - productDiscount
	const totalWithDelivery = totalPrice + (deliveryPrice ?? 0)

	return (
		<div className='w-full  shrink-0 space-y-4'>
			<div className='bg-white rounded-xl shadow-sm p-6 space-y-6'>
				{setPromoCode && (
					<Input
						label='Промокод'
						placeholder='Введите промокод'
						value={promoCode}
						onChange={e => setPromoCode(e.target.value)}
					/>
				)}

				<div className='pt-2 border-t space-y-3'>
					<h4 className='text-base font-bold text-gray-900 flex justify-between'>
						<span>Ваш заказ</span>
						<span className='text-sm font-normal text-gray-500'>
							{totalQuantity} товаров
						</span>
					</h4>

					<div className='text-sm text-gray-700 space-y-2'>
						<div className='flex justify-between'>
							<span>Сумма:</span>
							<span>{sumBeforeDiscount.toLocaleString('ru-RU')} ₽</span>
						</div>

						<div className='flex justify-between text-green-600'>
							<span>Скидка:</span>
							<span>-{productDiscount.toLocaleString('ru-RU')} ₽</span>
						</div>

						{deliveryPrice !== null && deliveryPrice > 0 && (
							<div className='flex justify-between'>
								<span>Доставка:</span>
								<span>{deliveryPrice.toLocaleString('ru-RU')} ₽</span>
							</div>
						)}
					</div>

					<hr className='my-3' />

					<div className='flex justify-between text-xl font-bold text-gray-900'>
						<span>Итого:</span>
						<span>{totalWithDelivery.toLocaleString('ru-RU')} ₽</span>
					</div>
				</div>
			</div>
		</div>
	)
}
