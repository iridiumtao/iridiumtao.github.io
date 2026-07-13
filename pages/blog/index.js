import Image from "next/image";
import Head from "next/head";
import Router, { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { stagger } from "../../animations";
import Button from "../../components/Button";
import Header from "../../components/Header";
import data from "../../data/portfolio.json";
import { ISOToDate, useIsomorphicLayoutEffect } from "../../utils";
import { getAllPosts } from "../../utils/api";
import { useTheme } from "next-themes";
import Footer from "../../components/Footer";

const Blog = ({ posts }) => {
  const theme = useTheme();
  const showBlog = useRef(data.showBlog);
  const text = useRef();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useIsomorphicLayoutEffect(() => {
    stagger(
      [text.current],
      { y: 40, x: -10, transform: "scale(0.95) skew(10deg)" },
      { y: 0, x: 0, transform: "scale(1)" },
    );
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const createBlog = () => {
    if (process.env.NODE_ENV === "development") {
      fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(() => {
        router.reload(window.location.pathname);
      });
    } else {
      alert("This thing only works in development mode.");
    }
  };

  const deleteBlog = (slug) => {
    if (process.env.NODE_ENV === "development") {
      fetch("/api/blog", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
        }),
      }).then(() => {
        router.reload(window.location.pathname);
      });
    } else {
      alert("This thing only works in development mode.");
    }
  };
  return (
    showBlog.current && (
      <div className="relative">
        <Head>
          <title>Blog</title>
        </Head>

        <div
          className={`${theme === "dark" ? "gradient-circle-dark" : "gradient-circle"}`}
        ></div>
        <div
          className={`${theme === "dark" ? "gradient-circle-bottom-dark" : "gradient-circle-bottom"}`}
        ></div>

        <div className={`container mx-auto mb-10`}>
          <Header></Header>
          <div className="mt-10">
            <h1
              ref={text}
              className="text-bold mx-auto w-full text-6xl mob:p-2 laptop:text-8xl"
            >
              Blog.
            </h1>
            <div className="mt-10 grid grid-cols-1 justify-between gap-10 mob:grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3">
              {posts &&
                posts.map((post) => (
                  <div
                    className="relative cursor-pointer"
                    key={post.slug}
                    onClick={() => Router.push(`/blog/${post.slug}`)}
                  >
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        alt={post.title}
                        src={post.image}
                        fill={true}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="rounded-lg object-cover shadow-lg"
                      />
                    </div>
                    <h2 className="mt-5 text-4xl">{post.title}</h2>
                    <p className="mt-2 text-lg opacity-50">{post.preview}</p>
                    <span className="mt-5 text-sm opacity-25">
                      {ISOToDate(post.date)}
                    </span>
                    {process.env.NODE_ENV === "development" && mounted && (
                      <div className="absolute right-0 top-0">
                        <Button
                          onClick={(e) => {
                            deleteBlog(post.slug);
                            e.stopPropagation();
                          }}
                          type={"primary"}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
        {process.env.NODE_ENV === "development" && mounted && (
          <div className="fixed bottom-6 right-6">
            <Button onClick={createBlog} type={"primary"}>
              Add New Post +{" "}
            </Button>
          </div>
        )}
        <Footer />
      </div>
    )
  );
};

export async function getStaticProps() {
  const posts = getAllPosts([
    "slug",
    "title",
    "image",
    "preview",
    "author",
    "date",
  ]);

  return {
    props: {
      posts: [...posts],
    },
  };
}

export default Blog;
