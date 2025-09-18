import React, {useState, useRef, Fragment} from "react";
import Header from "../components/Header";
import WorkCard from "../components/WorkCard";
import Socials from "../components/Socials";
import ProjectCard from "../components/ProjectCard";
import {useIsomorphicLayoutEffect} from "../utils";
import {stagger} from "../animations";
import Footer from "../components/Footer";
import Head from "next/head";
import Button from "../components/Button";
import Link from "next/link";
import dynamic from 'next/dynamic';
import {useTheme} from "next-themes";

// Local Data
import data from "../data/portfolio.json";

export default function Home() {
  // Refs
  const projectRef = useRef();
  const workRef = useRef();
  const aboutRef = useRef();
  const textOne = useRef();
  const textTwo = useRef();
  const textThree = useRef();
  const textFour = useRef();

  // state
  const [mounted, setMounted] = useState(false);
  const {theme} = useTheme();

  const sortedProjects = [...data.projects].sort((a, b) => {
    const dateA = a.endDate ? new Date(a.endDate) : null;
    const dateB = b.endDate ? new Date(b.endDate) : null;
    if (!dateA || !dateB || isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
    return dateB - dateA;
  });

  useIsomorphicLayoutEffect(() => {
    setMounted(true);

    if (mounted) {
      stagger(
        [textOne.current, textTwo.current, textThree.current, textFour.current],
        {y: 40, x: -10, transform: "scale(0.95) skew(10deg)"},
        {y: 0, x: 0, transform: "scale(1)"}
      );
    }
  }, [mounted]);

  const handleScroll = (ref) => {
    if (typeof window !== 'undefined' && ref.current) {
      const targetPosition = ref.current.offsetTop;
      window.scrollTo({
        top: targetPosition,
        left: 0,
        behavior: "smooth",
      });
    }
  };

  // If not yet mounted, return a basic loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`relative`}>
      <Head>
        <title>{data.name}</title>
      </Head>

      <div className={`${theme === "dark" ? "gradient-circle-dark" : "gradient-circle"}`}></div>
      <div className={`${theme === "dark" ? "gradient-circle-bottom-dark" : "gradient-circle-bottom"}`}></div>

      <div className="container mx-auto mb-10">
        <Header isHome
          handleProjectScroll={() => handleScroll(projectRef)}
          handleWorkScroll={() => handleScroll(workRef)}
          handleAboutScroll={() => handleScroll(aboutRef)}
        />
        <div className="laptop:mt-20 mt-10 pt-16 tablet:pt-0">
          <div className="mt-5">
            <h1
              ref={textOne}
              className="text-2xl tablet:text-4xl laptop:text-4xl laptopl:text-6xl p-1 tablet:p-2 w-full laptop:w-4/5"
            >
              {data.headerTaglineOne}
            </h1>
            <h1
              ref={textTwo}
              className="text-3xl tablet:text-6xl laptop:text-6xl laptopl:text-8xl p-1 tablet:p-2 text-bold w-full laptop:w-4/5"
            >
              {data.headerTaglineTwo}
            </h1>
            <h1
              ref={textThree}
              className="text-2xl tablet:text-4xl laptop:text-4xl laptopl:text-6xl p-1 tablet:p-2 w-full laptop:w-4/5"
            >
              {data.headerTaglineThree}
            </h1>
            <h1
              ref={textFour}
              className="text-2xl tablet:text-4xl laptop:text-4xl laptopl:text-6xl p-1 tablet:p-2 w-full laptop:w-4/5"
            >
              {data.headerTaglineFour}
            </h1>
          </div>

          <Socials className="mt-2 laptop:mt-5"/>
        </div>
        <div className="mt-10 laptop:mt-30 p-2 laptop:p-0" ref={projectRef}>
          <h1 className="text-2xl text-bold">Project Experiences</h1>
          <div className="mt-5 laptop:mt-10 grid grid-cols-1 tablet:grid-cols-2 gap-4">
            {sortedProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                img={project.imageSrc}
                name={project.title}
                subtitle={project.subtitle}
                description={project.description}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 laptop:mt-30 p-2 laptop:p-0" ref={workRef}>
          <h1 className="tablet:m-10 text-2xl text-bold">Professional Experiences</h1>
          <div className="mt-5 tablet:m-10 grid grid-cols-1 laptop:grid-cols-2 gap-6">
            {data.services.map((service, index) => (
              <WorkCard
                key={index}
                name={service.title}
                description={service.description}
              />
            ))}
          </div>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-5 right-5">
            <Link href="/edit">
              <Button type="primary">Edit Data</Button>
            </Link>
          </div>
        )}

        <div className="mt-10 laptop:mt-40 p-2 laptop:p-0" ref={aboutRef}>
          <h1 className="tablet:m-10 text-2xl text-bold">About</h1>
          <p className="tablet:m-10 mt-2 text-lg laptop:text-2xl w-full laptop:w-4/5">
            {data.aboutpara.split('\n').map((line, index) => (
              <Fragment key={index}>
                {line}
                <br/>
              </Fragment>
            ))}
          </p>
        </div>
        <Footer/>
      </div>
    </div>
  );
}