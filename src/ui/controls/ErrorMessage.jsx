const ErrorMessage = ({ text = "" }) => {
  return (
    <div
      className="
          p-[16px] rounded-[12px] 
          bg-red-500/10 border border-red-500/30 
          text-red-400 text-[14px]
        "
    >
      {text}
    </div>
  );
};

export default ErrorMessage;
