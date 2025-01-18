import React, { useState, useEffect, useRef } from "react";
import {useRouter} from "next/router";

const WorkCard = ({ img, name, description, rowHeight, onImageLoad }) => {
    const router = useRouter();
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
            <div
                className={`overflow-hidden transition-all cursor-pointer ease-out duration-300 hover:scale-95 h-48 mob:h-auto flex items-center justify-center ${
                    !imageLoaded ? 'bg-gray-100' : ''
                }`}
                style={{
                    height: imageLoaded ? rowHeight : 'auto',
                    minHeight: '200px'
                }}
                onClick={() => router.push(`/blog/${name}`)}
            >
                <img
                    ref={imgRef}
                    alt={name}
                    className="object-cover rounded-lg"
                    src={img}
                    onLoad={handleImageLoad}
                ></img>
            </div>
            <h1 className="mt-5 text-3xl font-medium">
                {name ? name : "Project Name"}
            </h1>
            <h2 className="text-xl opacity-50">
                {description ? description : "Description"}
            </h2>
        </div>
    );
};

export default WorkCard;