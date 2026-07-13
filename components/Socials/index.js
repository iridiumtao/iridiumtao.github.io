import React from "react";
import Button from "../Button";
import data from "../../data/portfolio.json";

const Socials = ({ className }) => {
  return (
    <div className={`${className} link flex flex-wrap mob:flex-nowrap`}>
      {data.socials.map((social) => (
        <Button
          key={social.title}
          href={social.link}
          isInternal={social.title === "Resume"}
        >
          {social.title}
        </Button>
      ))}
    </div>
  );
};

export default Socials;
