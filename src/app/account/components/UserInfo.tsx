'use client'

interface UserInfoProps {
	fullName: string // Полное имя пользователя
	email: string // Email
	birthDate: string | null // Дата рождения (или null)
	avatar: number // Индекс цвета аватара
}

export default function UserInfo({
	fullName,
	email,
	birthDate,
	avatar = 0,
}: UserInfoProps) {
	// Получаем инициалы из полного имени (максимум 2 буквы)
	const initials = fullName
		.split(' ')
		.map(word => word[0]?.toUpperCase()) // Берём первую букву каждого слова
		.join('')
		.slice(0, 2)

	// Классы для фона и цвета текста аватара
	const colorClasses = [
		'bg-green-100 text-green-900',
		'bg-blue-100 text-blue-900',
		'bg-yellow-100 text-yellow-900',
		'bg-pink-100 text-pink-900',
	]

	const colorClass = colorClasses[avatar % colorClasses.length] // Выбор цвета по индексу

	return (
		<div className='bg-white rounded-xl shadow p-6 flex flex-col items-center sm:flex-row sm:items-start gap-4'>
			{/* Блок с аватаром и инициалами */}
			<div
				className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full text-2xl sm:text-3xl font-bold flex items-center justify-center ${colorClass}`}
			>
				{initials}
			</div>

			{/* Текстовая информация о пользователе */}
			<div className='text-center sm:text-left'>
				<p className='text-lg sm:text-xl font-bold break-words'>{fullName}</p>
				<p className='break-words'>
					<span className='font-semibold'>Email:</span> {email}
				</p>
				<p>
					<span className='font-semibold'>Дата рождения:</span>{' '}
					{birthDate || '—'}{' '}
					{/* Если дата рождения отсутствует — отображаем прочерк */}
				</p>
			</div>
		</div>
	)
}
