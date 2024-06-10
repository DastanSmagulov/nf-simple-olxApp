"use client";

import React from "react";

interface HeaderProps {
  onAddClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddClick }) => {
  return (
    <div className="navbar bg-[#112d38]">
      <div className="navbar-start">
        <a className="btn btn-ghost text-xl">OLX</a>
      </div>
      <div className="navbar-end">
        <button
          className="btn bg-white text-black hover:text-white"
          onClick={() => onAddClick()}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default Header;
