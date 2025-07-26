 
// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ru">
      <Head>
        {/* Подключаем Roboto 400 + 500 + 700 (латиница и кириллица) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        />
      </Head>
      <body>
        <Main />   {/* Рендер всех страниц */}
        <NextScript /> {/* Скрипты Next.js */}
      </body>
    </Html>
  )
}
