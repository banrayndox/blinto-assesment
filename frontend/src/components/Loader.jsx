import React from "react";

const Loader = ({ message = "Loading data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-red-950 border-t-red-600 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-2 border-red-900/40 border-b-red-500 animate-spin animate-reverse"></div>
      </div>
      <p className="mt-4 text-xs font-mono text-gray-400 tracking-wider uppercase">
        {message}
      </p>
    </div>
  );
};

export default Loader;
