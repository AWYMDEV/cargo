// 📄 Файл: /pages/register.js

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Register() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('')
  const [isIndividual, setIsIndividual] = useState(true)
  const [confirmData, setConfirmData] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const validatePhone = (number) => {
    const phoneRegex = /^\+?[0-9]{10,15}$/
    return phoneRegex.test(number)
  }

  const nextStep = () => {
    if (step === 1) {
      if (!fullName || !email || !phone || !password || !confirmPassword) {
        setError('Пожалуйста, заполните все поля на этом шаге')
        return
      }
      if (!validatePhone(phone)) {
        setError('Введите корректный номер телефона')
        return
      }
      if (password !== confirmPassword) {
        setError('Пароли не совпадают')
        return
      }
    }
    if (step === 2 && !role) {
      setError('Пожалуйста, выберите роль')
      return
    }
    if (step === 3 && role === 'shipper' && isIndividual === null) {
      setError('Пожалуйста, выберите тип отправителя')
      return
    }
    setError('')
    setStep((prev) => prev + 1)
  }

  const prevStep = () => setStep((prev) => prev - 1)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (!validatePhone(phone)) {
      setError('Введите корректный номер телефона')
      return
    }

    if (!confirmData) {
      setError('Необходимо подтвердить корректность данных')
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role,
          is_individual: role === 'shipper' ? isIndividual : null
        }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Письмо для подтверждения отправлено.')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  const renderStepIndicator = () => {
    const steps = [1, 2, 3, 4]
    return (
      <div className="flex justify-center mb-6 gap-4">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
              s < step
                ? 'bg-green-600 text-white border-green-600'
                : s === step
                ? 'bg-white text-green-700 border-green-600'
                : 'bg-white text-gray-400 border-gray-300'
            }`}
          >
            {s < step ? '✓' : s}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center text-green-700">
        Регистрация
      </h2>

      {renderStepIndicator()}

      <form onSubmit={handleRegister} className="space-y-4">
        {step === 1 && (
          <>
            <input type="text" placeholder="ФИО" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full border px-3 py-2 rounded" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border px-3 py-2 rounded" />
            <input type="tel" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full border px-3 py-2 rounded" />
            <input type={showPassword ? 'text' : 'password'} placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border px-3 py-2 rounded" />
            <input type={showPassword ? 'text' : 'password'} placeholder="Подтвердите пароль" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full border px-3 py-2 rounded" />
            <label className="flex items-center text-sm"><input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} className="mr-2" /> Показать пароль</label>
            <p className="text-sm mt-2">Уже есть аккаунт? <Link href="/login" className="text-blue-600 underline">Войдите</Link></p>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm font-medium mb-2">Выберите роль:</p>
            <label className="block"><input type="radio" name="role" value="carrier" checked={role === 'carrier'} onChange={(e) => setRole(e.target.value)} className="mr-2" /> Перевозчик</label>
            <label className="block"><input type="radio" name="role" value="shipper" checked={role === 'shipper'} onChange={(e) => setRole(e.target.value)} className="mr-2" /> Отправитель</label>
            <label className="block"><input type="radio" name="role" value="broker" checked={role === 'broker'} onChange={(e) => setRole(e.target.value)} className="mr-2" /> Брокер</label>
          </>
        )}

        {step === 3 && role === 'shipper' && (
          <>
            <p className="text-sm font-medium mb-2">Вы —</p>
            <label className="block"><input type="radio" name="type" value="true" checked={isIndividual === true} onChange={() => setIsIndividual(true)} className="mr-2" /> Частное лицо</label>
            <label className="block"><input type="radio" name="type" value="false" checked={isIndividual === false} onChange={() => setIsIndividual(false)} className="mr-2" /> Компания</label>
          </>
        )}

        {step === 4 && (
          <>
            <label className="flex items-center">
              <input type="checkbox" checked={confirmData} onChange={() => setConfirmData(!confirmData)} className="mr-2" />
              Подтверждаю, что все введенные данные верны
            </label>
          </>
        )}

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2">{success}</p>}

        <div className="flex justify-between pt-4">
          {step > 1 && <button type="button" onClick={prevStep} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">← Назад</button>}
          {step < 4 && <button type="button" onClick={nextStep} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-auto">Далее →</button>}
          {step === 4 && (
            <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded ml-auto">
              Зарегистрироваться
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
