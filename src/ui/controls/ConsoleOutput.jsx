import { useState, useEffect, useRef } from "react";

const LEVEL_STYLES = {
  info: "text-blue-400",
  success: "text-green-400",
  warn: "text-yellow-400",
  error: "text-red-400",
  debug: "text-gray-400",
};

const LEVEL_ICONS = {
  info: "ℹ",
  success: "✅",
  warn: "⚠️",
  error: "❌",
  debug: "🐛",
};

const ConsoleOutput = ({ logs = [], onClear }) => {
  const scrollRef = useRef(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isAutoScroll]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAutoScroll(isAtBottom);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return new Date().toLocaleTimeString();
    return new Date(timestamp).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-[536px] h-[536px] w-full rounded-[12px] overflow-hidden shadow-[0_0_0_1px_var(--color-border)] bg-[#0c0c0c]">
      <div className="flex items-center justify-end px-[12px] py-[8px] bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-[8px]">
          <button
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className={`text-[10px] px-[8px] py-[2px] rounded ${
              isAutoScroll
                ? "bg-accent/20 text-accent"
                : "bg-gray-500/20 text-gray-400"
            }`}
            title="Авто-скролл"
          >
            {isAutoScroll ? "🔗 Auto" : "🔓 Manual"}
          </button>
          <button
            onClick={onClear}
            className="text-[10px] text-gray-400 hover:text-[#f6f6f8] px-[8px] py-[2px] rounded hover:bg-gray-700"
            title="Очистить"
          >
            ✕ Clear
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-[500px] overflow-y-auto p-[12px] font-mono text-[12px] leading-[1.4] scroll-smooth"
      >
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">
            &gt; Ожидание логов...<span className="animate-pulse">_</span>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="flex gap-[8px] py-[2px] hover:bg-white/5 rounded px-[4px]"
            >
              <span className="text-gray-600 shrink-0">
                [{formatTime(log.timestamp)}]
              </span>
              <span
                className={`shrink-0 ${
                  LEVEL_STYLES[log.level] || "text-gray-300"
                }`}
              >
                {LEVEL_ICONS[log.level] || "•"}
              </span>
              <span className="text-gray-300 break-all">{log.message}</span>
              {log.user && (
                <span className="text-gray-500 shrink-0 ml-auto">
                  [{log.user}]
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsoleOutput;
