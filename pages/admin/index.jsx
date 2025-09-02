// pages/admin/index.jsx

import AdminLayout from "../../components/adminLayOut";
import AdminTabs from "../../components/adminTabs";
import withAdminAuth from "../../components/withAdminAuth"; // ⬅️ импорт защиты

function AdminHomePage() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Админ-панель</h1>
      <AdminTabs />
    </AdminLayout>
  );
}

export default withAdminAuth(AdminHomePage); // ⬅️ оборачиваем компонент
