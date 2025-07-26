// pages/phone-login.js
import dynamic from "next/dynamic";

const PhoneLogin = dynamic(() => import("../components/phoneLogin"), { ssr: false });

export default function PhoneLoginPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Вход по номеру телефона</h1>
      <PhoneLogin />
    </div>
  );
}
