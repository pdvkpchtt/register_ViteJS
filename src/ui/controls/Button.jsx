const Button = ({ text = "", onClick = () => {} }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
          w-full py-[16px] rounded-[12px] bg-accent text-[#f6f6f8] font-medium text-[16px]
          hover:opacity-70 active:opacity-50 transition-opacity duration-300 cursor-pointer
        "
    >
      {text}
    </button>
  );
};

export default Button;
