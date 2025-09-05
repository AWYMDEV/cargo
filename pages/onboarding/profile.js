/* eslint-disable react-hooks/exhaustive-deps */
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
  const [uploadProgress, setUploadProgress] = useState(null)

  const truckTypes = ['Flatbed', 'Dry Van', 'Reefer', 'Step Deck', 'Box Truck', 'Power Only', 'Hotshot', 'Tanker']

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  useEffect(() => {
    fetchDocuments()
  }, [role])

  const fetchDocuments = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) return;

    const documentsTable = `${role}_documents`;
    const { data, error: fetchError } = await supabase
      .from(documentsTable)
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (!fetchError && data) {
      setDocuments(data);
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (documents.length >= 5) {
      toast.error('Можно загрузить не более 5 файлов');
      return;
    }

    setUploadProgress(0);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('Ошибка авторизации');
        return;
      }

      const userName = user.user_metadata?.full_name || 'anonymous';
      const sanitizedName = userName.trim().toLowerCase().replace(/\s+/g, '_');
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `${role}_${sanitizedName}_${timestamp}.${extension}`;
      const filePath = `${fileName}`;

      const reader = new FileReader();
      reader.onload = async () => {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(`${role}-documents`)
          .upload(filePath, file);

        if (uploadError) {
          toast.error('Ошибка при загрузке файла');
          return;
        }

        const insertRes = await supabase.from(`${role}_documents`).insert({
          user_id: user.id,
          filename: fileName,
          path: filePath,
          uploaded_at: new Date().toISOString(),
          bucket: `${role}-documents`
        });

        if (insertRes.error) {
          toast.error('Ошибка при записи в базу');
          return;
        }

        toast.success('Файл успешно загружен!');
        setUploadProgress(null);
        fetchDocuments();
      };

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      };

      reader.onerror = () => {
        toast.error('Ошибка при чтении файла');
        setUploadProgress(null);
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Ошибка:', err);
      toast.error('Ошибка при загрузке');
      setUploadProgress(null);
    }
  }

  const handleRemoveFile = async (fileId, filePath) => {
    const { error: storageError } = await supabase.storage.from(`${role}-documents`).remove([filePath]);
    const { error: dbError } = await supabase.from(`${role}_documents`).delete().eq('id', fileId);

    if (storageError || dbError) {
      toast.error('Ошибка удаления файла');
      return;
    }

    toast.success('Файл удалён');
    fetchDocuments();
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
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="bg-blue-600 h-full text-white text-sm flex items-center justify-center transition-all duration-300 ease-in-out"
            style={{ width: `${uploadProgress}%` }}
          >
            {uploadProgress}%
          </div>
        </div>
      )}

      <ul className="text-sm text-gray-700 mb-4">
        {documents.map((doc) => (
          <li key={doc.id} className="flex justify-between items-center mb-1">
            <span>📄 {doc.filename}</span>
            <button onClick={() => handleRemoveFile(doc.id, doc.path)} className="text-red-600 hover:underline text-xs">Удалить</button>
          </li>
        ))}
      </ul>

      {!profileCompleted && (
        <button className="bg-blue-700 text-white px-4 py-2 rounded" onClick={handleSubmit}>
          Отправить заявку
        </button>
      )}

      {profileCompleted && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm text-center">
            <div className="text-blue-600 text-4xl mb-4">✔</div>
            <p className="text-lg font-semibold mb-2">Данные успешно отправлены</p>
            <p className="text-sm text-gray-600">Проверьте почту и ожидайте подтверждения.</p>
          </div>
        </div>
      )}
    </div>
  )
}
