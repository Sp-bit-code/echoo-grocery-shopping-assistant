import React from "react";

import "./Overlay.css";

const Overlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] select-none mix-blend-difference">
      <div className="h-full w-full bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:100px_100px]" />
    </div>
  );
};

export default Overlay;