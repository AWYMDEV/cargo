// pages/reset-password.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [isReady, setIsReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const router = useRouter();

  useEffect(() => {
    let timeoutId;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsReady(true);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setIsReady(true);
      }
    });

    timeoutId = setTimeout(() => {
      setError('Срок действия ссылки истёк или вход не выполнен. Попробуйте ещё раз.');
    }, 10000);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Пароль успешно обновлён. Переход на главную...');
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  };

  if (!isReady && !error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-4 border rounded-xl shadow-md text-center">
        <p>Проверка авторизации...</p>
      </div>
    );
  }

  if (error && !isReady) {
    return (
      <div className="max-w-md mx-auto mt-20 p-4 border rounded-xl shadow-md text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-4 border rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Новый пароль</h1>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">Новый пароль</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          required
        />
        <label className="block mb-2 font-medium">Подтвердите пароль</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          className="btn"
        >
          Сохранить
        </button>
      </form>
      {message && <p className="text-green-600 mt-4">{message}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
