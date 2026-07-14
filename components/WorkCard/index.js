import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const WorkCard = ({ name, description }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState();

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div
      className={`mob:p-4 w-full rounded-lg p-2 transition-all duration-300 ease-out ${
        mounted && theme === "dark"
          ? "hover:bg-stone-900"
          : "hover:bg-[#E8E4DE]/30"
      } link hover:scale-105`}
    >
      <h1 className="text-3xl">{name ? name : "Heading"}</h1>
      <p className="mt-5 text-xl opacity-40">
        {description
          ? description
          : "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. "}
      </p>
    </div>
  );
};

export default WorkCard;
