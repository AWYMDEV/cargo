// components/PhoneLogin.js
import { useState } from "react";
import { auth } from "../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function PhoneLogin() {
  const [phone, setPhone] = useState("+992123456789"); // 🔁 тестовый номер
  const [code, setCode] = useState("123456");          // 🔁 тестовый код
  const [confirmResult, setConfirmResult] = useState(null);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  };

  const sendCode = async () => {
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    try {
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmResult(confirmation);
      alert("Код отправлен (или сработал тестовый)");
    } catch (err) {
      console.error("Ошибка отправки кода:", err);
    }
  };

  const verifyCode = async () => {
    try {
      const result = await confirmResult.confirm(code);
      alert("Вход успешен, UID: " + result.user.uid);
    } catch (err) {
      console.error("Ошибка подтверждения:", err);
    }
  };

  return (
    <div>
      <div id="recaptcha-container" />
      {!confirmResult ? (
        <>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button onClick={sendCode}>Отправить код</button>
        </>
      ) : (
        <>
          <input value={code} onChange={(e) => setCode(e.target.value)} />
          <button onClick={verifyCode}>Подтвердить</button>
        </>
      )}
    </div>
  );
}
