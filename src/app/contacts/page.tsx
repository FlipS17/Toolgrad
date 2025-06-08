'use client'

import AuthButton from '@/app/account/components/AuthButton'
import Input from '@/app/account/components/Input'
import { useNotification } from '@/app/components/NotificationProvider'
import axios from 'axios'
import DOMPurify from 'dompurify'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function ContactsPage() {
	const { data: session, status } = useSession()
	const { notify } = useNotification()

	const [form, setForm] = useState({
		name: '',
		email: '',
		message: '',
	})

	const [errors, setErrors] = useState<{ [key: string]: string }>({})
	const [loading, setLoading] = useState(false)
	const [submitted, setSubmitted] = useState(false)

	useEffect(() => {
		if (status === 'authenticated' && session?.user?.email) {
			setForm(prev => ({ ...prev, email: session.user.email }))
		}
	}, [session, status])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		const cleanValue = DOMPurify.sanitize(value, {
			ALLOWED_TAGS: [],
			ALLOWED_ATTR: [],
		})
		setForm(prev => ({ ...prev, [name]: cleanValue }))
		setErrors(prev => ({ ...prev, [name]: '' }))
	}

	const validate = () => {
		const newErrors: typeof errors = {}

		if (!form.name.trim()) newErrors.name = 'Введите имя'
		if (!form.email.trim()) newErrors.email = 'Введите email'
		else if (!/\S+@\S+\.\S+/.test(form.email))
			newErrors.email = 'Некорректный email'
		if (!form.message.trim() || form.message.length < 10)
			newErrors.message = 'Сообщение должно быть не менее 10 символов'
		if (form.message.length > 300)
			newErrors.message = 'Сообщение слишком длинное (до 300 символов)'

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validate()) return

		setLoading(true)
		try {
			await axios.post('/api/contact', form)
			notify('Сообщение успешно отправлено', 'success')
			setSubmitted(true)
			setForm({
				name: '',
				email: session?.user?.email || '',
				message: '',
			})
		} catch (error) {
			console.error(error)
			notify('Ошибка при отправке. Попробуйте позже.', 'error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='px-4 py-16 space-y-24'>
			{/* Секция "О компании" */}
			<section className='container mx-auto px-4 text-center'>
				<h1 className='text-2xl font-bold tracking-tight'>О компании</h1>
			</section>

			{/* Контент пропущен ради краткости — не изменяется */}

			{/* Форма обратной связи */}
			<section className='bg-gray-50 py-12 px-4 rounded-xl max-w-2xl mx-auto shadow'>
				<h2 className='text-2xl font-bold mb-6 text-center'>
					Форма обратной связи
				</h2>
				{submitted ? (
					<p className='text-green-600 text-center text-lg'>
						Спасибо! Мы скоро свяжемся с вами.
					</p>
				) : (
					<form onSubmit={handleSubmit} className='space-y-4'>
						<Input
							label='Ваше имя'
							placeholder='Введите имя'
							name='name'
							value={form.name}
							onChange={handleChange}
							error={errors.name}
						/>

						<input
							type='email'
							name='email'
							value={form.email}
							onChange={handleChange}
							disabled={status === 'authenticated' && !!session?.user?.email}
							placeholder='Введите email'
							className='w-full rounded-xl border px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#F89514] border-gray-300 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed'
						/>

						<div className='space-y-1'>
							<label className='text-sm font-medium text-gray-700'>
								Сообщение
							</label>
							<textarea
								name='message'
								value={form.message}
								onChange={handleChange}
								rows={3}
								maxLength={300}
								placeholder='Введите сообщение (до 500 символов)'
								className={`w-full rounded-xl border px-4 py-2 bg-white focus:outline-none focus:ring-2 transition resize-none overflow-hidden ${
									errors.message
										? 'border-red-500 focus:ring-red-400'
										: 'focus:ring-[#F89514] border-gray-300'
								}`}
								onInput={e => {
									const el = e.currentTarget
									el.style.height = 'auto'
									el.style.height = el.scrollHeight + 'px'
								}}
							/>
							{errors.message && (
								<p className='text-sm text-red-500'>{errors.message}</p>
							)}
						</div>

						<AuthButton
							type='submit'
							label={loading ? 'Отправка...' : 'Отправить сообщение'}
							disabled={loading}
						/>
					</form>
				)}
			</section>
		</div>
	)
}
