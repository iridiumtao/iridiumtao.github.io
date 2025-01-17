import React from "react";

const WorkCard = ({ img, name, description, rowHeight, onImageLoad, onClick }) => {
    return (
        <div
            className="overflow-hidden cursor-pointer rounded-lg p-2 laptop:p-4 first:ml-0"
            onClick={onClick}
        >
            <div
                className="overflow-hidden rounded-lg transition-all ease-out duration-300 hover:scale-95 h-48 mob:h-auto flex items-center justify-center"
                style={{ height: rowHeight }}
            >
                <img
                    alt={name}
                    className="object-cover"
                    src={img}
                    onLoad={(e) => onImageLoad(e.target.height)}
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
