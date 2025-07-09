// Импортируем нужные хуки и supabase
import { useEffect } from 'react'              // useEffect — для действий при загрузке
import { useRouter } from 'next/router'        // useRouter — для навигации
import { supabase } from '../lib/supabase'     // supabase — клиент для работы с API

// Главный компонент страницы выхода
export default function LogoutPage() {
  const router = useRouter() // Инициализируем роутер

  useEffect(() => {
    // Вызываем выход из аккаунта и делаем редирект
    const logout = async () => {
      await supabase.auth.signOut()      // Завершаем сессию в Supabase
      router.push('/login')              // Перенаправляем на страницу входа
    }

    logout() // Вызываем сразу после загрузки компонента
  }, [router]) // Добавляем router в зависимости useEffect

  // Пока идёт выход — показываем сообщение
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg text-gray-600">Выход из аккаунта...</p>
    </div> // Закрытие div
  )
} // Закрытие компонента LogoutPage
