import { useEffect, useState } from "react";

import useSocket from "../../hooks/useSocket";
import Auth from "./Auth";
import ScrollContainer from "../../ui/controls/ScrollContainer";
import ConsoleOutput from "../../ui/controls/ConsoleOutput";

const SignIn = () => {
  const [consoleLogs, setConsoleLogs] = useState([]);
  const { isConnected, on } = useSocket(import.meta.env.VITE_MAIN_SERVER, {
    maxReconnectAttempts: 3,
  });

  const handleClearLogs = async () => {
    // 🔥 Очищаем на фронтенде
    setConsoleLogs([]);

    // 🔥 Очищаем на бэкенде
    try {
      await fetch(`${import.meta.env.VITE_MAIN_SERVER}/logs`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      console.warn("⚠️ Не удалось очистить логи на сервере:", err);
    }
  };

  useEffect(() => {
    if (!isConnected) return;

    console.log("📡 Подписка на события сокетов...");

    const unsubscribeLog = on("process-log", (logData) => {
      setConsoleLogs((prev) => {
        const newLogs = [...prev, logData];
        return newLogs.length > 100 ? newLogs.slice(-100) : newLogs;
      });
    });

    // 🔥 Очистка подписок при размонтировании ИЛИ при изменении isConnected
    return () => {
      console.log("🧹 Очистка подписок на сокеты");
      unsubscribeLog();
    };
  }, [isConnected, on]);

  return (
    <ScrollContainer padding={24} styles="gap-[24px]">
      <Auth consoleLogs={consoleLogs} setConsoleLogs={setConsoleLogs} />

      <ConsoleOutput logs={consoleLogs} onClear={handleClearLogs} />
    </ScrollContainer>
  );
};

export default SignIn;
