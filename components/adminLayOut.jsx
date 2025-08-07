// components/adminLayout.jsx

import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminLayout({ children }) {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Левое меню */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 font-bold text-xl border-b border-gray-700">
          Cargo MVP
        </div>

        <nav className="flex-1 p-2 space-y-1 text-sm">
          <NavLink href="/admin" label="Пользователи" router={router} />
          <NavLink href="/admin/profiles" label="Профили" router={router} />
          <NavLink href="/admin/trucks" label="Машины" router={router} />
          <NavLink href="/admin/shipments" label="Грузы" router={router} />
        </nav>

        <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
          Панель администратора
        </div>
      </aside>

      {/* Контент */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}

function NavLink({ href, label, router }) {
  const isActive = router.pathname === href;
  return (
    <Link
      href={href}
      className={`block px-4 py-2 rounded-md ${
        isActive ? "bg-gray-800 font-semibold" : "hover:bg-gray-800"
      }`}
    >
      {label}
    </Link>
  );
}
