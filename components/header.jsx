// Импортируем Link для навигации и useAuth для получения сессии
import Link from 'next/link'
import { useAuth } from '../lib/auth'

export default function Header() {
  const { user } = useAuth() // Получаем текущего пользователя или null

  return (
    <header  className="bg-green-700 text-white shadow-md px-4 py-3 text-lg font-bold">
      {/* Название/логотип слева */}
      <h1 className="text-xl font-semibold text-gray-800">
        Cargo MVP
      </h1>

      {/* Справа — блок для авторизованного или гостя */}
      {user ? (
        <div className="flex items-center gap-4">
          {/* Показываем email пользователя */}
          <span className="text-gray-700 text-sm">
            {user.email}
          </span>

          {/* Кнопка выхода */}
          <Link href="/logout" className="text-red-600 hover:underline">
            Выйти
          </Link>
        </div> // Закрытие блока справа
      ) : (
        // Гость: кнопка входа
        <Link href="/login" className="text-green-600 hover:underline">
          Войти
        </Link>
      )}
    </header> // Закрытие header
  )
} // Закрытие компонента Header
