// pages/admin/profiles/index.jsx

import withAdminAuth from "@/components/withAdminAuth"; // 🔐 Проверка на админа
import AdminLayout from "@/components/adminLayout"; // 🧱 Общий Layout для админки
import RoleProfilesTable from "@/components/roleProfilesTable"; // 📊 Компонент таблицы профилей

function AdminProfilesPage() {
  return (
    <AdminLayout>
      {/* Заголовок страницы */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Профили ролей</h1>
        <p className="text-sm text-gray-500">Управление заявками от Shipper и Carrier</p>
      </div>

      {/* Таблица ролей */}
      <RoleProfilesTable />
    </AdminLayout>
  );
}

// ⛔ Оборачиваем защитой (только для админов)
export default withAdminAuth(AdminProfilesPage);
