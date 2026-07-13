import React, { useState } from "react";
import Button from "../../components/Button";
import DatePicker from "react-datepicker";
import TextareaAutosize from "react-textarea-autosize";
import { useTheme } from "next-themes";

import "react-datepicker/dist/react-datepicker.css";

const BlogEditor = ({ post, close, refresh }) => {
  const { theme } = useTheme();
  const [currentTabs, setCurrentTabs] = useState("BLOGDETAILS");
  const [blogContent, setBlogContent] = useState(post.content);
  const [blogVariables, setBlogVariables] = useState({
    date: post.date,
    title: post.title,
    tagline: post.tagline,
    preview: post.preview,
    image: post.image,
    links: post.links,
  });

  const savePost = async () => {
    if (process.env.NODE_ENV === "development") {
      await fetch("/api/blog/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: post.slug,
          content: blogContent,
          variables: blogVariables,
        }),
      }).then((data) => {
        if (data.status === 200) {
          close();
          refresh();
        }
      });
    } else {
      alert("This thing only works in development mode.");
    }
  };

  return (
    <div
      className={`fixed top-0 z-10 flex h-screen w-screen flex-col items-center overflow-auto ${
        theme === "dark" ? "bg-black" : "bg-white"
      }`}
    >
      <div className="container my-20">
        <div className="mt-10">
          <div className="sticky top-12 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl">{blogVariables.title}</h1>
              <div className="flex items-center">
                <Button onClick={savePost} type="primary">
                  Save
                </Button>
                <Button onClick={close}>Close</Button>
              </div>
            </div>
            <div className="flex items-center">
              <Button
                onClick={() => setCurrentTabs("BLOGDETAILS")}
                type={currentTabs === "BLOGDETAILS" && "primary"}
              >
                Blog Details
              </Button>
              <Button
                onClick={() => setCurrentTabs("CONTENT")}
                type={currentTabs === "CONTENT" && "primary"}
              >
                Content
              </Button>
            </div>
          </div>
        </div>
        {currentTabs === "BLOGDETAILS" && (
          <div className="mt-10">
            <div className="mt-5 flex flex-col items-center">
              <label className="text-sx w-full opacity-50">Date</label>
              <DatePicker
                selected={new Date(blogVariables.date)}
                className="mt-2 w-full rounded-md border-2 p-4 shadow-lg hover:border-blue-400"
                onChange={(date) => {
                  setBlogVariables({
                    ...blogVariables,
                    date: date.toISOString(),
                  });
                }}
              />
            </div>
            <div className="mt-5 flex flex-col items-center">
              <label className="text-sx w-full opacity-50">Title</label>
              <input
                value={blogVariables.title}
                onChange={(e) =>
                  setBlogVariables({ ...blogVariables, title: e.target.value })
                }
                className="mt-2 w-full rounded-md border-2 p-4 shadow-lg hover:border-blue-400"
                type="text"
              ></input>
            </div>

            <div className="mt-5 flex flex-col items-center">
              <label className="text-sx w-full opacity-50">Tagline</label>
              <input
                value={blogVariables.tagline}
                onChange={(e) =>
                  setBlogVariables({
                    ...blogVariables,
                    tagline: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-md border-2 p-4 shadow-lg hover:border-blue-400"
                type="text"
              ></input>
            </div>
            <div className="mt-5 flex flex-col items-center">
              <label className="text-sx w-full opacity-50">preview (SEO)</label>
              <textarea
                value={blogVariables.preview}
                onChange={(e) =>
                  setBlogVariables({
                    ...blogVariables,
                    preview: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-md border-2 p-4 shadow-lg hover:border-blue-400"
                type="text"
              ></textarea>
            </div>
            <div className="mt-5 flex flex-col items-center">
              <label className="text-sx w-full opacity-50">Image</label>
              <input
                value={blogVariables.image}
                onChange={(e) =>
                  setBlogVariables({
                    ...blogVariables,
                    image: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-md border-2 p-4 shadow-lg hover:border-blue-400"
                type="text"
              ></input>
            </div>
          </div>
        )}

        {currentTabs === "CONTENT" && (
          <div className="mt-10">
            <div className="flex flex-col items-center">
              <label className="text-sx w-full opacity-50">Content</label>
              <TextareaAutosize
                className="mt-5 h-auto w-full rounded-xl border p-4 shadow-xl hover:border-blue-400"
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
              ></TextareaAutosize>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditor;
