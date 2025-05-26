'use client'

import { useNotification } from '@/app/components/NotificationProvider'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'

interface Props {
	phone: string
	onVerified: () => void
	onCancel: () => void
}

export default function PhoneVerification({
	phone,
	onVerified,
	onCancel,
}: Props) {
	const [code, setCode] = useState(Array(4).fill(''))
	const inputsRef = useRef<HTMLInputElement[]>([])
	const [timer, setTimer] = useState(30)
	const { notify } = useNotification()

	useEffect(() => {
		const interval = setInterval(() => {
			setTimer(prev => (prev > 0 ? prev - 1 : 0))
		}, 1000)
		return () => clearInterval(interval)
	}, [])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
		const val = e.target.value.replace(/\D/g, '')
		if (!val) return

		const newCode = [...code]
		val.split('').forEach((digit, idx) => {
			const pos = i + idx
			if (pos < 4) newCode[pos] = digit
		})

		setCode(newCode)
		const next = Math.min(i + val.length, 3)
		inputsRef.current[next]?.focus()
	}

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		i: number
	) => {
		if (e.key === 'Backspace') {
			e.preventDefault()
			const newCode = [...code]
			if (newCode[i]) {
				newCode[i] = ''
			} else if (i > 0) {
				newCode[i - 1] = ''
				inputsRef.current[i - 1]?.focus()
			}
			setCode(newCode)
		}
	}

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault()
		const pasted = e.clipboardData
			.getData('Text')
			.slice(0, 4)
			.replace(/\D/g, '')
		if (pasted.length !== 4) return
		setCode(pasted.split(''))
		inputsRef.current[3]?.focus()
	}

	useEffect(() => {
		if (code.every(c => c.length === 1)) {
			verifyCode()
		}
	}, [code])

	const verifyCode = async () => {
		try {
			await axios.post('/api/sms/verify', {
				phone,
				code: code.join(''),
			})
			notify('Телефон подтверждён', 'success')
			onVerified()
		} catch (err: any) {
			notify(err.response?.data?.message || 'Неверный код', 'error')
			setCode(Array(4).fill(''))
			inputsRef.current[0]?.focus()
		}
	}

	const resendCode = async () => {
		try {
			await axios.post('/api/sms/send', { phone })
			notify('Код отправлен повторно', 'success')
			setTimer(30)
		} catch (err: any) {
			notify('Ошибка отправки кода', 'error')
		}
	}

	return (
		<div className='flex flex-col items-center space-y-4'>
			<p className='text-lg font-medium text-gray-700'>Введите код из SMS</p>
			<div className='flex gap-2'>
				{code.map((digit, i) => (
					<input
						key={i}
						ref={el => {
							if (el) inputsRef.current[i] = el
						}}
						type='text'
						inputMode='numeric'
						maxLength={1}
						value={digit}
						onChange={e => handleChange(e, i)}
						onKeyDown={e => handleKeyDown(e, i)}
						onPaste={handlePaste}
						className='w-12 h-12 text-center text-xl border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#F89514]'
					/>
				))}
			</div>
			<div className='text-sm text-gray-500'>
				{timer > 0 ? (
					<p>Повторная отправка через {timer} сек.</p>
				) : (
					<button
						onClick={resendCode}
						className='text-[#F89514] hover:underline transition'
					>
						Отправить код повторно
					</button>
				)}
			</div>
			<button
				onClick={onCancel}
				className='text-gray-500 hover:underline text-sm'
			>
				Отменить
			</button>
		</div>
	)
}
