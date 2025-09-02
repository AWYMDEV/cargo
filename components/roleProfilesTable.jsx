// components/roleProfilesTable.jsx
// Профили (Carrier + Shipper) с раскрытием, попапом документов и модерацией.
// Быстрая загрузка: 2 запроса в параллели (Promise.all). Без JOIN.
// Кнопки "Одобрить/Отклонить" показываются ТОЛЬКО при status="pending".

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// ——— утилита: безопасно приводим documents_url к массиву ссылок ———
function normalizeDocs(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    // просто строка-ссылка
    return [raw];
  }
}

export default function RoleProfilesTable() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [popupImage, setPopupImage] = useState(null);

  // ====== ЗАГРУЗКА ДАННЫХ (БЫСТРО) ======
useEffect(() => {
  async function fetchProfiles() {
    setLoading(true); // показываем лоадер

    // ⚡ ПАРАЛЛЕЛЬНО 2 запроса
    const [carrierRes, shipperRes] = await Promise.all([
      supabase
        .from("carrier_profiles")
        .select(`
          *,
          carrier_documents (
            id,
            file_url,
            file_name
          )
        `)
        .order("created_at", { ascending: false }),

      supabase
        .from("shipper_profiles")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (carrierRes.error) console.error("carrier err:", carrierRes.error);
    if (shipperRes.error) console.error("shipper err:", shipperRes.error);

    const carriers = (carrierRes.data || []).map((c) => ({
      id: c.id,
      role: "Carrier",
      email: "-", // Email добавим позже через JOIN с users
      full_name: c.full_name || "",
      company_name: c.company_name || "",
      phone: c.phone || "",
      status: c.status || "pending",
      created_at: c.created_at || null,
      truck_type: c.truck_type || "",
      mc_number: c.mc_number || "",
      usdot_number: c.usdot_number || "",
      operating_states: c.operating_states || c.operating_state || "",
      documents: c.carrier_documents || [], // ⬅️ полученные документы
      documents_url: normalizeDocs(c.documents_url), // fallback
      description: "",
      cargo_types: "",
      address: "",
      is_individual: null,
    }));

    const shippers = (shipperRes.data || []).map((s) => ({
      id: s.id,
      role: "Shipper",
      email: "-",
      full_name: s.full_name || "",
      company_name: s.company_name || "",
      phone: s.phone || "",
      status: s.status || "pending",
      created_at: s.created_at || null,
      truck_type: "",
      mc_number: "",
      usdot_number: "",
      operating_states: "",
      documents: [], // для shipper пока нет документов
      documents_url: normalizeDocs(s.documents_url),
      description: s.description || "",
      cargo_types: s.cargo_types || "",
      address: s.address || "",
      is_individual: s.is_individual,
    }));

    const all = [...carriers, ...shippers]; // объединяем
    setProfiles(all); // сохраняем
    setLoading(false); // убираем лоадер
  }

  fetchProfiles(); // вызов на старте
}, []);


  // ====== смена статуса (approve/reject) ======
  async function updateStatus(profileId, role, newStatus) {
    const table = role === "Carrier" ? "carrier_profiles" : "shipper_profiles";

    const confirmMsg =
      newStatus === "approved" ? "Одобрить профиль?" : "Отклонить профиль?";
    if (!window.confirm(confirmMsg)) return;

    // оптимистичное обновление
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, status: newStatus } : p))
    );

    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq("id", profileId);

    if (error) {
      // откат + сообщение
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, status: "pending" } : p))
      );
      alert(`Не удалось обновить статус: ${error.message}`);
    }
  }

  const toggleRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500 p-3">Загрузка профилей…</div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full text-sm text-left border border-gray-200 bg-white">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">№</th>
              <th className="p-3">Роль</th>
              <th className="p-3">Имя / Компания</th>
              <th className="p-3">Email</th>
              <th className="p-3">Телефон</th>
              <th className="p-3">Статус</th>
              <th className="p-3">Дата регистрации</th>
              <th className="p-3">Действия</th>
            </tr>
          </thead>

          <tbody>
            {profiles.map((p, idx) => (
              <Row
                key={`${p.role}-${p.id}`}
                index={idx}
                profile={p}
                expanded={expandedRow === p.id}
                onToggle={() => toggleRow(p.id)}
                onOpenImage={setPopupImage}
                onChangeStatus={updateStatus}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Попап документа */}
      {popupImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPopupImage(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={popupImage}
              alt="Документ"
              className="max-w-[90vw] max-h-[80vh] rounded shadow-xl"
            />
            <button
              onClick={() => setPopupImage(null)}
              className="absolute top-2 right-2 bg-white/90 text-black rounded-full px-3 py-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ——— компонент строки таблицы + раскрытие ———
function Row({ index, profile, expanded, onToggle, onOpenImage, onChangeStatus }) {
  const statusColor =
    profile.status === "approved"
      ? "text-green-600"
      : profile.status === "rejected"
      ? "text-red-600"
      : "text-gray-700";

  return (
    <>
      {/* основная строка */}
      <tr className="border-b hover:bg-gray-50">
        <td className="p-3">{index + 1}</td>
        <td className="p-3">{profile.role}</td>
        <td className="p-3">{profile.company_name || profile.full_name || "—"}</td>
        <td className="p-3">{profile.email}</td>
        <td className="p-3">{profile.phone || "—"}</td>
        <td className={`p-3 font-semibold ${statusColor}`}>{profile.status}</td>
        <td className="p-3">
          {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
        </td>
        <td className="p-3">
          <button onClick={onToggle} className="text-blue-600 hover:underline">
            {expanded ? "Скрыть" : "Детали"}
          </button>
        </td>
      </tr>

      {/* раскрытая */}
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={8} className="p-4">
            <div className="grid grid-cols-2 gap-6">
              {/* левая колонка — данные */}
              <div className="space-y-2 text-sm">
                <p><b>Имя:</b> {profile.full_name || "—"}</p>
                <p><b>Компания:</b> {profile.company_name || "—"}</p>

                {profile.role === "Carrier" ? (
                  <>
                    <p><b>Truck Type:</b> {profile.truck_type || "—"}</p>
                    <p><b>MC Number:</b> {profile.mc_number || "—"}</p>
                    <p><b>USDOT:</b> {profile.usdot_number || "—"}</p>
                    <p><b>Operating States:</b> {profile.operating_states || "—"}</p>
                  </>
                ) : (
                  <>
                    <p><b>Описание:</b> {profile.description || "—"}</p>
                    <p><b>Типы грузов:</b> {profile.cargo_types || "—"}</p>
                    <p><b>Адрес:</b> {profile.address || "—"}</p>
                    <p>
                      <b>Физ. лицо:</b>{" "}
                      {profile.is_individual === null
                        ? "—"
                        : profile.is_individual
                        ? "Да"
                        : "Нет"}
                    </p>
                  </>
                )}

                {/* кнопки модерации — только если pending */}
                {profile.status === "pending" && (
                  <div className="pt-3 flex gap-2">
                    <button
                      onClick={() => onChangeStatus(profile.id, profile.role, "approved")}
                      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Одобрить
                    </button>
                    <button
                      onClick={() => onChangeStatus(profile.id, profile.role, "rejected")}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Отклонить
                    </button>
                  </div>
                )}
              </div>

              {/* правая колонка — документы */}
              <div>
                <h4 className="font-semibold mb-2">Документы</h4>
                {profile.documents_url && profile.documents_url.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {profile.documents_url.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`doc-${i}`}
                        className="w-24 h-24 object-cover rounded border cursor-pointer"
                        onClick={() => onOpenImage(url)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Документы не загружены</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
