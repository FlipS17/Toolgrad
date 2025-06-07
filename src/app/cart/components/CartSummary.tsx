import Input from '@/app/account/components/Input'
import { CartItemType } from '@/app/cart/page'
import { calculateCartTotals } from '@/utils/calculateCartTotals'

interface Props {
	items: CartItemType[]
	deliveryPrice?: number | null
	promoCode?: string
	setPromoCode?: (code: string) => void
	promoDiscountPercent?: number
	handleApplyPromo?: () => void
}

export default function CartSummaryBlock({
	items,
	deliveryPrice = 0,
	promoCode = '',
	setPromoCode,
	promoDiscountPercent = 0,
	handleApplyPromo,
}: Props) {
	const { sumBeforeDiscount, productDiscount, totalPrice, totalWithDelivery } =
		calculateCartTotals(items, { deliveryFee: deliveryPrice ?? undefined })

	const promoDiscountValue = promoDiscountPercent
		? (sumBeforeDiscount * promoDiscountPercent) / 100
		: 0

	const finalTotal = totalWithDelivery - promoDiscountValue
	const totalDiscount = productDiscount + promoDiscountValue

	const formatCurrency = (value: number) =>
		value.toLocaleString('ru-RU', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})

	return (
		<div id='cart-summary' className='w-full shrink-0 space-y-4'>
			<div className='bg-white rounded-xl shadow-sm p-6 space-y-6'>
				{setPromoCode && (
					<div className='space-y-2'>
						<Input
							label='Промокод'
							placeholder='Введите промокод'
							value={promoCode}
							onChange={e => setPromoCode(e.target.value)}
						/>
						<button
							onClick={handleApplyPromo}
							className='text-sm text-[#F89514] font-medium hover:underline cursor-pointer'
						>
							Применить
						</button>
					</div>
				)}

				<div className='pt-2 border-t space-y-3'>
					<h4 className='text-base font-bold text-gray-900 flex justify-between'>
						<span>Ваш заказ</span>
						<span className='text-sm font-normal text-gray-500'>
							{items.reduce((a, b) => a + b.quantity, 0)} товаров
						</span>
					</h4>

					<div className='text-sm text-gray-700 space-y-2'>
						<div className='flex justify-between'>
							<span>Сумма:</span>
							<span>{formatCurrency(sumBeforeDiscount)} ₽</span>
						</div>

						{productDiscount > 0 && (
							<div className='flex justify-between text-green-600'>
								<span>Скидка:</span>
								<span>-{formatCurrency(productDiscount)} ₽</span>
							</div>
						)}

						{promoDiscountValue > 0 && (
							<div className='flex justify-between text-green-600'>
								<span>Промокод:</span>
								<span>-{formatCurrency(promoDiscountValue)} ₽</span>
							</div>
						)}

						{deliveryPrice !== null && deliveryPrice > 0 && (
							<div className='flex justify-between'>
								<span>Доставка:</span>
								<span>{formatCurrency(deliveryPrice)} ₽</span>
							</div>
						)}
					</div>

					<hr className='my-3' />

					{totalDiscount > 0 && (
						<div className='flex justify-between text-sm text-gray-900 font-medium'>
							<span>Общая скидка:</span>
							<span>-{formatCurrency(totalDiscount)} ₽</span>
						</div>
					)}

					<div className='flex justify-between text-xl font-bold text-gray-900'>
						<span>Итого:</span>
						<span>{formatCurrency(finalTotal)} ₽</span>
					</div>
				</div>
			</div>
		</div>
	)
}
