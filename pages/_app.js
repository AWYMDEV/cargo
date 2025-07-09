import "@/styles/globals.css"                // Подключение глобальных стилей
import Layout from "../components/Layout"    // Компонент обёртки
import Header from "../components/header"     // Ты импортировал, но использовать будем в Layout

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />           {/* Здесь будет контент каждой страницы */}
    </Layout>
  )
}
