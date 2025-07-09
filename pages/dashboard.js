// Импортируем хук useAuth из lib/auth.js
import { useAuth } from '../lib/auth'

// Импортируем useRouter для управления маршрутизацией
import { useRouter } from 'next/router'

// Импортируем useEffect для побочного эффекта (перенаправление)
import { useEffect } from 'react'

// Экспорт компонента Dashboard по умолчанию
export default function Dashboard() {

  // Используем хук useAuth для получения текущего пользователя и статуса загрузки
  const { user, loading } = useAuth()

  // Инициализируем маршрутизатор Next.js
  const router = useRouter()

  // Эффект для проверки авторизации и редиректа
  useEffect(() => {
    // Если загрузка завершена и пользователь не залогинен
    if (!loading && !user) {
      router.push('/login') // Перенаправляем пользователя на страницу логина
    }
  }, [user, loading, router]) // Зависимости: эффект будет вызываться при изменении user или loading

  // Если данные ещё загружаются — показываем сообщение "Загрузка..."
  if (loading) return <p>Загрузка...</p>

  // Возвращаем основное содержимое страницы Dashboard
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Контейнер с сообщением приветствия */}
      <h1 className="text-3xl font-bold">
        Добро пожаловать в Дашборд
      </h1> {/* Закрытие тега h1 */}
    </div> // Закрытие div
  )
} // Закрытие функции Dashboard
