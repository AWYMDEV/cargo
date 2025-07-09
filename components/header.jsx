import Link from 'next/link'
import { useAuth } from '../lib/auth'

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-green-700 text-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between w-full">
        {/* Левый блок: логотип */}
        <h1 className="text-xl font-bold text-white">
          Cargo MVP
        </h1>

        {/* Правый блок: вход/выход */}
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/80">
              {user.email}
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
        )}
      </div>
    </header>
  )
}
