// pages/onboarding.js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase"; //   Подключаем Supabase 

export default function Onboarding() {
  const router = useRouter(); // ⚙️ Для редиректов
  const [user, setUser] = useState(null); // 💾 Храним текущего пользователя
  const [roles, setRoles] = useState([]); // 💾 Выбранные роли (shipper, carrier)
  const [loading, setLoading] = useState(false); // ⏳ Состояние загрузки
  const [error, setError] = useState(null); // ⚠️ Ошибки

  // 🔁 Получаем текущего пользователя при загрузке страницы
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Ошибка получения пользователя:", error.message);
        return;
      }

      setUser(data.user);
    };

    fetchUser();
  }, []);

  // ✅ Обработчик клика по чекбоксу
  const handleRoleChange = (role) => {
    // Если уже выбрана — убираем
    if (roles.includes(role)) {
      setRoles(roles.filter((r) => r !== role));
    } else {
      // Иначе добавляем
      setRoles([...roles, role]);
    }
  };

  // 🚀 Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 🛡 Проверяем, что хотя бы одна роль выбрана
    if (roles.length === 0) {
      setError("Пожалуйста, выберите хотя бы одну роль.");
      setLoading(false);
      return;
    }

    // 🔄 Обновляем таблицу profiles, записываем roles
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ roles })
      .eq("id", user.id);

    if (updateError) {
      setError("Ошибка при сохранении ролей: " + updateError.message);
      setLoading(false);
      return;
    }

    // ✅ Редиректим на страницу заполнения профиля
    router.push("/onboarding/profile");
  };

  // 🔒 Пока не загрузился пользователь — показываем пусто
  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Добро пожаловать!</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Пожалуйста, выбери роли, в которых ты хочешь использовать платформу:
        </p>

        {/* Сообщение об ошибке */}
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Чекбокс — Shipper */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={roles.includes("shipper")}
              onChange={() => handleRoleChange("shipper")}
              className="h-4 w-4"
            />
            <span>Я отправитель (Shipper)</span>
          </label>

          {/* Чекбокс — Carrier */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={roles.includes("carrier")}
              onChange={() => handleRoleChange("carrier")}
              className="h-4 w-4"
            />
            <span>Я перевозчик (Carrier)</span>
          </label>

          {/* Кнопка */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Сохраняем..." : "Продолжить"}
          </button>
        </form>
      </div>
    </div>
  );
}
