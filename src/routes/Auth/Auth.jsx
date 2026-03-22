import { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";

import FileInput from "../../ui/controls/FileInput";
import DataTable from "../../ui/controls/DataTable";
import ErrorMessage from "../../ui/controls/ErrorMessage";
import LoadingIndicator from "../../ui/controls/LoadingIndicator";
import BlockSettingsForm from "./settingsForm/BlockSettingsForm";

import useSocket from "../../hooks/useSocket";
import { parseJsonResponse } from "../../utils/fetchJson";

const Auth = ({ setConsoleLogs = () => {} }) => {
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitLoading, setIsInitLoading] = useState(true);

  const [settingsForm, setSettingsForm] = useState(null);

  // 🔥 Состояние процесса обработки
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStats, setProcessStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    processed: 0,
  });

  const { isConnected, on, emit } = useSocket(import.meta.env.VITE_MAIN_SERVER);
  const settingsFormRef = useRef(settingsForm);

  // Обновление рефа
  useEffect(() => {
    settingsFormRef.current = settingsForm;
  }, [settingsForm]);

  // 🔥 Функция загрузки сохранённых логов с сервера
  const loadSavedLogs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_MAIN_SERVER}/logs`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await parseJsonResponse(response);
        const { logs } = data || {};
        if (logs?.length > 0) {
          console.log(`📥 Загружено ${logs.length} сохранённых логов`);
          // 🔥 Заменяем текущие логи на загруженные (или объединяем)
          setConsoleLogs(logs);
        }
      }
    } catch (err) {
      console.warn("⚠️ Не удалось загрузить логи:", err);
    }
  };

  // 🔥 Загрузка логов при монтировании компонента
  useEffect(() => {
    loadSavedLogs();
  }, []);

  // 🔥 Синхронизация сокетов
  useEffect(() => {
    if (!isConnected) return;

    console.log("📡 Подписка на события процесса...");

    const unsubscribeLog = on("process-log", (logData) => {
      setConsoleLogs((prev) => {
        const newLogs = [...prev, logData];
        return newLogs.length > 100 ? newLogs.slice(-100) : newLogs;
      });
    });

    const unsubscribeProgress = on("process-progress", (data) => {
      setProcessStats({
        total: data.total,
        success: data.success,
        failed: data.failed,
        processed: data.processed,
      });
    });

    // 🔥 События управления процессом
    const unsubscribeStarted = on("process-started", (data) => {
      console.log("🚀 Процесс запущен:", data);
      setIsProcessing(true);
      setConsoleLogs((prev) => [
        ...prev,
        {
          level: "info",
          message: `🚀 Запущена обработка: ${data.filename}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    const unsubscribeStopped = on("process-stopped", (data) => {
      console.log("🛑 Процесс остановлен:", data);
      setIsProcessing(false);
      setConsoleLogs((prev) => [
        ...prev,
        {
          level: data.reason === "completed" ? "success" : "warn",
          message:
            data.reason === "completed"
              ? `✅ Обработка завершена: ${data.stats?.success} успешно, ${data.stats?.failed} ошибок`
              : `⚠️ Процесс остановлен: ${data.reason}${
                  data.error ? ` | ${data.error}` : ""
                }`,
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    // 🔥 Синхронизация настроек
    const unsubscribeSettings = on("settings-sync", (data) => {
      if (data?.settingsForm) {
        setSettingsForm(data.settingsForm);
      }
    });

    return () => {
      unsubscribeLog();
      unsubscribeProgress();
      unsubscribeStarted();
      unsubscribeStopped();
      unsubscribeSettings();
    };
  }, [isConnected, on]);

  const fetchParseStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_MAIN_SERVER}/parse-stream/status`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await parseJsonResponse(response);
        setIsProcessing(Boolean(data.isProcessing));
        if (data.stats) setProcessStats(data.stats);
        return data;
      }
    } catch (err) {
      console.warn("⚠️ Не удалось проверить статус процесса:", err);
    }
    return null;
  };

  // 🔥 Статус при загрузке (прогресс-бар и isProcessing после F5)
  useEffect(() => {
    fetchParseStatus().then((data) => {
      if (data) console.log("📊 Статус процесса:", data);
    });
  }, []);

  // 🔥 Пока идёт обработка — подтягиваем прогресс с сервера (новый сокет / другая вкладка)
  useEffect(() => {
    if (!isProcessing) return;
    const id = setInterval(() => {
      fetchParseStatus();
    }, 2000);
    return () => clearInterval(id);
  }, [isProcessing]);

  // 🔥 Загрузка файла и настроек при инициализации
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const [infoRes, settingsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_MAIN_SERVER}/?info=1`, {
            credentials: "include",
          }),
          fetch(`${import.meta.env.VITE_MAIN_SERVER}/settings`, {
            credentials: "include",
          }),
        ]);

        if (settingsRes.ok) {
          const { settings } = (await parseJsonResponse(settingsRes)) || {};
          if (settings) {
            setSettingsForm(settings);
            setConsoleLogs((prev) => [
              ...prev,
              {
                level: "info",
                message: `✅ Настройки: ${JSON.stringify(settings)}`,
                timestamp: new Date().toISOString(),
              },
            ]);
          }
        }

        if (infoRes.ok) {
          const infoData = await parseJsonResponse(infoRes);
          if (infoData?.file) {
            setIsLoading(true);
            const fileRes = await fetch(
              `${import.meta.env.VITE_MAIN_SERVER}/?download=1`,
              { credentials: "include" }
            );
            if (fileRes.ok) {
              const blob = await fileRes.blob();
              const restoredFile = new File(
                [blob],
                infoData.file.name || "file.xlsx",
                {
                  type:
                    infoData.file.type ||
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                }
              );
              const jsonData = await parseFile(restoredFile);
              setFile(restoredFile);
              setTableData(jsonData);
              setConsoleLogs((prev) => [
                ...prev,
                {
                  level: "info",
                  message: "✅ Файл загружен",
                  timestamp: new Date().toISOString(),
                },
              ]);
            }
          }
        }
      } catch (err) {
        console.warn("⚠️ Ошибка загрузки:", err);
      } finally {
        setIsLoading(false);
        setIsInitLoading(false);
      }
    };
    loadSavedData();
  }, []);

  const parseFile = async (fileObj) => {
    const data = await fileObj.arrayBuffer();
    const workbook = XLSX.read(data, {
      type: "array",
      sheetRows: 26,
      cellNF: false,
      cellDates: false,
      cellText: true,
    });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(worksheet, { defval: "" });
  };

  const handleFileChange = async (newFile) => {
    if (!newFile) {
      setFile(null);
      setTableData([]);
      setError(null);
      return;
    }
    setFile(newFile);
    setIsLoading(true);
    setError(null);
    await handleSubmit(newFile);
    try {
      setTableData(await parseFile(newFile));
    } catch (err) {
      console.error("Ошибка чтения:", err);
      setError("Не удалось прочитать файл");
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_MAIN_SERVER}/upload`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await parseJsonResponse(res);
      if (!res.ok) throw new Error(result?.error || "Ошибка удаления");
      setFile(null);
      setTableData([]);
      setError(null);
      setConsoleLogs((prev) => [
        ...prev,
        {
          level: "info",
          message: "🗑️ Файл удалён",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err.message || "Не удалось удалить");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (newFile) => {
    const fileToSend = newFile || file;
    if (!fileToSend) return;
    try {
      const formData = new FormData();
      formData.append("file", fileToSend, fileToSend.name);
      const res = await fetch(`${import.meta.env.VITE_MAIN_SERVER}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const result = await parseJsonResponse(res);
      if (!res.ok) throw new Error(result?.error || "Ошибка загрузки");
      setConsoleLogs((prev) => [
        ...prev,
        {
          level: "info",
          message: "✅ Файл загружен",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Ошибка отправки:", err);
      if (!newFile) setError("Не удалось отправить");
    }
  };

  // 🔥 Запуск обработки
  const handleStartProcessing = async () => {
    if (isProcessing) return;

    try {
      // Сначала сохраняем настройки
      if (settingsForm) {
        await fetch(`${import.meta.env.VITE_MAIN_SERVER}/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settingsForm),
          credentials: "include",
        });
      }

      // 🔥 Запускаем процесс
      const response = await fetch(
        `${import.meta.env.VITE_MAIN_SERVER}/parse-stream`,
        {
          credentials: "include",
        }
      );

      if (response.status === 409) {
        setIsProcessing(true);
        await fetchParseStatus();
        return;
      }

      if (response.status === 202 || response.ok) {
        setIsProcessing(true);
        await fetchParseStatus();
        return;
      }

      const err = await parseJsonResponse(response);
      throw new Error(err?.error || "Ошибка запуска");
    } catch (err) {
      console.error("Ошибка запуска:", err);
      setError(err.message || "Не удалось запустить обработку");
      setConsoleLogs((prev) => [
        ...prev,
        {
          level: "error",
          message: `Ошибка запуска: ${err.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  // 🔥 Остановка обработки
  const handleStopProcessing = async () => {
    if (!isProcessing) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_MAIN_SERVER}/parse-stream/stop`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const err = await parseJsonResponse(response);
        throw new Error(err?.error || "Ошибка остановки");
      }

      setConsoleLogs((prev) => [
        ...prev,
        {
          level: "info",
          message: "🛑 Остановка процесса...",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Ошибка остановки:", err);
      setConsoleLogs((prev) => [
        ...prev,
        {
          level: "error",
          message: `❌ Не удалось остановить: ${err.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  if (isInitLoading) {
    return (
      <div className="p-[24px]">
        <LoadingIndicator text="Загрузка..." />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[24px] font-bold text-[#f6f6f8]">Загрузка данных</h2>
      <FileInput
        value={file}
        onChange={handleFileChange}
        label="Выберите файл Excel (.xlsx)"
      />
      {isLoading && <LoadingIndicator text="Обработка файла..." />}
      {error && <ErrorMessage text={error} />}
      {!isLoading && !error && tableData.length > 0 && (
        <DataTable data={tableData} onClear={handleDelete} />
      )}
      {file && (
        <p className="text-[12px] text-placeholder text-center">
          Выбран: {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </p>
      )}

      <h2 className="text-[24px] font-bold text-[#f6f6f8] mt-[24px]">
        Настройки и запуск
      </h2>

      <BlockSettingsForm
        settingsForm={settingsForm}
        setSettingsForm={setSettingsForm}
        setConsoleLogs={setConsoleLogs}
        isProcessing={isProcessing}
        onStart={handleStartProcessing}
        onStop={handleStopProcessing}
        stats={processStats}
      />
    </>
  );
};

export default Auth;
