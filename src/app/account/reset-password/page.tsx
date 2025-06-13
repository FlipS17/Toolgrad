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

	const [step, setStep] = useState<'email' | 'password' | 'done'>('email')
	const [loading, setLoading] = useState(false)
	const [email, setEmail] = useState('')
	const [timer, setTimer] = useState(0)
	const [isMounted, setIsMounted] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
		reset,
	} = useForm()

	useEffect(() => {
		setIsMounted(true)

		if (token) {
			setStep('password')
			return
		}

		const savedStep = localStorage.getItem('resetPasswordStep')
		const savedEmail = localStorage.getItem('resetPasswordEmail')
		const savedTime = localStorage.getItem('resetPasswordTimer')

		if (savedStep && ['email', 'password', 'done'].includes(savedStep)) {
			setStep(savedStep as 'email' | 'password' | 'done')
		}

		if (savedEmail) {
			setEmail(savedEmail)
		}

		if (savedTime) {
			const remaining = Math.max(
				0,
				30 - Math.floor((Date.now() - Number(savedTime)) / 1000)
			)
			setTimer(remaining > 0 ? remaining : 0)
		}
	}, [token])

	useEffect(() => {
		if (isMounted && step !== 'password') {
			localStorage.setItem('resetPasswordStep', step)
			if (email) localStorage.setItem('resetPasswordEmail', email)
		}
	}, [step, email, isMounted])

	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => {
				setTimer(prev => {
					if (prev <= 1) {
						clearInterval(interval)
						return 0
					}
					return prev - 1
				})
			}, 1000)
			return () => clearInterval(interval)
		}
	}, [timer])

	const sendEmail = async (data: any) => {
		setLoading(true)
		try {
			await axios.post('/api/request-password-reset', { email: data.email })
			setEmail(data.email)
			setStep('done')
			setTimer(30)
			localStorage.setItem('resetPasswordTimer', Date.now().toString())
			notify('Письмо отправлено, проверьте почту', 'success')
		} catch (err: any) {
			const msg = err.response?.data?.message
			if (msg?.toLowerCase().includes('почта')) {
				setError('email', {
					type: 'manual',
					message: msg,
				})
			} else {
				notify(msg || 'Ошибка при отправке письма', 'error')
			}
		} finally {
			setLoading(false)
		}
	}

	const resendEmail = async () => {
		if (!email || timer > 0) return
		setLoading(true)
		try {
			await axios.post('/api/request-password-reset', { email })
			setTimer(30)
			localStorage.setItem('resetPasswordTimer', Date.now().toString())
			notify('Письмо отправлено повторно', 'success')
		} catch (err: any) {
			notify(
				err.response?.data?.message || 'Ошибка при повторной отправке',
				'error'
			)
		} finally {
			setLoading(false)
		}
	}

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
			if (isMounted) {
				localStorage.removeItem('resetPasswordStep')
				localStorage.removeItem('resetPasswordEmail')
				localStorage.removeItem('resetPasswordTimer')
			}
			notify('Пароль обновлён. Теперь вы можете войти.', 'success')
			router.push('/account')
		} catch (err: any) {
			notify(err.response?.data?.message || 'Ошибка при сбросе пароля', 'error')
		} finally {
			setLoading(false)
		}
	}

	const resetEmailForm = () => {
		setStep('email')
		reset()
	}

	return (
		<div className='w-full min-h-screen flex items-center justify-center bg-gray-100'>
			<div className='w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-lg space-y-6'>
				{step === 'email' && (
					<>
						<h2 className='text-2xl font-bold text-center'>Сброс пароля</h2>
						<form onSubmit={handleSubmit(sendEmail)} className='space-y-5'>
							<Input
								label='Email'
								type='email'
								sanitize={true}
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
					<div className='text-center'>
						<p className='text-sm text-gray-600 mb-4'>
							Письмо отправлено на <strong>{email}</strong>
						</p>

						<div className='flex flex-col items-center gap-2'>
							{timer > 0 ? (
								<p className='text-sm text-gray-500'>
									Повторная отправка через {timer} сек.
								</p>
							) : (
								<button
									onClick={resendEmail}
									disabled={loading}
									className={`text-sm text-[#F89514] hover:underline transition ${
										loading ? 'opacity-50' : ''
									}`}
								>
									Отправить письмо ещё раз
								</button>
							)}

							<button
								onClick={resetEmailForm}
								className='text-sm text-gray-500 hover:underline'
							>
								Ввести другой email
							</button>
						</div>
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
