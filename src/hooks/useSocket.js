import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";

export const useSocket = (url, options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = options.maxReconnectAttempts || 3;

  const connect = useCallback(() => {
    // 🔥 Если уже есть подключенный сокет — не создаём новый
    if (socketRef.current?.connected) {
      console.log("✅ Сокет уже подключён, пропускаем");
      return;
    }

    // 🔥 Если сокет есть, но не подключён — просто ждём, не создаём дубль
    if (socketRef.current) {
      console.log("⏳ Сокет существует, ждём подключения...");
      return;
    }

    console.log("🔌 Создание нового WebSocket соединения:", url);

    // 🔥 Отключаем встроенный реконнект — управляем вручную
    socketRef.current = io(url, {
      transports: ["websocket", "polling"],
      reconnection: false, // 🔥 ВАЖНО: отключаем авто-реконнект
      timeout: 5000,
      ...options,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ WebSocket подключён");
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("❌ Ошибка подключения:", err.message);
      setError(err.message);
      setIsConnected(false);

      // 🔥 Пробуем переподключиться вручную с задержкой
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        console.log(
          `🔄 Попытка переподключения ${reconnectAttempts.current}/${maxReconnectAttempts}...`
        );
        setTimeout(() => {
          if (!socketRef.current?.connected) {
            socketRef.current?.connect();
          }
        }, 2000 * reconnectAttempts.current); // Экспоненциальная задержка
      } else {
        setError("Превышено количество попыток подключения");
      }
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log(`🔌 Отключено: ${reason}`);
      setIsConnected(false);

      // 🔥 НЕ пытаемся переподключиться здесь — это делает connect_error
      // Иначе будет двойной реконнект
    });

    socketRef.current.on("error", (err) => {
      console.error("💥 Socket error:", err);
      setError(err.message || "Неизвестная ошибка");
    });
  }, [url, options, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("🔌 Ручное отключение сокета");
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      return true;
    }
    console.warn("⚠️ Нельзя отправить: сокет не подключён");
    return false;
  }, []);

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => {
        socketRef.current?.off(event, callback);
      };
    }
    return () => {};
  }, []);

  // 🔥 Подключаемся только один раз при монтировании
  useEffect(() => {
    connect();

    return () => {
      // 🔥 НЕ отключаем сокет при размонтировании компонента,
      // если он используется в других местах приложения
      // Если сокет должен жить только в этом компоненте — раскомментируйте:
      // disconnect();
    };
  }, [connect]); // 🔥 Убрали disconnect из зависимостей

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    emit,
    on,
    socket: socketRef.current,
  };
};

export default useSocket;
