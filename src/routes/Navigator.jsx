import { useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";

import useSocket from "../hooks/useSocket"; // 🔥 Импорт хука
import SignIn from "./Auth/index";
import Button from "../ui/controls/Button";
import InputText from "../ui/controls/InputText";

const AUTH_STORAGE_KEY = "zakaz-auth-unlocked";

const readStoredAuth = () => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const Navigator = () => {
  const [authUnlocked, setAuthUnlocked] = useState(readStoredAuth);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const expectedPassword = import.meta.env.VITE_AUTH_PASSWORD ?? "";

  const handlePasswordSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setAuthError("");

      if (!expectedPassword) {
        setAuthError("Пароль не задан в окружении (VITE_AUTH_PASSWORD)");
        return;
      }

      if (passwordInput !== expectedPassword) {
        setAuthError("Неверный пароль");
        return;
      }

      try {
        localStorage.setItem(AUTH_STORAGE_KEY, "1");
      } catch {
        // ignore
      }
      setAuthUnlocked(true);
      setPasswordInput("");
    },
    [expectedPassword, passwordInput]
  );

  // 🔥 Используем хук сокета вместо fetch checkhealth
  const { isConnected, error } = useSocket(
    import.meta.env.VITE_MAIN_SERVER,
    {
      timeout: 5000, // Таймаут подключения 5 сек
      maxReconnectAttempts: 3,
    }
  );

  // 🔥 Если соединение ещё устанавливается
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-[24px]">
        <div className="text-center space-y-[24px]">
          <h1 className="text-[24px] font-bold text-red-400">
            Сервер недоступен
          </h1>
          <p className="text-placeholder">
            {error || "Не удалось установить соединение"}
          </p>
          <Button
            text="Попробовать снова"
            onClick={() => {
              window.location.reload();
            }}
            className="px-[24px] py-[12px] rounded-[12px] bg-accent text-bg"
          />
        </div>
      </div>
    );
  }

  if (!authUnlocked) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-[24px]">
        <form
          onSubmit={handlePasswordSubmit}
          className="w-full max-w-[400px] space-y-[20px]"
        >
          <h1 className="text-[20px] font-semibold text-[#f6f6f8] text-center">
            Доступ
          </h1>
          <label className="block space-y-[8px]">
            <InputText type="password" autoComplete="current-password" value={passwordInput} onChange={(value) => setPasswordInput(value)} placeholder="Введите пароль" />
           
          </label>
          {authError ? (
            <p className="text-[14px] text-red-400 text-center">{authError}</p>
          ) : null}
          <button
            type="submit"
            className="w-full py-[16px] rounded-[12px] bg-accent text-[#f6f6f8] font-medium text-[16px] hover:opacity-70 active:opacity-50 transition-opacity duration-300 cursor-pointer"
          >
            Войти
          </button>
        </form>
      </div>
    );
  }

  // 🔥 Если всё ок — показываем приложение
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="*" element={<h1 className="text-[#f6f6f8]">404</h1>} />
    </Routes>
  );
};

export default Navigator;
