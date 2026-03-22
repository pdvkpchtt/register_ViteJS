import { Routes, Route } from "react-router-dom";

import useSocket from "../hooks/useSocket"; // 🔥 Импорт хука
import SignIn from "./Auth/index";
import Button from "../ui/controls/Button";

const Navigator = () => {
  // 🔥 Используем хук сокета вместо fetch checkhealth
  const { isConnected, error, connect } = useSocket(
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

  // 🔥 Если всё ок — показываем приложение
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="*" element={<h1 className="text-[#f6f6f8]">404</h1>} />
    </Routes>
  );
};

export default Navigator;
