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

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("role_profiles_with_email")
      .select("*");

    if (!error) setProfiles(data);
    setLoading(false);
  };

  const updateStatus = async (status) => {
    await supabase.from("role_profiles").update({ status }).eq("id", selectedId);
    setConfirmAction(null);
    setSelectedId(null);
    fetchProfiles();
  };

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

  // Смена сортировки при клике
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
              <th className="p-3 text-left w-28">Статус</th>
              <th
                className="p-3 text-left w-32 cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Дата регистрации{" "}
                {sortField === "created_at" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="p-3 text-center w-40">Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedProfiles.map((p, index) => (
              <tr
                key={p.id}
                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
              >
                <td className="p-3 border-b text-center">{index + 1}</td>
                <td className="p-3 border-b capitalize">{p.role}</td>
                <td className="p-3 border-b">{p.full_name}</td>
                <td className="p-3 border-b">{p.email}</td>
                <td className="p-3 border-b">{p.phone || "—"}</td>
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
                <td className="p-3 border-b">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 border-b text-center">
                  {p.status === "pending" ? (
                    <>
                      <button
                        onClick={() => {
                          setSelectedId(p.id);
                          setConfirmAction("approve");
                        }}
                        className="px-3 py-1 mr-2 rounded bg-green-500 text-white hover:bg-green-600"
                      >
                        Одобрить
                      </button>
                      <button
                        onClick={() => {
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
                      onClick={() => {
                        setSelectedId(p.id);
                        setConfirmAction("delete");
                      }}
                      className="px-3 py-1 rounded bg-red-400 text-white hover:bg-red-500"
                    >
                      Удалить профиль
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
