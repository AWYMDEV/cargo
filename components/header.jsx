// Импортируем Link из Next.js для навигации между страницами
import Link from 'next/link'

// Импортируем кастомный хук useAuth из нашей папки lib
import { useAuth } from '../lib/auth'

// Экспортируем компонент Header (шапка сайта)
export default function Header() {
  // Получаем объект user из хука useAuth (будет null, если пользователь не авторизован)
  const { user } = useAuth()

  // Возвращаем JSX разметку хедера
  return (
    // Обёртка: фон зелёный, текст белый, тень, внутренние отступы
    <header className="bg-green-700 text-white shadow-md px-6 py-4">
      {/* Flex контейнер, выравнивает логотип и правую часть по краям, по горизонтали */}
      <div className="flex items-center justify-between w-full">
        
        {/* Левая часть — логотип сайта */}
        <h1 className="text-xl font-bold text-white">
          Cargo MVP {/* Название проекта */}
        </h1> {/* Закрытие тега h1 */}

        {/* Правая часть — вход/выход */}
        {
          user ? ( // Если пользователь авторизован
            <div className="flex items-center gap-4">
              {/* Отображаем email пользователя, немного прозрачный */}
              <span className="text-sm text-white/80">
                {user.email} {/* Подставляется email */}
              </span> {/* Закрытие тега span */}

              {/* Кнопка выхода — ссылка на страницу logout */}
              <Link
                href="/logout" // Путь к странице logout
                className="text-red-300 hover:text-red-100 text-sm font-medium"
              >
                Выйти {/* Текст кнопки */}
              </Link> {/* Закрытие тега Link */}
            </div> // Закрытие div с кнопкой и email
          ) : ( // Иначе — если пользователь НЕ авторизован
            <Link
              href="/login" // Путь к странице входа
              className="text-green-200 hover:text-white text-sm font-medium"
            >
              Войти {/* Текст ссылки входа */}
            </Link> // Закрытие тега Link
          )
        } 
      </div> {/* Закрытие flex-обёртки */}
    </header> // Закрытие header
  )
} // Закрытие компонента Header
