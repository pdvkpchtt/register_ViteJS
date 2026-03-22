import { useRef, useState, useEffect } from "react";

const ScrollContainer = ({ children, padding = 8, styles = "" }) => {
  const containerRef = useRef(null);
  const [showShadow, setShowShadow] = useState(false);

  const checkScrollStatus = () => {
    const el = containerRef.current;
    if (!el) return;

    const isScrollable = el.scrollHeight > el.clientHeight;

    const isScrolledDown = el.scrollTop > 0;

    setShowShadow(isScrollable && isScrolledDown);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScrollStatus();

    el.addEventListener("scroll", checkScrollStatus);
    window.addEventListener("resize", checkScrollStatus);

    return () => {
      el.removeEventListener("scroll", checkScrollStatus);
      window.removeEventListener("resize", checkScrollStatus);
    };
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex flex-col overflow-y-auto hideScrollbar relative ${styles}`}
      style={{ padding }}
    >
      <div
        className={`
          shadow-[inset_0_26px_24px_-2px_var(--color-shadow)] 
          fixed pointer-events-none translate-x-[-24px] translate-y-[-24px] 
          w-[800px] h-40 z-10
          transition-opacity duration-300 ease-in-out
          ${showShadow ? "opacity-100" : "opacity-0"}
        `}
      />

      {children}
    </div>
  );
};

export default ScrollContainer;
