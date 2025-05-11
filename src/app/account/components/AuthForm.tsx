'use client'

import { useNotification } from '@/app/components/NotificationProvider'
import axios from 'axios'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { useForm } from 'react-hook-form'
import AuthButton from './AuthButton'
import DateInput from './DateInput'
import EmailVerification from './EmailVerification'
import Input from './Input'

export default function AuthForm() {
	const [mode, setMode] = useState<'login' | 'register'>('login')
	const [verifying, setVerifying] = useState(false)
	const [tempData, setTempData] = useState<any>(null)
	const [birthDate, setBirthDate] = useState<Date | null>(null)

	const router = useRouter()
	const { notify } = useNotification()

	const {
		register: formRegister,
		handleSubmit,
		formState: { errors },
		setError,
		clearErrors,
		reset,
		trigger,
	} = useForm()

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const cached = localStorage.getItem('pending-registration')
			if (cached) {
				try {
					const parsed = JSON.parse(cached)
					if (parsed?.email && parsed?.userData) {
						setTempData(parsed)
						setVerifying(true)
					}
				} catch {
					localStorage.removeItem('pending-registration')
				}
			}
		}
	}, [mode])

	const onSubmit = async (data: any) => {
		clearErrors()
		const isValid = await trigger()
		if (!isValid) return

		if (mode === 'register') {
			if (data.password !== data.confirmPassword) {
				setError('confirmPassword', {
					type: 'manual',
					message: 'Пароли не совпадают',
				})
				return
			}
			if (!birthDate) {
				setError('birthDate', {
					type: 'manual',
					message: 'Укажите дату рождения',
				})
				return
			}

			const payload = {
				...data,
				birthDate: birthDate.toISOString(),
			}

			try {
				await axios.post('/api/check-registration', payload)

				await axios.post('/api/send-code', {
					email: data.email,
					data: payload,
				})

				localStorage.setItem(
					'pending-registration',
					JSON.stringify({ email: data.email, userData: payload })
				)
				setTempData({ email: data.email, userData: payload })
				setVerifying(true)
				notify('Код отправлен на email', 'success')
			} catch (err: any) {
				const msg = err.response?.data?.message
				if (msg?.toLowerCase().includes('email')) {
					setError('email', { type: 'manual', message: msg })
				} else if (msg?.toLowerCase().includes('пароль')) {
					setError('password', { type: 'manual', message: msg })
				} else {
					notify(msg || 'Ошибка регистрации', 'error')
				}
			}
		} else {
			const res = await signIn('credentials', {
				email: data.email,
				password: data.password,
				redirect: false,
			})
			if (res?.error) {
				setError('email', {
					type: 'manual',
					message: 'Неверный email или пароль',
				})
				setError('password', {
					type: 'manual',
					message: 'Неверный email или пароль',
				})
			} else {
				notify('Вход выполнен', 'success')
				router.push('/account/profile')
			}
		}
	}

	const handleVerifySuccess = async () => {
		localStorage.removeItem('pending-registration')
		setVerifying(false)
		setTempData(null)
		const res = await signIn('credentials', {
			email: tempData.email,
			password: tempData.userData.password,
			redirect: false,
		})
		if (!res?.error) router.push('/account/profile')
	}

	const handleCancelVerification = () => {
		localStorage.removeItem('pending-registration')
		setVerifying(false)
		setTempData(null)
		reset()
	}

	return (
		<div className='w-full min-h-screen flex items-center justify-center bg-gray-100'>
			<div className='w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-lg'>
				{verifying && tempData ? (
					<EmailVerification
						email={tempData.email}
						userData={tempData.userData}
						onSuccess={handleVerifySuccess}
						onCancel={handleCancelVerification}
					/>
				) : (
					<>
						<div className='flex justify-center space-x-6 mb-6'>
							{['login', 'register'].map(tab => (
								<button
									key={tab}
									onClick={() => setMode(tab as 'login' | 'register')}
									className={`pb-2 text-lg font-semibold relative transition ${
										mode === tab
											? 'text-[#F89514] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-[#F89514]'
											: 'text-gray-400 hover:text-[#F89514]'
									}`}
								>
									{tab === 'login' ? 'Вход' : 'Регистрация'}
								</button>
							))}
						</div>
						<form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
							{mode === 'register' && (
								<>
									<Input
										label='Имя'
										{...formRegister('firstName', { required: 'Введите имя' })}
										error={(errors.firstName as any)?.message}
									/>
									<Input
										label='Фамилия'
										{...formRegister('lastName', {
											required: 'Введите фамилию',
										})}
										error={(errors.lastName as any)?.message}
									/>
									<DateInput
										label='Дата рождения'
										value={birthDate}
										onChange={setBirthDate}
										error={(errors.birthDate as any)?.message}
									/>
								</>
							)}
							<Input
								label='Email'
								type='email'
								{...formRegister('email', {
									required: 'Введите email',
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: 'Неверный формат email',
									},
								})}
								error={(errors.email as any)?.message}
							/>
							<Input
								label='Пароль'
								type='password'
								{...formRegister('password', {
									required: 'Введите пароль',
									minLength: {
										value: 6,
										message: 'Пароль должен быть не менее 6 символов',
									},
									pattern: {
										value: /^[a-zA-Z0-9!@#$%^&*()_+=\-]+$/,
										message: 'Пароль содержит недопустимые символы',
									},
								})}
								error={(errors.password as any)?.message}
							/>
							{mode === 'register' && (
								<Input
									label='Повторите пароль'
									type='password'
									{...formRegister('confirmPassword', {
										required: 'Введите повтор пароля',
									})}
									error={(errors.confirmPassword as any)?.message}
								/>
							)}
							<AuthButton
								type='submit'
								label={mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
							/>
							<button
								type='button'
								onClick={() => signIn('google')}
								className='w-full text-center border border-gray-300 text-gray-700 rounded-xl py-2 mt-2 hover:text-[#F89514] hover:border-[#F89514] transition'
							>
								Войти через Google
							</button>
						</form>
					</>
				)}
			</div>
		</div>
	)
}
