// 📄 /pages/register.js

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Register() {
  const router = useRouter();

  // Шаги
  const [step, setStep] = useState(1);

  // Основные данные
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Роль
  const [role, setRole] = useState("");

  // Персональные данные
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [hasCompany, setHasCompany] = useState(false);

  // Данные компании
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyZip, setCompanyZip] = useState("");

  const [confirmData, setConfirmData] = useState(false);

  // Ошибки/успех
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Валидация телефона
  const validatePhone = (number) => /^\+?[0-9]{10,15}$/.test(number);

  // Следующий шаг
  const nextStep = () => {
    if (step === 1) {
      if (!phone || !email || !password || !confirmPassword) {
        setError("Заполните все поля");
        return;
      }
      if (!validatePhone(phone)) {
        setError("Введите корректный номер телефона");
        return;
      }
      if (password !== confirmPassword) {
        setError("Пароли не совпадают");
        return;
      }
    }
    if (step === 2 && !role) {
      setError("Выберите роль");
      return;
    }
    if (step === 3) {
      if (!fullName || !city || !country) {
        setError("Заполните все обязательные поля");
        return;
      }
      if (hasCompany && !companyName) {
        setError("Введите название компании");
        return;
      }
      if (!confirmData) {
        setError("Подтвердите корректность данных");
        return;
      }
    }

    setError("");
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  // Отправка формы
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Тут регистрация в Supabase или Firebase
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Регистрация успешна!");
      setTimeout(() => router.push("/login"), 3000);
    }
  };

  // Прогрессбар
// Прогресс-бар
const renderProgress = () => {
  const steps = [1, 2, 3] // количество шагов

  return (
    <div className="flex justify-center items-center mb-6">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center">
          {/* Кружок */}
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-sm font-bold
              ${
                s < step
                  ? "bg-blue-600 border-blue-600 text-white" // прошедший шаг
                  : s === step
                  ? "border-blue-600 text-blue-600 bg-white" // активный шаг
                  : "border-gray-300 text-gray-400 bg-white" // будущий шаг
              }`}
          >
            {s}
          </div>

          {/* Линия между кружками */}
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-12 mx-2 ${
                s < step ? "bg-blue-600" : "bg-gray-300"
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  )
}







  // Карточки для ролей
  const RoleCard = ({ value, label }) => (
    <div
      onClick={() => setRole(value)}
      className={`cursor-pointer p-4 border rounded-lg text-center transition ${
        role === value
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
      }`}
    >
      {label}
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
        Регистрация
      </h2>

      {renderProgress()}

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Шаг 1 */}
        {step === 1 && (
          <>
            <input
              type="tel"
              placeholder="Телефон"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            />
            <input
              type="password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            />
            <p className="text-sm mt-2">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-blue-600 underline">
                Войдите
              </Link>
            </p>
          </>
        )}

        {/* Шаг 2 */}
        {step === 2 && (
          <div className="grid grid-cols-1 gap-4">
            <RoleCard value="shipper" label="Отправитель" />
            <RoleCard value="carrier" label="Перевозчик" />
            <RoleCard value="broker" label="Брокер" />
          </div>
        )}

        {/* Шаг 3 */}
        {step === 3 && (
          <>
            <input
              type="text"
              placeholder="ФИО"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            />
            <input
              type="text"
              placeholder="Город"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            />
            <input
              type="text"
              placeholder="Страна"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            />

            {/* Переключатель: есть ли компания */}
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={hasCompany}
                onChange={() => setHasCompany(!hasCompany)}
                className="mr-2"
              />
              У меня есть компания
            </label>

            {hasCompany && (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  placeholder="Название компании"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Адрес компании"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="ZIP"
                  value={companyZip}
                  onChange={(e) => setCompanyZip(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>
            )}

            <label className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={confirmData}
                onChange={() => setConfirmData(!confirmData)}
                className="mr-2"
                required
              />
              Подтверждаю, что все введенные данные верны
            </label>
          </>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        {/* Кнопки управления */}
        <div className="flex justify-between pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              ← Назад
            </button>
          )}
          {step < 3 && (
            <button
              type="button"
              onClick={nextStep}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ml-auto"
            >
              Далее →
            </button>
          )}
          {step === 3 && (
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg ml-auto hover:bg-blue-700"
            >
              Зарегистрироваться
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
