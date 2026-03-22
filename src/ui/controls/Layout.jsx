const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-dvh max-w-[800px] bg-bg mx-auto">
      {children}
    </div>
  );
};

export default Layout;
