const Button = ({
  text = "",
  onClick,
  className = "",
  disabled = false,
  type = "button",
  ...rest
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
          w-full py-[16px] rounded-[12px] bg-accent text-[#f6f6f8] font-medium text-[16px]
          hover:opacity-70 active:opacity-50 transition-opacity duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          ${disabled ? "" : "cursor-pointer"}
          ${className}
        `}
      {...rest}
    >
      {text}
    </button>
  );
};

export default Button;
