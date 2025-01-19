import React, { useRef, useState } from "react";
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
import Cursor from "../../components/Cursor";
import data from "../../data/portfolio.json";

const BlogPost = ({ post }) => {
  const [showEditor, setShowEditor] = useState(false);
  const textOne = useRef();
  const textTwo = useRef();
  const router = useRouter();

  useIsomorphicLayoutEffect(() => {
    stagger([textOne.current, textTwo.current], { y: 30 }, { y: 0 });
  }, []);

  return (
    <>
      <Head>
        <title>{"Blog - " + post.title}</title>
        <meta name="description" content={post.preview} />
      </Head>
      {data.showCursor && <Cursor />}

      <div
        className={`container mx-auto mt-10 ${
          data.showCursor && "cursor-none"
        }`}
      >
        <Header isBlog={true} />
        <div className="mt-10 flex flex-col">
          <img
            className="w-full rounded-lg shadow-lg object-cover"
            src={post.image}
            alt={post.title}
          ></img>
          <h1
            ref={textOne}
            className="mt-10 text-4xl mob:text-2xl laptop:text-6xl text-bold"
          >
            {post.title}
          </h1>
          <h2
            ref={textTwo}
            className="mt-2 text-xl max-w-4xl text-darkgray opacity-50"
          >
            {post.tagline}
          </h2>
          <div className={`flex flex-wrap mob:flex-nowrap link`}>
            {Array.isArray(post.links) && post.links.length > 0 &&
                post.links.map((link, index) => (
                    <Button key={index} onClick={() => window.open(link.url)}>
                      {`${link.name} Link 🔗`}
                    </Button>
                ))
            }
          </div>

        </div>

        <ContentSection content={post.content}></ContentSection>
        <div className={`flex flex-wrap mob:flex-nowrap link`}>
          {Array.isArray(post.links) && post.links.length > 0 &&
              post.links.map((link, index) => (
                  <Button key={index} onClick={() => window.open(link.url)}>
                    {`${link.name} Link 🔗`}
                  </Button>
              ))
          }
        </div>
        <Footer />
      </div>
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-6 right-6">
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
    </>
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
  const posts = getAllPosts(['slug']);

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
