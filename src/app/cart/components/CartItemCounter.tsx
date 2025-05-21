interface CartItemCounterProps {
	quantity: number
	onDecrement: () => void
	onIncrement: () => void
}

export default function CartItemCounter({
	quantity,
	onDecrement,
	onIncrement,
}: CartItemCounterProps) {
	return (
		<div className='flex items-center gap-2'>
			<button
				onClick={onDecrement}
				className='w-8 h-8 cursor-pointer border rounded hover:bg-gray-100 text-lg font-medium text-gray-700'
			>
				–
			</button>
			<span className='w-6 text-center'>{quantity}</span>
			<button
				onClick={onIncrement}
				className='w-8 h-8 cursor-pointer border rounded hover:bg-gray-100 text-lg font-medium text-gray-700'
			>
				+
			</button>
		</div>
	)
}
