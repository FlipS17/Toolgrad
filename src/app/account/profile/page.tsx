'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'
import UserInfo from '../components/UserInfo'

interface User {
	id: number
	firstName: string
	lastName: string
	email: string
	birthDate?: string
	avatar: number
}

export default function ProfilePage() {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		axios
			.get('/api/account/profile')
			.then(res => setUser(res.data))
			.catch(err => console.error(err))
			.finally(() => setLoading(false))
	}, [])

	if (loading) return <div className='p-4'>Загрузка...</div>
	if (!user) return <div className='p-4'>Ошибка загрузки</div>

	return (
		<div className='container mx-auto px-4'>
			<h1 className='text-2xl font-semibold mb-6 text-center'>Информация</h1>

			<UserInfo
				fullName={`${user.firstName} ${user.lastName}`}
				email={user.email}
				birthDate={
					user.birthDate ? new Date(user.birthDate).toLocaleDateString() : null
				}
				avatar={user.avatar}
			/>
		</div>
	)
}
