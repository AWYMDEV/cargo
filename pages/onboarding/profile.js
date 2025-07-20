// 📄 Файл: /pages/onboarding/profile.js

// 📦 Импорты React и хуков
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

// 📦 Импорт клиента Supabase
import { supabase } from '../../lib/supabase'

// 🟩 Компонент страницы регистрации перевозчика
export default function CarrierOnboarding() {
  const router = useRouter()
  const role = router.query.role

  const [formData, setFormData] = useState({
    company_name: '', // Название компании или имя физлица
    full_name: '',     // Полное имя (ФИО)
    truck_type: '',    // Тип трака
    mc_number: '',     // Номер лицензии перевозчика (MC)
    usdot_number: '',  // Номер USDOT
    operating_state: '', // Штаты
    phone: '',         // Телефон (общий для обеих ролей)
    address: '',       // Адрес (только для отправителей)
    is_individual: true // флаг "Я — частное лицо" (только для отправителей)
  })

  const [documents, setDocuments] = useState([]) // массив загруженных файлов
  const [profileCompleted, setProfileCompleted] = useState(false) // флаг успешной отправки

  const truckTypes = [
    'Flatbed', 'Dry Van', 'Reefer', 'Step Deck', 'Box Truck', 'Power Only', 'Hotshot', 'Tanker'
  ]

  // Обработка изменения любого input/checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Обработка выбора файла
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 15 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 15MB.')
      return
    }

    if (documents.length >= 5) {
      alert('Можно загрузить не более 5 документов.')
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) {
      alert('Пользователь не авторизован')
      return
    }

    const filePath = `${user.id}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('truck-documents').upload(filePath, file)

    if (error) {
      alert('Ошибка загрузки файла: ' + error.message)
    } else {
      setDocuments((prev) => [...prev, { name: file.name, path: filePath }])
    }
  }

  // Удаление выбранного файла
  const handleRemoveFile = async (index) => {
    const fileToRemove = documents[index]
    const { error } = await supabase.storage.from('truck-documents').remove([fileToRemove.path])

    if (error) {
      alert('Ошибка удаления файла: ' + error.message)
    } else {
      setDocuments((prev) => prev.filter((_, i) => i !== index))
    }
  }

  // Отправка формы
  const handleSubmit = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) {
      alert('Пользователь не авторизован')
      return
    }

    const payload = {
      user_id: user.id,
      company_name: formData.company_name,
      full_name: formData.full_name,
      phone: formData.phone // 📌 Телефон обязателен для обеих ролей
    }

    // Если это отправитель — добавляем адрес и is_individual
    if (role === 'shipper') {
      payload.address = formData.address
      payload.is_individual = formData.is_individual
    }

    // Если это перевозчик — добавляем данные трака
    if (role === 'carrier') {
      Object.assign(payload, {
        truck_type: formData.truck_type,
        mc_number: formData.mc_number,
        usdot_number: formData.usdot_number,
        operating_state: formData.operating_state
      })
    }

    const { error } = await supabase.from(role === 'carrier' ? 'carrier_profiles' : 'shipper_profiles').insert(payload)

    if (error) {
      alert('Ошибка при сохранении: ' + error.message)
    } else {
      setProfileCompleted(true)
      router.push('/dashboard')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">{role === 'carrier' ? 'Стать перевозчиком' : 'Стать отправителем'}</h2>

      {/* Название компании / имя */}
      <label className="block font-medium">Название компании / Индивидуальное имя</label>
      <input name="company_name" value={formData.company_name} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 mb-4 w-full" />

      {/* ФИО */}
      <label className="block font-medium">Полное имя (ФИО)</label>
      <input name="full_name" value={formData.full_name} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 mb-4 w-full" />

      {/* Телефон (для всех) */}
      <label className="block font-medium">Телефон</label>
      <input name="phone" value={formData.phone} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 mb-4 w-full" />

      {/* Только для отправителей */}
      {role === 'shipper' && (
        <>
          <label className="flex items-center mb-4">
            <input type="checkbox" name="is_individual" checked={formData.is_individual} onChange={handleChange} className="mr-2" />
            Я — частное лицо
          </label>

          <label className="block font-medium">Точный адрес</label>
          <input name="address" value={formData.address} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 mb-4 w-full" />
        </>
      )}

      {/* Только для перевозчиков */}
      {role === 'carrier' && (
        <>
          <label className="block font-medium">Тип трака</label>
          <select name="truck_type" value={formData.truck_type} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 mb-4 w-full">
            <option value="">Выберите...</option>
            {truckTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <label className="block font-medium">Номер лицензии перевозчика (MC)</label>
          <input name="mc_number" value={formData.mc_number} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 mb-4 w-full" />

          <label className="block font-medium">Номер USDOT</label>
          <input name="usdot_number" value={formData.usdot_number} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 mb-4 w-full" />

          <label className="block font-medium">Штаты, где вы работаете</label>
          <input name="operating_state" value={formData.operating_state} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 mb-6 w-full" />
        </>
      )}

      {/* Загрузка документов */}
      <label className="block font-medium mb-2">
        {role === 'carrier' ? 'Загрузите документы трака' : 'Загрузите документ (паспорт / лицензия)'} (макс. 5 файлов по 15MB)
      </label>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="block mb-4"
      />

      {/* Список загруженных файлов */}
      <ul className="text-sm text-gray-700 mb-4">
        {documents.map((doc, idx) => (
          <li key={idx} className="flex justify-between items-center mb-1">
            <span>📄 {doc.name}</span>
            <button
              onClick={() => handleRemoveFile(idx)}
              className="text-red-600 hover:underline text-xs"
            >Удалить</button>
          </li>
        ))}
      </ul>

      {/* Кнопка отправки */}
      {!profileCompleted && (
        <button className="bg-green-700 text-white px-4 py-2 rounded" onClick={handleSubmit}>
          Отправить заявку
        </button>
      )}
    </div>
  )
}
