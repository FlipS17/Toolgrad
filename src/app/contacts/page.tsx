'use client'

import AuthButton from '@/app/account/components/AuthButton'
import Input from '@/app/account/components/Input'
import { useNotification } from '@/app/components/NotificationProvider'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
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

	// Подставляем email после загрузки сессии
	useEffect(() => {
		if (status === 'authenticated' && session?.user?.email) {
			setForm(prev => ({ ...prev, email: session.user.email }))
		}
	}, [session, status])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }))
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
			{/* Блок "О компании" */}
			<section className='container mx-auto px-4 text-center'>
				<h1 className='text-2xl font-semibold tracking-tight'>О компании</h1>
			</section>

			<section className='container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center'>
				<div className='space-y-4 text-gray-700 text-lg'>
					<p>
						<strong>Toolgrad</strong> — это надёжный поставщик строительного
						инструмента с многолетним опытом. Наша команда увлечена качественным
						сервисом и подбором лучших решений для наших клиентов.
					</p>
					<p>
						Мы верим, что качественный инструмент — залог безопасной и
						продуктивной работы. Именно поэтому в нашем ассортименте только
						проверенные бренды и актуальные модели.
					</p>
					<p>
						Мы обслуживаем как крупных подрядчиков, так и домашних мастеров,
						предлагая гибкие условия, профессиональную консультацию и
						оперативную доставку.
					</p>
				</div>
				<div className='relative w-full h-[350px] rounded-xl overflow-hidden shadow-lg'>
					<Image
						src='/images/team.jpg'
						alt='Наша команда'
						fill
						className='object-cover'
					/>
				</div>
			</section>

			{/* Контакты и карта */}
			<section className='container mx-auto px-4 space-y-12'>
				<div className='text-center space-y-2'>
					<h2 className='text-2xl font-semibold text-gray-900'>Контакты</h2>
				</div>

				<div className='grid lg:grid-cols-2 gap-10'>
					<div className='flex items-center'>
						<div className='bg-white rounded-xl shadow-md p-6 space-y-4 text-gray-700 text-base w-full'>
							<div>
								<span className='block font-semibold text-gray-800 mb-1'>
									Адрес:
								</span>
								<p>Московская обл., г. Красногорск, ул. Губайлово, 56</p>
							</div>
							<div>
								<span className='block font-semibold text-gray-800 mb-1'>
									Телефон:
								</span>
								<span className='text-[#F89514] font-medium hover:underline'>
									+7 (903) 750-98-16
								</span>
							</div>
							<div>
								<span className='block font-semibold text-gray-800 mb-1'>
									Email:
								</span>
								<a
									href='mailto:toolgradhelper@gmail.com'
									className='text-[#F89514] font-medium hover:underline'
								>
									toolgradhelper@gmail.com
								</a>
							</div>
							<div>
								<span className='block font-semibold text-gray-800 mb-1'>
									Время работы:
								</span>
								<p>Пн–Пт: с 9:00 до 19:00</p>
							</div>
							<hr className='border-gray-300' />
							<div className='text-sm text-gray-500'>
								<p>ИНН: 5024180714</p>
								<p>ОГРН: 1175024031160</p>
							</div>
						</div>
					</div>

					<div className='rounded-xl overflow-hidden shadow-md h-[400px] w-full'>
						<iframe
							src='https://yandex.ru/map-widget/v1/?ll=37.307815%2C55.830644&z=17&pt=37.307815,55.830644,pm2rdm'
							width='100%'
							height='100%'
							frameBorder='0'
							title='Офис Toolgrad на карте'
							className='w-full h-full border-0'
						></iframe>
					</div>
				</div>
			</section>

			{/* Форма обратной связи */}
			<section className='bg-gray-50 py-12 px-4 rounded-xl max-w-2xl mx-auto shadow'>
				<h2 className='text-2xl font-semibold mb-6 text-center'>
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
