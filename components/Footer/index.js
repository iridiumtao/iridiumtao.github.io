import React from "react";
import Socials from "../Socials";

const Footer = () => {
  return (
    <>
      <div className="mt-5 p-2 laptop:mt-40 laptop:p-0">
        <h1 className="text-bold text-2xl">Contact</h1>
        <div className="mt-5">
          <Socials />
        </div>
      </div>
      <h1 className="text-bold mt-2 p-2 text-sm laptop:mt-10 laptop:p-0">
        Made With ❤ by{" "}
        <a className="underline underline-offset-1">Chun-Ju (Iridium) Tao</a>
      </h1>
    </>
  );
};

export default Footer;
