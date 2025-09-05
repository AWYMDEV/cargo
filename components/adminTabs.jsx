// components/AdminTabs.jsx
import RoleRequestsTable from "./roleRequestsTable"; // таблица заявок на роли
import RoleProfilesTable from "./roleProfilesTable"; // НОВАЯ таблица профилей
import { useState } from "react"; // хук состояния

const AdminTabs = () => {
  // Список вкладок
  const tabs = [
    { key: "roles", label: "Пользователи" },
    { key: "profiles", label: "Профили" },
    { key: "trucks", label: "Машины" },
    { key: "shipments", label: "Грузы" },
  ];

  // Активная вкладка
  const [activeTab, setActiveTab] = useState("roles");

  // Что рендерить внутри
  const renderTabContent = () => {
    switch (activeTab) {
      case "roles":
        return <RoleRequestsTable />;
      case "profiles":
        return <RoleProfilesTable />; // заменили заглушку на компонент
      case "trucks":
        return <p>Машины</p>; // заглушка, позже сделаем таблицу
      case "shipments":
        return <p>Грузы</p>; // заглушка, позже сделаем таблицу
      default:
        return null;
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {/* Кнопки вкладок */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              backgroundColor: activeTab === tab.key ? "#006BFF" : "#f0f0f0",
              color: activeTab === tab.key ? "white" : "black",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Содержимое вкладки */}
      <div style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "8px" }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminTabs;
