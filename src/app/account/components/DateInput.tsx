'use client'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface DateInputProps {
	label: string
	value: Date | null
	onChange: (date: Date | null) => void
	error?: string
}

export default function DateInput({
	label,
	value,
	onChange,
	error,
}: DateInputProps) {
	return (
		<div className='space-y-1 w-full'>
			<label className='text-sm font-medium text-gray-700'>{label}</label>
			<div>
				<DatePicker
					selected={value}
					onChange={onChange}
					dateFormat='dd.MM.yyyy'
					placeholderText='ДД.ММ.ГГГГ'
					showMonthDropdown
					showYearDropdown
					dropdownMode='select'
					onKeyDown={e => e.preventDefault()}
					className={`w-full rounded-xl border px-4 py-2 bg-white focus:outline-none focus:ring-2 transition ${
						error
							? 'border-red-500 focus:ring-red-400'
							: 'border-gray-300 focus:ring-[#F89514]'
					}`}
					maxDate={new Date()}
					showPopperArrow={false}
				/>
			</div>
			{error && <p className='text-sm text-red-500'>{error}</p>}
		</div>
	)
}
