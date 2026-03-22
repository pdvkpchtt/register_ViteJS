import React, { useRef } from "react";

const FileInput = ({
  value = null,
  onChange = () => {},
  label = "Загрузить .xlsx",
}) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChange(file);
    }
  };

  const displayText = value ? value.name : label;

  return (
    <div
      className="
        relative bg-bg w-full cursor-pointer min-h-[56px]
        leading-[16px] rounded-[12px]
        shadow-[inset_0_0_0_1px_var(--color-border)]
        group
        hover:shadow-[inset_0_0_0_1px_var(--color-accent)]
        focus-within:shadow-[inset_0_0_0_2px_var(--color-accent)]
        hover:focus-within:shadow-[inset_0_0_0_2px_var(--color-accent)]
        transition-shadow duration-300 
        overflow-hidden
      "
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between w-full p-[16px]">
        <div className="flex items-center gap-[12px] overflow-hidden">
          <div
            className={`
            flex-shrink-0 w-[24px] h-[24px] rounded-[6px] flex items-center justify-center
            ${
              value
                ? "bg-accent/20 text-accent"
                : "bg-placeholder/10 text-placeholder"
            }
            transition-colors duration-300
          `}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M8 13h2" />
              <path d="M8 17h2" />
              <path d="M14 13h2" />
              <path d="M14 17h2" />
            </svg>
          </div>

          <p
            className={`
            text-[16px] truncate select-none transition-colors duration-300
            ${value ? "text-[#f6f6f8]" : "text-placeholder"}
            group-hover:text-accent
          `}
          >
            {displayText}
          </p>
        </div>

        <div className="flex-shrink-0 ml-[12px] text-placeholder group-hover:text-accent transition-colors duration-300">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FileInput;
