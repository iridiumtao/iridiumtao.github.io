import React, { useState } from "react";
import Link from 'next/link';
import Image from 'next/image';

const ProjectCard = ({ img, name, subtitle, description }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div
            className="overflow-hidden rounded-lg p-2 laptop:p-4 first:ml-0"
        >
            <Link href={`/blog/${name}`} className="block">
                <div
                    className={`relative overflow-hidden transition-all cursor-pointer ease-out duration-300 hover:scale-95 flex items-center justify-center aspect-[16/9] ${
                        !imageLoaded ? ('dark:bg-black bg-gray-100') : ''
                    }`}
                >
                    <Image
                        alt={name}
                        className="object-cover rounded-lg"
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
                <h2 className="text-lg italic text-text-tertiary-light dark:text-text-tertiary-dark mt-1 font-medium">
                {subtitle}
                </h2>)}
            <h2 className="text-xl opacity-50">
                {description ? description : "Description"}
            </h2>
        </div>
    );
};

export default ProjectCard;