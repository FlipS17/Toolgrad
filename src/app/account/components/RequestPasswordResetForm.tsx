'use client'

import { useNotification } from '@/app/components/NotificationProvider'
import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import AuthButton from './AuthButton'
import Input from './Input'

export default function RequestPasswordResetForm() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm()
	const { notify } = useNotification()
	const [sent, setSent] = useState(false)
	const [loading, setLoading] = useState(false)

	const onSubmit = async (data: any) => {
		setLoading(true)
		try {
			await axios.post('/api/request-password-reset', { email: data.email })
			setSent(true)
			notify('Если email существует, письмо отправлено', 'success')
		} catch (err: any) {
			notify('Ошибка при отправке письма', 'error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='space-y-6'>
			<h2 className='text-center text-lg font-semibold'>Сброс пароля</h2>
			{sent ? (
				<p className='text-sm text-center text-gray-600'>
					Если email зарегистрирован, вы получите письмо со ссылкой на сброс
					пароля.
				</p>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
					<Input
						label='Email'
						type='email'
						{...register('email', {
							required: 'Введите email',
							pattern: {
								value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
								message: 'Неверный формат email',
							},
						})}
						error={(errors.email as any)?.message}
					/>
					<AuthButton
						type='submit'
						label='Отправить письмо'
						disabled={loading}
					/>
				</form>
			)}
		</div>
	)
}
