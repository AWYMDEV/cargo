// 📄 Файл: /components/Header.jsx

// Импорт компонента Link из Next.js для переходов между страницами
import Link from 'next/link'

// Импорт пользовательского хука авторизации, который предоставляет объект user
import { useAuth } from '../lib/auth'

// Импорт хуков состояния и эффекта из React
import { useEffect, useState } from 'react'

// Импорт хука маршрутизации из Next.js
import { useRouter } from 'next/router'

// Импорт клиента Supabase для работы с базой данных
import { supabase } from '../lib/supabase'

// Экспорт основного компонента Header
export default function Header() {
  // Получаем объект пользователя из кастомного хука авторизации
  const { user } = useAuth()

  // Состояния для проверки наличия профилей
  const [hasCarrier, setHasCarrier] = useState(false)
  const [hasShipper, setHasShipper] = useState(false)

  // Инициализируем маршрутизатор Next.js
  const router = useRouter()

  // Проверка наличия профилей
  useEffect(() => {
    if (!user) return

    const checkProfiles = async () => {
      const { data: carrier } = await supabase
        .from('carrier_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      const { data: shipper } = await supabase
        .from('shipper_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      setHasCarrier(!!carrier)
      setHasShipper(!!shipper)
    }

    checkProfiles()
  }, [user])

  const handleBecome = (role) => {
    router.push(`/onboarding/profile?role=${role}`)
  }

  return (
    <header className="bg-[#006BFF] text-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-bold text-white">
          <a href='/'>Cargo MVP</a>
        </h1>

        {
          user ? (
            <div className="flex items-center gap-4">
              {
                !hasCarrier && (
                  <button
                    onClick={() => handleBecome('carrier')}
                    className="bg-white text-[#006BFF] px-3 py-1 rounded hover:bg-green-200 text-sm"
                  >
                    Я — перевозчик
                  </button>
                )
              }
              {
                !hasShipper && (
                  <button
                    onClick={() => handleBecome('shipper')}
                    className="bg-white text-[#006BFF] px-3 py-1 rounded hover:bg-green-200 text-sm"
                  >
                    Я — отправитель
                  </button>
                )
              }
              <span className="text-sm text-white/80">
                {user.user_metadata?.full_name || user.email}
              </span>
              <Link
                href="/logout"
                className="text-red-300 hover:text-red-100 text-sm font-medium"
              >
                Выйти
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-green-200 hover:text-white text-sm font-medium"
            >
              Войти
            </Link>
          )
        }
      </div>
    </header>
  )
}
