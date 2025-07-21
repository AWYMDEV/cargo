// components/RoleRequestsTable.jsx

import { useEffect, useState } from "react"; // хуки состояния и эффекта
import { supabase } from "../lib/supabase"; // импорт Supabase клиента

const RoleRequestsTable = () => {
  const [requests, setRequests] = useState([]); // заявки
  const [loading, setLoading] = useState(true); // загрузка

  // Получаем заявки с user_roles + email пользователя
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("id, role, status, created_at, user_id, users(email)") // соединяем с auth.users
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Ошибка при получении заявок:", error);
    } else {
      setRequests(data);
    }

    setLoading(false);
  };

  // Одобрить заявку
  const approve = async (id) => {
    await supabase.from("user_roles").update({ status: "approved" }).eq("id", id);
    fetchRequests(); // обновляем список
  };

  // Отклонить заявку
  const reject = async (id) => {
    await supabase.from("user_roles").update({ status: "rejected" }).eq("id", id);
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests(); // при загрузке получаем заявки
  }, []);

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <h2>  Заявки на роли</h2>
      {requests.length === 0 ? (
        <p>Нет заявок</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Email</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Роль</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Статус</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Дата</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{r.users?.email}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{r.role}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{r.status}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{new Date(r.created_at).toLocaleString()}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {r.status === "pending" && (
                    <>
                      <button onClick={() => approve(r.id)} style={{ marginRight: "10px", color: "green" }}>✅</button>
                      <button onClick={() => reject(r.id)} style={{ color: "red" }}>❌</button>
                    </>
                  )}
                  {r.status !== "pending" && <span>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RoleRequestsTable;
