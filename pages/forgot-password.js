// pages/forgot-password.js

import { useState } from 'react';
import { supabase } from '../lib/supabase'; // ✅ правильный путь
import { useRouter } from 'next/router';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setError(error.message);
    } else {
      setMessage('Ссылка для сброса отправлена. Проверьте почту.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-4 border rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Восстановление пароля</h1>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          className="btn"
        >
          Отправить ссылку
        </button>
      </form>
      {error && <p className="text-red-600 mt-4">{error}</p>}
      {message && <p className="text-green-600 mt-4">{message}</p>}
    </div>
  );
}
