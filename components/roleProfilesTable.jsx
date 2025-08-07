import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PopupConfirm from "./PopupConfirm";

const RoleProfilesTable = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [expandedRow, setExpandedRow] = useState(null); // раскрытая строка
  const [popupImage, setPopupImage] = useState(null); // для увеличенного фото

  // Загрузка данных
  const fetchProfiles = async () => {
    const { data, error } = await supabase.from("profiles_full_view").select("*");
    if (!error) setProfiles(data);
    setLoading(false);
  };

  // Обновление статуса
  const updateStatus = async (status) => {
    await supabase.from("role_profiles").update({ status }).eq("id", selectedId);
    setConfirmAction(null);
    setSelectedId(null);
    fetchProfiles();
  };

  // Удаление профиля
  const deleteProfile = async () => {
    await supabase.from("role_profiles").delete().eq("id", selectedId);
    setConfirmAction(null);
    setSelectedId(null);
    fetchProfiles();
  };

  // Сортировка
  const sortedProfiles = [...profiles]
    .filter((p) => (filterRole === "all" ? true : p.role === filterRole))
    .filter((p) => (filterStatus === "all" ? true : p.status === filterStatus))
    .sort((a, b) => {
      if (sortField === "full_name") {
        return sortOrder === "asc"
          ? a.full_name.localeCompare(b.full_name)
          : b.full_name.localeCompare(a.full_name);
      }
      if (sortField === "created_at") {
        return sortOrder === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  if (loading) return <p className="text-gray-600 text-center py-6">Загрузка...</p>;

  // Парсим JSON документов (с защитой от null)
  const parseDocuments = (docStr) => {
    if (!docStr) return {};
    try {
      return JSON.parse(docStr);
    } catch {
      return {};
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-[#006BFF]">📄 Профили ролей</h2>

      {/* Фильтры */}
      <div className="flex gap-4 mb-4">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">Все роли</option>
          <option value="shipper">Shipper</option>
          <option value="carrier">Carrier</option>
          <option value="broker">Broker</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">Все статусы</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#006BFF] text-white">
              <th className="p-3 text-left w-12">№</th>
              <th className="p-3 text-left w-28">Роль</th>
              <th
                className="p-3 text-left w-56 cursor-pointer"
                onClick={() => handleSort("full_name")}
              >
                Имя {sortField === "full_name" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="p-3 text-left w-40">Email</th>
              <th className="p-3 text-left w-32">Телефон</th>
              <th className="p-3 text-left w-32">Компания</th>
              <th
                className="p-3 text-left w-32 cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Дата создания{" "}
                {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="p-3 text-left w-28">Статус</th>
              <th className="p-3 text-center w-40">Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedProfiles.map((p, index) => {
              const documents = parseDocuments(p.documents_url);

              return (
                <>
                  <tr
                    key={p.id}
                    className={`cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                    onClick={() =>
                      setExpandedRow(expandedRow === p.id ? null : p.id)
                    }
                  >
                    <td className="p-3 border-b text-center">{index + 1}</td>
                    <td className="p-3 border-b capitalize">{p.role}</td>
                    <td className="p-3 border-b">{p.full_name}</td>
                    <td className="p-3 border-b">{p.email}</td>
                    <td className="p-3 border-b">{p.phone || "—"}</td>
                    <td className="p-3 border-b">{p.company_name || "—"}</td>
                    <td className="p-3 border-b">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td
                      className={`p-3 border-b font-medium ${
                        p.status === "approved"
                          ? "text-green-600"
                          : p.status === "rejected"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {p.status}
                    </td>
                    <td className="p-3 border-b text-center">
                      {p.status === "pending" ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(p.id);
                              setConfirmAction("approve");
                            }}
                            className="px-3 py-1 mr-2 rounded bg-green-500 text-white hover:bg-green-600"
                          >
                            Одобрить
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(p.id);
                              setConfirmAction("reject");
                            }}
                            className="px-3 py-1 mr-2 rounded bg-red-500 text-white hover:bg-red-600"
                          >
                            Отклонить
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(p.id);
                            setConfirmAction("delete");
                          }}
                          className="px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
                        >
                          Удалить
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Раскрытая строка */}
                  {expandedRow === p.id && (
                    <tr>
                      <td colSpan="9" className="p-4 bg-gray-100 border">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Текстовые данные */}
                          <div>
                            <h3 className="font-bold mb-2">Детали профиля</h3>
                            <p><b>USDOT:</b> {documents?.usd_ot_number || "-"}</p>
                            <p><b>MC Number:</b> {documents?.mc_number || "-"}</p>
                            <p><b>Лицензия:</b> {documents?.license || "-"}</p>
                          </div>

                          {/* Фото */}
                          <div>
                            <h3 className="font-bold mb-2">Документы</h3>
                            <div className="flex gap-2 flex-wrap">
                              {documents?.passport_front && (
                                <img
                                  src={documents.passport_front}
                                  alt="Passport Front"
                                  className="w-20 h-20 object-cover rounded cursor-pointer"
                                  onClick={() => setPopupImage(documents.passport_front)}
                                />
                              )}
                              {documents?.passport_back && (
                                <img
                                  src={documents.passport_back}
                                  alt="Passport Back"
                                  className="w-20 h-20 object-cover rounded cursor-pointer"
                                  onClick={() => setPopupImage(documents.passport_back)}
                                />
                              )}
                              {documents?.selfie && (
                                <img
                                  src={documents.selfie}
                                  alt="Selfie"
                                  className="w-20 h-20 object-cover rounded cursor-pointer"
                                  onClick={() => setPopupImage(documents.selfie)}
                                />
                              )}
                              {documents?.vehicle_photos?.map((url, i) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt={`Vehicle ${i + 1}`}
                                  className="w-20 h-20 object-cover rounded cursor-pointer"
                                  onClick={() => setPopupImage(url)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Popup фото */}
      {popupImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPopupImage(null)}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={popupImage}
              alt="Document"
              className="max-w-[90vw] max-h-[80vh] rounded shadow-lg"
            />
            <button
              onClick={() => setPopupImage(null)}
              className="absolute top-2 right-2 bg-white text-black rounded-full p-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Popup подтверждения */}
      {confirmAction && (
        <PopupConfirm
          message={
            confirmAction === "approve"
              ? "Подтвердить профиль?"
              : confirmAction === "reject"
              ? "Отклонить профиль?"
              : "Удалить профиль?"
          }
          onConfirm={() =>
            confirmAction === "approve"
              ? updateStatus("approved")
              : confirmAction === "reject"
              ? updateStatus("rejected")
              : deleteProfile()
          }
          onCancel={() => {
            setConfirmAction(null);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
};

export default RoleProfilesTable;
