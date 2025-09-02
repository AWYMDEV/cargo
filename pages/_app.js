import "@/styles/globals.css";                   // Подключение глобальных стилей
import Layout from "../components/layout";       // Компонент-обёртка
import Header from "../components/header";       // Просто импорт, если понадобится
import { useEffect } from "react";               // Нужно для хука
import { useRouter } from "next/router";         // Для редиректа
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Проверяем хеш в URL при монтировании
    if (typeof window !== "undefined") {
      const hash = window.location.hash;

      // Если Supabase передал ссылку восстановления — редиректим
      if (hash.includes("type=recovery")) {
        router.replace("/reset-password" + hash);  // Сохраняем токен в хеше
      }
   
   
    }
  }, [router]);

  return (
    <Layout>
      <Component {...pageProps} /> {/* Контент текущей страницы */}
       <ToastContainer position="top-center" autoClose={3000} />
    </Layout>
    
  );
}
