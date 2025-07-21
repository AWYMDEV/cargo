// components/AdminTabs.jsx
import RoleRequestsTable from "./roleRequestsTable";

import { useState } from "react"; // хук состояния

const AdminTabs = () => {
  // Список вкладок и их метки
  const tabs = [
    { key: "roles", label: "Роли пользователей" },
    { key: "profiles", label: "Профили" },
    { key: "trucks", label: "Машины" },
    { key: "shipments", label: "Грузы" },
  ];

  // Состояние активной вкладки
  const [activeTab, setActiveTab] = useState("roles");

  // Рендер содержимого по выбранной вкладке
  const renderTabContent = () => {
    switch (activeTab) {
      case "roles":
       
  return <RoleRequestsTable />;

      case "profiles":
        return <p> Профили ролей</p>;
      case "trucks":
        return <p>  Машины</p>;
      case "shipments":
        return <p>  Грузы</p>;
      default:
        return null;
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {/* Вкладки */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)} // смена вкладки
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              backgroundColor: activeTab === tab.key ? "#28a745" : "#f0f0f0",
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

export default AdminTabs; // экспорт компонента
