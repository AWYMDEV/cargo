// Импортируем хуки React и supabase-клиент
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// Кастомный хук useAuth для проверки авторизации пользователя
export function useAuth() {
  const [user, setUser] = useState(null)       // Состояние для хранения информации о пользователе
  const [loading, setLoading] = useState(true) // Состояние загрузки (true, пока не получим сессию)

  useEffect(() => {
    // Асинхронная функция для получения текущей сессии
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession() // Получаем текущую сессию от Supabase
      setUser(data?.session?.user || null)                     // Сохраняем пользователя в состояние или null
      setLoading(false)                                        // Загрузка завершена
    }

    getSession() // Вызываем функцию сразу при монтировании компонента

    // Подписка на изменения сессии (например, вход или выход пользователя)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null) // Обновляем состояние user при любом изменении
    })

    // Возвращаем функцию отписки от событий при размонтировании
    return () => listener.subscription.unsubscribe()
  }, []) // Пустой массив зависимостей → выполняется один раз при загрузке компонента

  return { user, loading } // Возвращаем объект с текущим пользователем и состоянием загрузки
} // Конец функции useAuth
