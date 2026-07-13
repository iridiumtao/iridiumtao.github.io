import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const ProjectCard = ({ img, name, subtitle, description }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg p-2 first:ml-0 laptop:p-4">
      <Link href={`/blog/${name}`} className="block">
        <div
          className={`relative flex aspect-[16/9] cursor-pointer items-center justify-center overflow-hidden transition-all duration-300 ease-out hover:scale-95 ${
            !imageLoaded ? "bg-gray-100 dark:bg-black" : ""
          }`}
        >
          <Image
            alt={name}
            className="rounded-lg object-cover"
            src={img}
            onLoad={() => setImageLoaded(true)}
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <h1 className="mt-5 text-3xl font-medium">
        {name ? name : "Project Name"}
      </h1>
      {subtitle && (
        <h2 className="mt-1 text-lg font-medium italic text-text-tertiary-light dark:text-text-tertiary-dark">
          {subtitle}
        </h2>
      )}
      <h2 className="text-xl opacity-50">
        {description ? description : "Description"}
      </h2>
    </div>
  );
};

export default ProjectCard;
