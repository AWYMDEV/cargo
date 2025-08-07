// components/withGuestRedirect.jsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function withGuestRedirect(Component) {
  return function ProtectedGuestComponent(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // пользователь уже вошёл — отправим на dashboard
          router.replace("/dashboard");
        } else {
          setLoading(false); // показать форму входа/регистрации
        }
      };

      checkUser();
    }, [router]);

    if (loading) return <p>Загрузка...</p>;

    return <Component {...props} />;
  };
}
