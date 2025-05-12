'use client'

import { useNotification } from '@/app/components/NotificationProvider'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import AuthButton from '../components/AuthButton'
import Input from '../components/Input'

export default function ResetPasswordPage() {
	const params = useSearchParams()
	const token = params.get('token')
	const router = useRouter()
	const { notify } = useNotification()

	const [step, setStep] = useState<'email' | 'password' | 'done'>(
		token ? 'password' : 'email'
	)
	const [loading, setLoading] = useState(false)
	const [email, setEmail] = useState('')
	const [timer, setTimer] = useState(0)

	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm()

	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => setTimer(t => t - 1), 1000)
			return () => clearInterval(interval)
		}
	}, [timer])

	// Отправка первого письма
	const sendEmail = async (data: any) => {
		setLoading(true)
		try {
			await axios.post('/api/request-password-reset', { email: data.email })
			setEmail(data.email)
			setStep('done')
			setTimer(30)
			notify('Письмо отправлено, проверьте почту', 'success')
		} catch (err: any) {
			const msg = err.response?.data?.message
			if (msg?.toLowerCase().includes('почта')) {
				setError('email', {
					type: 'manual',
					message: msg,
				})
			} else {
				notify('Ошибка при отправке письма', 'error')
			}
		} finally {
			setLoading(false)
		}
	}

	// Повторная отправка письма
	const resendEmail = async () => {
		if (!email || timer > 0) return
		setLoading(true)
		try {
			await axios.post('/api/request-password-reset', { email })
			setTimer(30)
			notify('Письмо отправлено повторно', 'success')
		} catch {
			notify('Ошибка при повторной отправке', 'error')
		} finally {
			setLoading(false)
		}
	}

	// Сброс пароля по токену
	const resetPassword = async (data: any) => {
		if (data.password !== data.confirmPassword) {
			setError('confirmPassword', {
				type: 'manual',
				message: 'Пароли не совпадают',
			})
			return
		}
		setLoading(true)
		try {
			await axios.post('/api/reset-password', {
				token,
				password: data.password,
			})
			notify('Пароль обновлён. Теперь вы можете войти.', 'success')
			router.push('/account')
		} catch (err: any) {
			notify(err.response?.data?.message || 'Ошибка при сбросе пароля', 'error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='w-full min-h-screen flex items-center justify-center bg-gray-100'>
			<div className='w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-lg space-y-6'>
				{step === 'email' && (
					<>
						<h2 className='text-xl font-semibold text-center'>Сброс пароля</h2>
						<form onSubmit={handleSubmit(sendEmail)} className='space-y-5'>
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
					</>
				)}

				{step === 'done' && (
					<div className='text-center space-y-2'>
						<p className='text-sm text-gray-600'>
							Письмо отправлено на <strong>{email}</strong>
						</p>
						{timer > 0 ? (
							<p className='text-sm text-gray-500'>
								Повторная отправка через {timer} сек.
							</p>
						) : (
							<button
								onClick={resendEmail}
								className='text-sm text-[#F89514] hover:underline transition'
							>
								Отправить письмо ещё раз
							</button>
						)}
					</div>
				)}

				{step === 'password' && (
					<>
						<h2 className='text-xl font-semibold text-center'>
							Введите новый пароль
						</h2>
						<form onSubmit={handleSubmit(resetPassword)} className='space-y-5'>
							<Input
								label='Новый пароль'
								type='password'
								{...register('password', {
									required: 'Введите пароль',
									minLength: {
										value: 6,
										message: 'Минимум 6 символов',
									},
								})}
								error={(errors.password as any)?.message}
							/>
							<Input
								label='Повторите пароль'
								type='password'
								{...register('confirmPassword', {
									required: 'Повторите пароль',
								})}
								error={(errors.confirmPassword as any)?.message}
							/>
							<AuthButton
								type='submit'
								label='Сбросить пароль'
								disabled={loading}
							/>
						</form>
					</>
				)}
			</div>
		</div>
	)
}
