const DataTable = ({ data, onClear }) => {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);

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
                        ? String(row[header])
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
