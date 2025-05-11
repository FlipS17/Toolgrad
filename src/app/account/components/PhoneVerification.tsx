'use client'

import axios from 'axios'
import { useState } from 'react'

export default function PhoneVerification({
	userId,
	currentPhone,
}: {
	userId: string
	currentPhone?: string
}) {
	const [phone, setPhone] = useState(currentPhone || '')
	const [code, setCode] = useState('')
	const [step, setStep] = useState<'input' | 'verify'>('input')
	const [message, setMessage] = useState('')

	const sendCode = async () => {
		try {
			await axios.post('/api/verify-sms', { phone, action: 'send' })
			setStep('verify')
		} catch {
			setMessage('Ошибка при отправке СМС')
		}
	}

	const verifyCode = async () => {
		try {
			const res = await axios.post('/api/verify-sms', {
				phone,
				code,
				action: 'verify',
			})
			if (res.data.verified) {
				await axios.post('/api/update-phone', { userId, phone }) // сохранение в БД
				setMessage('Номер подтверждён')
			} else {
				setMessage('Неверный код')
			}
		} catch {
			setMessage('Ошибка проверки кода')
		}
	}

	return (
		<div className='space-y-4'>
			{step === 'input' ? (
				<>
					<input
						type='tel'
						value={phone}
						onChange={e => setPhone(e.target.value)}
						placeholder='+7'
						className='input'
					/>
					<button
						onClick={sendCode}
						className='bg-brand text-white py-2 px-4 rounded-xl'
					>
						Отправить код
					</button>
				</>
			) : (
				<>
					<input
						value={code}
						onChange={e => setCode(e.target.value)}
						placeholder='Введите код'
						className='input'
					/>
					<button
						onClick={verifyCode}
						className='bg-brand text-white py-2 px-4 rounded-xl'
					>
						Подтвердить
					</button>
				</>
			)}
			{message && <p className='text-sm text-gray-600'>{message}</p>}
		</div>
	)
}
