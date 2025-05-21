interface DeliveryTypeButtonProps {
	value: 'pickup' | 'delivery'
	active: boolean
	onClick: () => void
	label: string
	sublabel: string
}

export default function DeliveryTypeButton({
	value,
	active,
	onClick,
	label,
	sublabel,
}: DeliveryTypeButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`w-full text-sm cursor-pointer font-semibold px-6 py-4 rounded-xl border text-center ${
				active
					? 'border-[#F89514] text-[#F89514]'
					: 'border-gray-300 text-gray-600'
			}`}
		>
			{label}
			<div className='text-xs font-normal mt-1'>{sublabel}</div>
		</button>
	)
}
