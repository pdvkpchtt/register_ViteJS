const DataTable = ({ data, onClear }) => {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);

  function parseExcelDate(value) {
    if (!value) return null;

    // Если уже строка с пробелами — возвращаем как есть
    if (typeof value === "string" && /\d+\s+\d+\s+\d+/.test(value)) {
      return value.trim();
    }

    // Если число (серийный номер даты Excel)
    if (typeof value === "number" && value > 1000 && value < 100000) {
      try {
        // Excel epoch: 30 Dec 1899, но с багом високосного 1900 года
        let days = Math.floor(value);
        let msInDay = 86400000;

        // Базовая дата + дни
        let date = new Date(Date.UTC(1899, 11, 30));
        date.setUTCDate(date.getUTCDate() + days);

        // Исправление бага: Excel считает 1900 високосным, но это не так
        // Все даты >= 60 (после 28.02.1900) нужно сдвинуть на 1 день назад
        if (value >= 60) {
          date.setUTCDate(date.getUTCDate() - 1);
        }

        // Форматируем: "28 7 2002"
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1; // 0-based
        const year = date.getUTCFullYear();

        return `${day} ${month} ${year}`;
      } catch (e) {
        console.warn(`⚠️ Не удалось распарсить дату ${value}: ${e.message}`);
        return null;
      }
    }

    // Если строка в другом формате — пробуем распарсить
    if (typeof value === "string") {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return `${date.getDate()} ${date.getMonth() + 1} ${date.getFullYear()}`;
      }
    }

    return String(value).trim();
  }

  return (
    <div className="w-full mt-[24px] animate-fade-in">
      {/* Заголовок таблицы с кнопкой очистки */}
      <div className="flex items-center justify-between mb-[16px]">
        <h3 className="text-[18px] font-semibold text-[#f6f6f8]">
          Данные из файла ({data.length} строк)
        </h3>
        <button
          onClick={onClear}
          className="
            px-[16px] py-[8px] rounded-[8px] 
            text-[14px] text-placeholder 
            border border-border
            hover:text-[#f6f6f8] hover:border-accent
            transition-all duration-300
          "
        >
          Очистить
        </button>
      </div>

      {/* Контейнер таблицы с прокруткой */}
      <div
        className="
        w-full rounded-[12px] overflow-hidden
        border-[1px] border-border
        bg-bg
      "
      >
        <div className="max-h-[300px] overflow-auto">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-bg z-10">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="
                      px-[16px] py-[12px] 
                      text-left text-[14px] font-semibold 
                      text-placeholder uppercase tracking-wide
                      border-b border-border
                      first:rounded-tl-[12px]
                      last:rounded-tr-[12px]  
                    "
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`
                    group
                    hover:bg-accent/5 
                    transition-colors duration-200
                    ${rowIndex % 2 === 0 ? "bg-bg" : "bg-bg/50"}
                  `}
                >
                  {headers.map((header, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="
                        px-[16px] py-[12px] 
                        text-[14px] text-[#f6f6f8]
                        border-b border-border/50
                        group-last:border-b-0
                        truncate max-w-[300px]
                      "
                    >
                      {row[header] !== null && row[header] !== undefined
                        ? header === "Дата рождения"
                          ? parseExcelDate(row[header] + 1)
                          : String(row[header])
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
