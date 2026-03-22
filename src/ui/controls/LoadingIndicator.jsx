const LoadingIndicator = ({ text = "" }) => {
  return (
    <div className="flex items-center gap-[12px] text-placeholder">
      <div className="w-[20px] h-[20px] border-2 border-accent border-t-transparent rounded-full animate-spin" />
      {text ? <span className="text-[14px]">{text}</span> : null}
    </div>
  );
};

export default LoadingIndicator;
