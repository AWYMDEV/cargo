// 📄 Файл: /pages/onboarding/profile.js

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase, supabaseUrl } from '../../lib/supabase'
import { toast } from 'react-toastify';

export default function CarrierOnboarding() {
  const router = useRouter()
  const role = router.query.role

  const [formData, setFormData] = useState({
    company_name: '',
    full_name: '',
    truck_type: '',
    mc_number: '',
    usdot_number: '',
    operating_states: '',
    phone: '',
    address: '',
    is_individual: true
  })

  const [documents, setDocuments] = useState([])
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null) // от 0 до 100

  const truckTypes = ['Flatbed', 'Dry Van', 'Reefer', 'Step Deck', 'Box Truck', 'Power Only', 'Hotshot', 'Tanker']

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Показываем прогресс 0 перед началом
    setUploadProgress(0);

    try {
      // Получаем текущего пользователя
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert('Вы не авторизованы');
        return;
      }

      // Генерация имени файла: [роль]_[email]_[timestamp].[ext]
            // Проверяем, есть ли имя пользователя в user_metadata
      const userName = user.user_metadata?.full_name || 'anonymous';

      // Очищаем имя от пробелов, символов и делаем в нижнем регистре
      const sanitizedName = userName.trim().toLowerCase().replace(/\s+/g, '_');
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${role}_${sanitizedName}_${timestamp}.${extension}`;
      const filePath = `${fileName}`;

      // Загрузка файла в Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
       .from(`${role}-documents`)  // ← ✅ автоматический выбор бакета
        .upload(filePath, file);

      if (uploadError) {
        console.error('Ошибка загрузки файла:', uploadError);
        alert('Ошибка при загрузке файла');
        return;
      }

      // Вставка записи в таблицу carrier_documents или shipper_documents
      const documentsTable = `${role}_documents`;
      const insertRes = await supabase.from(documentsTable).insert({
        user_id: user.id,
        filename: fileName,
        path: filePath,
        uploaded_at: new Date().toISOString(),
        bucket: 'truck-documents'
      });

      if (insertRes.error) {
        console.error('Ошибка при записи в таблицу:', insertRes.error);
        alert('Ошибка при записи файла в базу');
        return;
      }

      toast.success('Файл успешно загружен!');
      setUploadProgress(null);
    } catch (err) {
      console.error('Ошибка во время загрузки:', err);
      alert('Ошибка при загрузке файла');
      setUploadProgress(null);
    }
  }

  const handleRemoveFile = async (index) => {
    const fileToRemove = documents[index]
    const { error } = await supabase.storage.from('truck-documents').remove([fileToRemove.path])
    if (error) return alert('Ошибка удаления файла: ' + error.message)
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) return alert('Пользователь не авторизован')

    const payload = {
      user_id: user.id,
      company_name: formData.company_name,
      full_name: formData.full_name,
      phone: formData.phone
    }

    if (role === 'shipper') {
      payload.address = formData.address
      payload.is_individual = formData.is_individual
    }

    if (role === 'carrier') {
      Object.assign(payload, {
        truck_type: formData.truck_type,
        mc_number: formData.mc_number,
        usdot_number: formData.usdot_number,
        operating_states: formData.operating_states
      })
    }

    const { error } = await supabase
      .from(role === 'carrier' ? 'carrier_profiles' : 'shipper_profiles')
      .insert(payload)

    if (error) {
      alert('Ошибка при сохранении: ' + error.message)
    } else {
      setProfileCompleted(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4 relative">
      <h2 className="text-2xl font-bold mb-6">
        {role === 'carrier' ? 'Стать перевозчиком' : 'Стать отправителем'}
      </h2>

      <label className="block font-medium">Название компании / Индивидуальное имя</label>
      <input name="company_name" value={formData.company_name} onChange={handleChange}
        className="border border-gray-300 rounded px-3 py-2 mb-4 w-full" />

      <label className="block font-medium">Полное имя (ФИО)</label>
      <input name="full_name" value={formData.full_name} onChange={handleChange}
        className="border border-gray-300 rounded px-3 py-2 mb-4 w-full" />

      <label className="block font-medium">Телефон</label>
      <input name="phone" value={formData.phone} onChange={handleChange}
        className="border border-gray-300 rounded px-3 py-2 mb-4 w-full" />

      {role === 'shipper' && (
        <>
          <label className="flex items-center mb-4">
            <input type="checkbox" name="is_individual" checked={formData.is_individual} onChange={handleChange} className="mr-2" />
            Я — частное лицо
          </label>

          <label className="block font-medium">Точный адрес</label>
          <input name="address" value={formData.address} onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 mb-4 w-full" />
        </>
      )}

      {role === 'carrier' && (
        <>
          <label className="block font-medium">Тип трака</label>
          <select name="truck_type" value={formData.truck_type} onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 mb-4 w-full">
            <option value="">Выберите...</option>
            {truckTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <label className="block font-medium">Номер лицензии перевозчика (MC)</label>
          <input name="mc_number" value={formData.mc_number} onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 mb-4 w-full" />

          <label className="block font-medium">Номер USDOT</label>
          <input name="usdot_number" value={formData.usdot_number} onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 mb-4 w-full" />

          <label className="block font-medium">Штаты, где вы работаете</label>
          <input name="operating_states" value={formData.operating_states} onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 mb-6 w-full" />
        </>
      )}

      <label className="block font-medium mb-2">
        {role === 'carrier' ? 'Загрузите документы трака' : 'Загрузите документ (паспорт / лицензия)'} (макс. 5 файлов по 15MB)
      </label>
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="block mb-4" />

      {uploadProgress !== null && (
        <div className="text-sm text-blue-600 mt-2">
          Загрузка файла: {uploadProgress}%
        </div>
      )}

      <ul className="text-sm text-gray-700 mb-4">
        {documents.map((doc, idx) => (
          <li key={idx} className="flex justify-between items-center mb-1">
            <span>📄 {doc.name}</span>
            <button onClick={() => handleRemoveFile(idx)} className="text-red-600 hover:underline text-xs">Удалить</button>
          </li>
        ))}
      </ul>

      {!profileCompleted && (
        <button className="bg-green-700 text-white px-4 py-2 rounded" onClick={handleSubmit}>
          Отправить заявку
        </button>
      )}

      {/* ✅ Успешный попап */}
      {profileCompleted && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm text-center">
            <div className="text-green-600 text-4xl mb-4">✔</div>
            <p className="text-lg font-semibold mb-2">Данные успешно отправлены</p>
            <p className="text-sm text-gray-600">Проверьте почту и ожидайте подтверждения.</p>
          </div>
        </div>
      )}
    </div>
  )
}
