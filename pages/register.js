// Импортируем React-хуки и useState для управления состоянием
import { useState } from 'react'

// Импортируем клиент Supabase
import { supabase } from '../lib/supabase'
import { useEffect } from 'react' // useEffect добавлен
import { useRouter } from 'next/router' // Хук редиректа

// Экспортируем компонент Register (страница регистрации)
export default function Register() {
  // Состояние для формы
  const [fullName, setFullName] = useState('')       // Имя пользователя
  const [email, setEmail] = useState('')             // Email
  const [password, setPassword] = useState('')       // Пароль
  const [confirmPassword, setConfirmPassword] = useState('') // Повтор пароля
  const [showPassword, setShowPassword] = useState(false)    // Показывать пароль или нет
  const [error, setError] = useState('')             // Ошибка
  const [success, setSuccess] = useState('')         // Успех (для вывода сообщения)
  const router = useRouter() // Получаем роутер для навигации


  // Функция регистрации при отправке формы
  const handleRegister = async (e) => {
    e.preventDefault() // Отменяем стандартную отправку формы

    setError('') // Сброс ошибки
    setSuccess('') // Сброс успеха
    if (error) {
  setError(error.message) // Устанавливаем текст ошибки
} else {
  setSuccess('Письмо для подтверждения отправлено на почту.') // Успех

  // Очищаем поля
  setFullName('')
  setEmail('')
  setPassword('')
  setConfirmPassword('')

  // Редирект на login через 3 секунды
  setTimeout(() => {
    router.push('/login') // Перенаправление
  }, 3000) // 3000 мс = 3 сек
}


    // Проверка: пароли должны совпадать
    if (password !== confirmPassword) {
      setError('Пароли не совпадают') // Устанавливаем ошибку
      return // Прерываем функцию
    }

    // Пытаемся зарегистрировать пользователя в Supabase
    const { data, error } = await supabase.auth.signUp({
      email, // Email из поля
      password, // Пароль
      options: {
        data: {
          full_name: fullName, // Дополнительные метаданные: имя
        }
      }
    })

    // Если есть ошибка — выводим её
    if (error) {
      setError(error.message) // Устанавливаем текст ошибки
    } else {
      setSuccess('Письмо для подтверждения отправлено на почту.') // Успешная регистрация
      setFullName('') // Очищаем поля
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    }
  } // Закрытие функции handleRegister

  // Возвращаем JSX разметку
  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center text-green-700">
        Регистрация {/* Заголовок */}
      </h2>

      {/* Форма регистрации */}
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Поле для имени */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Имя
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
           className="w-full rounded px-3 py-2 mt-1 bg-gray-100 text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"

          />
        </div>

        {/* Поле Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
           className="w-full rounded px-3 py-2 mt-1 bg-gray-100 text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"

          />
        </div>

        {/* Поле Пароль */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Пароль
          </label>
          <input
            type={showPassword ? 'text' : 'password'} // Переключение видимости
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded px-3 py-2 mt-1 bg-gray-100 text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"

          />
        </div>

        {/* Поле Повтор пароля */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Повторите пароль
          </label>
          <input
            type={showPassword ? 'text' : 'password'} // Тот же переключатель
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded px-3 py-2 mt-1 bg-gray-100 text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"

          />
        </div>

        {/* Кнопка "Показать пароль" */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)} // Инвертируем значение
            className="mr-2"
          />
          <label htmlFor="showPassword" className="text-sm text-gray-700">
            Показать пароль
          </label>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <p className="text-red-600 text-sm">
            {error}
          </p>
        )}

        {/* Сообщение об успехе */}
        {success && (
          <p className="text-green-600 text-sm">
            {success}
          </p>
        )}

        {/* Кнопка отправки */}
        <button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded transition"
        >
          Зарегистрироваться
        </button>
      </form> {/* Закрытие формы */}
    </div> // Закрытие div обёртки
  )
} // Закрытие компонента Register
