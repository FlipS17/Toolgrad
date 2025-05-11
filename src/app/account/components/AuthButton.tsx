interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	label: string
}

export default function AuthButton({ label, ...props }: Props) {
	return (
		<button
			{...props}
			className='w-full bg-[#F89514] text-white py-2 rounded-xl font-semibold transition hover:bg-opacity-90 cursor-pointer'
		>
			{label}
		</button>
	)
}
