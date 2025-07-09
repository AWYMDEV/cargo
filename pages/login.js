import { useState } from 'react'                            // React-хук состояния
import { supabase } from '../lib/supabase'                  // Supabase клиент
import { useRouter } from 'next/router'                     // Хук для редиректа

export default function LoginPage() {
  const router = useRouter()                                // Инициализируем роутер
  const [email, setEmail] = useState('')                    // Email
  const [password, setPassword] = useState('')              // Пароль
  const [error, setError] = useState(null)                  // Ошибка (если есть)

  // Функция отправки формы входа
  const handleSubmit = async (e) => {
    e.preventDefault()                                      // Отмена стандартной отправки
    setError(null)                                          // Очистка ошибки

    // Вход через Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,                                                // Email
      password                                              // Пароль
    })

    // Если ошибка — показать пользователю
    if (error) {
      setError(translateError(error.message))               // Переводим и выводим
    } else {
      router.push('/')                                      // Иначе редирект на главную
    }
  }

  // Перевод ошибок Supabase
  const translateError = (msg) => {
    if (!msg) return null                                   // Если пусто — null
    if (msg.includes('Invalid login credentials')) return 'Неверный email или пароль'
    if (msg.includes('Email not valid')) return 'Неверный формат email'
    if (msg.includes('User already registered')) return 'Пользователь уже зарегистрирован'
    if (msg.includes('Email not confirmed')) return 'Подтвердите email перед входом'
    if (msg.includes('Password should be at least')) return 'Пароль слишком короткий'
    return 'Неизвестная ошибка: ' + msg                     // Остальное — показать как есть
  }

  // Интерфейс
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Форма логина */}
      <div className="bg-white shadow-md p-6 rounded-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Вход
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Поле Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Поле Пароль */}
          <input
            type="password"
            placeholder="Пароль"
            className="w-full border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Сообщение об ошибке */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Кнопка входа */}
          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800"
          >
            Войти
          </button>
        </form>

        {/* Ссылка на регистрацию */}
        <p className="mt-4 text-sm text-center text-gray-800">
          Нет аккаунта?{' '}
          <button
            className="text-green-700 underline"
            onClick={() => router.push('/register')}       // Перенаправление на регистрацию
          >
            Регистрация
          </button>
        </p>
      </div>
    </div>
  )
}
