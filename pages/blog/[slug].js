import React, { useRef, useState } from "react";
import Image from "next/image";
import { getPostBySlug, getAllPosts } from "../../utils/api";
import Header from "../../components/Header";
import ContentSection from "../../components/ContentSection";
import Footer from "../../components/Footer";
import Head from "next/head";
import { useIsomorphicLayoutEffect } from "../../utils";
import { stagger } from "../../animations";
import Button from "../../components/Button";
import BlogEditor from "../../components/BlogEditor";
import { useRouter } from "next/router";
import data from "../../data/portfolio.json";
import { useTheme } from "next-themes";

const BlogPost = ({ post }) => {
  const theme = useTheme();
  const [showEditor, setShowEditor] = useState(false);
  const textOne = useRef();
  const textTwo = useRef();
  const router = useRouter();

  useIsomorphicLayoutEffect(() => {
    stagger([textOne.current, textTwo.current], { y: 30 }, { y: 0 });
  }, []);

  return (
    <div className="relative">
      <Head>
        <title>{"Blog - " + post.title}</title>
        <meta name="description" content={post.preview} />
      </Head>

      <div
        className={`${theme === "dark" ? "gradient-circle-dark" : "gradient-circle"}`}
      ></div>
      <div
        className={`${theme === "dark" ? "gradient-circle-bottom-dark" : "gradient-circle-bottom"}`}
      ></div>

      <div className={`container mx-auto mt-10`}>
        <Header isBlog={true} />
        <div className="mt-10 flex flex-col">
          <div className="relative aspect-[16/9] w-full">
            <Image
              alt={post.title}
              src={post.image}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-lg object-cover shadow-lg"
            />
          </div>
          <h1
            ref={textOne}
            className="text-bold mob:text-2xl laptop:text-6xl mt-10 text-4xl"
          >
            {post.title}
          </h1>
          <h2
            ref={textTwo}
            className="text-darkgray mt-2 max-w-4xl text-xl opacity-50"
          >
            {post.tagline}
          </h2>
          <div className={`link mob:flex-nowrap flex flex-wrap`}>
            {Array.isArray(post.links) &&
              post.links.length > 0 &&
              post.links.map((link, index) => (
                <Button key={index} onClick={() => window.open(link.url)}>
                  {`${link.name} Link 🔗`}
                </Button>
              ))}
          </div>
        </div>

        <ContentSection content={post.content}></ContentSection>
        <div className={`link mob:flex-nowrap flex flex-wrap`}>
          {Array.isArray(post.links) &&
            post.links.length > 0 &&
            post.links.map((link, index) => (
              <Button key={index} onClick={() => window.open(link.url)}>
                {`${link.name} Link 🔗`}
              </Button>
            ))}
        </div>
        <Footer />
      </div>
      {process.env.NODE_ENV === "development" && (
        <div className="fixed right-6 bottom-6">
          <Button onClick={() => setShowEditor(true)} type={"primary"}>
            Edit this blog
          </Button>
        </div>
      )}

      {showEditor && (
        <BlogEditor
          post={post}
          close={() => setShowEditor(false)}
          refresh={() => router.reload(window.location.pathname)}
        />
      )}
    </div>
  );
};

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug, [
    "date",
    "slug",
    "preview",
    "title",
    "tagline",
    "preview",
    "image",
    "links",
    "content",
  ]);

  return {
    props: {
      post: {
        ...post,
      },
    },
  };
}

export async function getStaticPaths() {
  // Get all posts but only request the slug field
  const posts = getAllPosts(["slug"]);

  // Map the posts to the required format for paths
  const paths = posts.map((post) => ({
    params: {
      slug: post.slug,
    },
  }));

  return {
    paths,
    fallback: false,
  };
}

export default BlogPost;
