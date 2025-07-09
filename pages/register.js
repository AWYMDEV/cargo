// Импортируем хуки React
import { useState } from 'react' // Хук состояния
import { useRouter } from 'next/router' // Хук маршрутизации
import { supabase } from '../lib/supabase' // Подключение клиента Supabase

// Компонент страницы регистрации
export default function Register() {
  // Управление состоянием формы
  const [fullName, setFullName] = useState('') // Имя
  const [email, setEmail] = useState('') // Email
  const [password, setPassword] = useState('') // Пароль
  const [confirmPassword, setConfirmPassword] = useState('') // Подтверждение пароля
  const [showPassword, setShowPassword] = useState(false) // Переключатель видимости пароля
  const [error, setError] = useState('') // Сообщение об ошибке
  const [success, setSuccess] = useState('') // Сообщение об успехе

  const router = useRouter() // Для редиректа

  // Обработчик формы регистрации
  const handleRegister = async (e) => {
    e.preventDefault() // Отмена перезагрузки страницы

    // Очистка предыдущих сообщений
    setError('') // Очистка ошибки
    setSuccess('') // Очистка успеха

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      setError('Пароли не совпадают') // Если разные — выводим ошибку
      return // Прерываем выполнение
    }

    // Пытаемся зарегистрировать пользователя
    const { error } = await supabase.auth.signUp({
      email, // Email из формы
      password, // Пароль из формы
      options: {
        data: {
          full_name: fullName, // Дополнительное поле: имя
        },
      },
    })

    // Обработка ответа
    if (error) {
      setError(error.message) // Выводим сообщение об ошибке
    } else {
      setSuccess('Письмо для подтверждения отправлено на почту.') // Выводим сообщение об успехе

      // Очищаем поля формы
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')

      // Ждём 3 секунды и редиректим на login
      setTimeout(() => {
        router.push('/login') // Переход на страницу входа
      }, 3000) // Через 3 секунды (3000 мс)
    }
  } // Закрытие handleRegister

  // Возврат JSX
  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      {/* Заголовок */}
      <h2 className="text-2xl font-bold mb-4 text-center text-green-700">
        Регистрация
      </h2>

      {/* Форма */}
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Поле имя */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Имя</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded px-3 py-2 mt-1 bg-gray-100 text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Поле email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded px-3 py-2 mt-1 bg-gray-100 text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Поле пароль */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Пароль</label>
          <input
            type={showPassword ? 'text' : 'password'} // Скрытие или показ пароля
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded px-3 py-2 mt-1 bg-gray-100 text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Поле подтверждение пароля */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Повторите пароль</label>
          <input
            type={showPassword ? 'text' : 'password'} // То же отображение
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded px-3 py-2 mt-1 bg-gray-100 text-black placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Чекбокс показать пароль */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)} // Инвертируем флаг
            className="mr-2"
          />
          <label htmlFor="showPassword" className="text-sm text-gray-700">
            Показать пароль
          </label>
        </div>

        {/* Вывод ошибки */}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Вывод успеха */}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        {/* Кнопка отправки */}
        <button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded transition"
        >
          Зарегистрироваться
        </button>
      </form> {/* Закрытие формы */}
    </div> // Закрытие div-обёртки
  )
} // Конец компонента Register
