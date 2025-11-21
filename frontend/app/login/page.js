'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import Logo from '@/components/Logo'

const translations = {
  agency: "O'rmon va yashil hududlarni ko'paytirish, cho'llanishga qarshi kurashish agentligi",
  title: "Daraxt Monitoring Tizimi",
  username: "Foydalanuvchi nomi",
  password: "Parol",
  loginButton: "Tizimga kirish",
  invalidCredentials: "Noto'g'ri foydalanuvchi nomi yoki parol",
}

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await authAPI.login(username, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Muvaffaqiyatli kirildi')
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      // Show more specific error message
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error(translations.invalidCredentials)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Logo size={80} />
          <p className="text-sm text-gray-600 text-center mt-4 leading-relaxed">
            {translations.agency}
          </p>
        </div>
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          {translations.title}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.username}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={translations.username}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={translations.password}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Yuklanmoqda...' : translations.loginButton}
          </button>
        </form>
      </div>
    </div>
  )
}

