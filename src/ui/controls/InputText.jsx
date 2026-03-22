const InputText = ({
  value = "",
  onChange = () => {},
  placeholder = "",
  type = "text",
  min = 1, // 🔥 Минимальное значение (по умолчанию 1 для чисел)
}) => {
  // 🔥 Обработчик для строго числового ввода (только цифры 0-9)
  const handleNumberInput = (e) => {
    let val = e.target.value;

    // 🔥 Жёсткая очистка: оставляем ТОЛЬКО цифры 0-9
    // Удаляем: -, +, ., ,, e, пробелы, буквы и любые другие символы
    val = val.replace(/[^0-9]/g, "");

    // Если есть min и значение не пустое — проверяем нижнюю границу
    if (min !== undefined && val !== "") {
      const num = parseInt(val, 10);
      if (num < min) {
        val = String(min);
      }
    }

    onChange(val);
  };

  // 🔥 Обработчик потери фокуса (гарантирует валидность финального значения)
  const handleNumberBlur = (e) => {
    let val = e.target.value;

    if (val === "") {
      // Если поле пустое — ставим минимальное значение (если задано)
      if (min !== undefined) {
        onChange(String(min));
      }
    } else {
      const num = parseInt(val, 10);
      // Если значение меньше минимума — исправляем
      if (min !== undefined && num < min) {
        onChange(String(min));
      }
    }
  };

  // 🔥 Блокировка специальных клавиш на уровне нажатия (дополнительная защита)
  const handleNumberKeyDown = (e) => {
    // Запрещаем ввод: -, +, ., ,, e, E
    const blockedKeys = ["-", "+", ".", ",", "e", "E", "ArrowUp", "ArrowDown"];
    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      return false;
    }
  };

  return (
    <div
      className="
        relative bg-bg w-full
        leading-[16px] rounded-[12px]
        shadow-[inset_0_0_0_1px_var(--color-border)]
        group
        hover:shadow-[inset_0_0_0_1px_var(--color-accent)]
        focus-within:shadow-[inset_0_0_0_2px_var(--color-accent)]
        hover:focus-within:shadow-[inset_0_0_0_2px_var(--color-accent)]
        transition-shadow duration-300 
      "
    >
      <p
        className={`
          absolute text-placeholder bg-bg w-fit text-[16px] select-none
          left-[16px] right-[18px] truncate pointer-events-none
          origin-left 
          transition-all duration-300 ease-in-out
          ${
            value?.toString().length
              ? "scale-[0.75] translate-y-[-7px] px-[4px] translate-x-[-4px]"
              : "scale-100 translate-y-[18px]"
          }
          group-focus-within:text-accent
            group-focus-within:scale-[0.75] 
            group-focus-within:translate-y-[-7px]
            group-focus-within:translate-x-[-4px]
            group-focus-within:px-[4px]
          group-hover:text-accent  
        `}
      >
        {placeholder}
      </p>
      <input
        className="w-full bg-transparent p-[16px] text-[16px] outline-none text-[#f6f6f8] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        // 🔥 Используем text + inputMode для цифровой клавиатуры, но без лишней логики браузера
        type={type === "number" ? "text" : type}
        value={value}
        onChange={(e) => {
          if (type === "number") {
            handleNumberInput(e);
          } else {
            onChange(e.target.value);
          }
        }}
        onBlur={(e) => {
          if (type === "number") {
            handleNumberBlur(e);
          }
        }}
        onKeyDown={(e) => {
          if (type === "number") {
            handleNumberKeyDown(e);
          }
        }}
        // 🔥 Атрибуты для мобильных и валидации
        {...(type === "number" && {
          inputMode: "numeric", // Цифровая клавиатура на мобильных
          pattern: "[0-9]*", // Паттерн только для цифр
          autoComplete: "off",
        })}
      />
    </div>
  );
};

export default InputText;
