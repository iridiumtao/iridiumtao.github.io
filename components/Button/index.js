import React from "react";
import data from "../../data/portfolio.json";
import Link from "next/link";

const Button = ({ children, href, onClick, classes, target = "_blank", isInternal }) => {
  const baseStyles = `text-sm tablet:text-base p-1 laptop:p-2 m-1 laptop:m-2 rounded-lg transition-all duration-300 ease-out first:ml-0 hover:scale-105 active:scale-100 ${
    data.showCursor && "cursor-none"
  } ${classes}`;

  // Internal links
  if (isInternal && href) {
    return (
      <Link href={href} className={baseStyles}>
        {children}
      </Link>
    );
  }

  // external links
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : ""}
        className={`${baseStyles}`}
      >
        {children}
      </a>
    );
  }

  // default buttons
  return (
    <button
      onClick={onClick}
      type="button"
      className={`${baseStyles}`}
    >
      {children}
    </button>
  );
};

export default Button;
