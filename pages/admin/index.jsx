// pages/admin/index.jsx

import { useEffect, useState } from "react"; // импорт хуков для работы с состоянием и эффектами
import { useRouter } from "next/router"; // для редиректов
import { supabase } from "../../lib/supabase"; // подключение к Supabase (не забудь правильный путь)
import AdminTabs from "../../components/AdminTabs"; // импорт компонента с вкладками

const AdminPage = () => {
  const router = useRouter(); // инициализация роутера
  const [loading, setLoading] = useState(true); // состояние загрузки
  const [isAdmin, setIsAdmin] = useState(false); // состояние — является ли пользователь админом

  // список разрешённых email для админов
  const adminEmails = [
    "admin1@cargo.com",
     "sulton@boy.tj",
    "moderator@cargo.com",
    // добавь нужные email сюда
  ];

  useEffect(() => {
    // функция для проверки авторизации и email
    const checkAdmin = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(); // получаем текущего пользователя

      if (error || !user) {
        router.push("/login"); // если не авторизован — перенаправляем на login
        return;
      }

      const email = user.email; // достаём email

      if (adminEmails.includes(email)) {
        setIsAdmin(true); // если email в списке — пользователь админ
      }

      setLoading(false); // отключаем режим загрузки
    };

    checkAdmin(); // вызываем функцию при загрузке компонента
  }, [router]); // сработает один раз при загрузке

  if (loading) {
    return <p>Загрузка...</p>; // пока идёт проверка — показываем загрузку
  }

  if (!isAdmin) {
    return <p style={{ color: "red" }}>⛔ Доступ запрещён. Вы не администратор.</p>; // если не админ
  }

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Админ-панель</h1> {/* заголовок */}
      <AdminTabs /> {/* рендерим вкладки (пока заглушка, потом добавим таблицы) */}
    </div>
  );
};

export default AdminPage; // экспорт компонента по умолчанию
