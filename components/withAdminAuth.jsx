// components/withAdminAuth.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

// Оборачивающий компонент для проверки прав администратора
export default function withAdminAuth(Component) {
  return function ProtectedAdminComponent(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      const checkAdmin = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          router.replace("/login"); // если не вошёл
          return;
        }

        const email = user.email;
        const adminEmails = [
          "admin1@cargo.com",
          "sulton@boy.tj",
          "moderator@cargo.com",
        ];

        if (adminEmails.includes(email)) {
          setIsAdmin(true);
        } else {
          router.replace("/login"); // не админ — на выход
        }

        setLoading(false);
      };

      checkAdmin();
    }, [router]);

    if (loading) return <p>Загрузка...</p>;
    if (!isAdmin) return null;

    return <Component {...props} />;
  };
}
