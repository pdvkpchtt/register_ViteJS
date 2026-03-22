import { useState } from "react";
import InputText from "../../../ui/controls/InputText";
import Button from "../../../ui/controls/Button";

const BlockSettingsForm = ({
  settingsForm = {},
  setSettingsForm = () => {},
  setConsoleLogs = () => {},
  isProcessing = false,
  onStart = () => {},
  onStop = () => {},
  stats = { total: 0, success: 0, failed: 0, processed: 0 },
}) => {
  const [loading, setLoading] = useState(false);

  const saveSettings = async () => {
    if (!settingsForm?.duration) {
      setConsoleLogs((prev) => [
        ...prev,
        {
          level: "warn",
          message: "⚠️ Укажите длительность паузы",
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_MAIN_SERVER}/settings`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settingsForm),
          credentials: "include",
        }
      );
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Ошибка сохранения");

      setConsoleLogs((prev) => [
        ...prev,
        {
          level: "info",
          message: `✅ Настройки: ${JSON.stringify(settingsForm)}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Ошибка:", err);
      setConsoleLogs((prev) => [
        ...prev,
        {
          level: "error",
          message: `❌ ${err.message}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    await saveSettings(); // Сохраняем перед запуском
    onStart();
  };

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex [@media(pointer:coarse)]:flex-col flex-row gap-[12px]">
        <InputText
          type="number"
          min={1}
          placeholder="Пауза после регистрации (мин)"
          value={settingsForm?.duration || ""}
          onChange={(duration) =>
            setSettingsForm({ ...settingsForm, duration })
          }
          disabled={isProcessing || loading}
        />
      </div>

      {/* 🔥 Прогресс-бар */}
      {isProcessing && stats.total > 0 && (
        <div className="w-full space-y-[4px]">
          <div className="flex justify-between text-[11px] text-placeholder">
            <span>
              Обработано: {stats.processed}/{stats.total}
            </span>
            <span>
              ✅ {stats.success} ❌ {stats.failed}
            </span>
          </div>
          <div className="h-[4px] w-full bg-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{
                width: `${
                  stats.total > 0 ? (stats.processed / stats.total) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* 🔥 Кнопки Запустить/Стоп */}
      <div className="flex gap-[12px]">
        {!isProcessing ? (
          <Button
            text="🚀 Запустить"
            onClick={handleStart}
            disabled={loading}
            className="flex-1"
          />
        ) : (
          <Button
            text="🛑 Стоп"
            onClick={onStop}
            className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30"
          />
        )}
      </div>
    </div>
  );
};

export default BlockSettingsForm;
