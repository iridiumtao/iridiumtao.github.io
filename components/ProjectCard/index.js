import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';


const ProjectCard = ({ img, name, subtitle, description, rowHeight, onImageLoad }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        if (imgRef.current && imgRef.current.complete) {
            handleImageLoad();
        }
    }, []);

    const handleImageLoad = () => {
        setImageLoaded(true);
        if (imgRef.current) {
            onImageLoad(imgRef.current.height);
        }
    };

    return (
        <div
            className="overflow-hidden rounded-lg p-2 laptop:p-4 first:ml-0"
        >
            <Link href={`/blog/${name}`} className="block">
                <div
                    className={`overflow-hidden transition-all cursor-pointer ease-out duration-300 hover:scale-95 h-48 mob:h-auto flex items-center justify-center ${
                        !imageLoaded ? ('dark:bg-black bg-gray-100') : ''
                    }`}
                    style={{
                        height: imageLoaded ? rowHeight : 'auto',
                        minHeight: '200px'
                    }}
                >
                    <img
                        ref={imgRef}
                        alt={name}
                        className="object-cover rounded-lg"
                        src={img}
                        onLoad={handleImageLoad}
                    ></img>
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