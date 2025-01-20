import {useRef} from "react";
import Header from "../components/Header";

import {useIsomorphicLayoutEffect} from "../utils";
import {stagger} from "../animations";
import Footer from "../components/Footer";
import Head from "next/head";
import Button from "../components/Button";
import Link from "next/link";
import Cursor from "../components/Cursor";
import {useTheme} from "next-themes";

import data from "../data/portfolio.json";


const Resume = () => {
  const theme = useTheme();
  // Refs for animation
  const eduRef = useRef(null);
  const expRef = useRef(null);
  const skillsRef = useRef(null);
  const headRef = useRef(null);
  const projectsRef = useRef(null);
  const honorsRef = useRef(null);

  // Animation effect
  useIsomorphicLayoutEffect(() => {
    stagger(
      [headRef.current, eduRef.current, expRef.current, skillsRef.current, projectsRef.current, honorsRef.current],
      {y: 40, x: -10, transform: "scale(0.95) skew(10deg)"},
      {y: 0, x: 0, transform: "scale(1)"}
    );
  }, []);

  return (
    <div className={`relative ${data.showCursor && "cursor-none"}`}>
      {data.showCursor && <Cursor/>}
      <Head>
        <title>Resume</title>
      </Head>

      <div className={`${theme === "dark" ? "gradient-circle-dark" : "gradient-circle"}`}></div>
      <div className={`${theme === "dark" ? "gradient-circle-bottom-dark" : "gradient-circle-bottom"}`}></div>

      <div className="container mx-auto mb-10">
        <Header isBlog={true}/>

        <h1 className="mx-auto mob:p-2 text-bold text-4xl laptop:text-6xl w-full">
          Resume
        </h1>

        {/* Main Content */}
        <div className="mt-10 w-full flex flex-col items-center">
          {/* Header Section */}
          <div ref={headRef} className="w-full flex flex-col items-center">

            <p className="text-lg text-center mt-5 text-gray-500 dark:text-gray-300">
              {data.resume.tagline}
            </p>
            <p className="text-md text-center mt-2 max-w-2xl text-gray-500 dark:text-gray-300">
              {data.resume.description}
            </p>
          </div>

          {/* Experience Section */}
          <div ref={expRef} className="w-full mt-16 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Professional Experience</h2>
            {data.resume.experiences.map((exp) => (
              <div
                key={exp.id}
                className="mb-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4"
              >
                <div className="flex justify-between items-center gap-4">
                  <h3 className="text-xl font-semibold">{exp.position}</h3>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {exp.dates}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {exp.location && (
                    <span>
                      {exp.location}
                    </span>
                  )}
                  {exp.location && exp.type && (
                    <span>•</span>
                  )}
                  {exp.type && (
                    <span>
                      {exp.type}
                    </span>
                  )}
                </div>
                <ul className="list-disc list-inside mt-2">
                  {exp.bullets.map((bullet, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div ref={eduRef} className="w-full mt-10 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Education</h2>
            {data.resume.education.map((edu) => (
              <div
                key={edu.id}
                className="mb-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{edu.universityName}</h3>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {edu.universityDate}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {edu.location && (
                    <span>
                      {edu.location}
                    </span>
                  )}
                  {edu.location && edu.gpa && (
                    <span>•</span>
                  )}
                  {edu.gpa && (
                    <span>
                      GPA: {edu.gpa}
                    </span>
                  )}
                </div>


                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {edu.universityPara}
                </p>

                {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm font-medium">Relevant Courses:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {edu.relevantCoursework.map((course, index) => (
                        <span
                          key={index}
                          className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Skills Section */}
          <div ref={skillsRef} className="w-full mt-10 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Technical Skills</h2>
            <div className="flex flex-wrap gap-3">
              {data.resume.skills.languages.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Projects Section */}
          <div ref={projectsRef} className="w-full mt-16 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Projects</h2>
            {data.resume.projects.map((project, index) => (
              <div
                key={index}
                className="mb-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {project.dates}
                  </span>
                </div>
                <div className="mt-1">
                <span className="text-gray-600 dark:text-gray-300">
                  {project.organization}
                </span>
                  {project.location && (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {" "}
                      • {project.location}
                    </span>
                  )}
                </div>
                <ul className="list-disc list-inside mt-2">
                  {project.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
                    >
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Honors Section */}
          <div ref={honorsRef} className="w-full mt-16 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Honors & Awards</h2>
            {data.resume.honors.map((honor, index) => (
              <div
                key={index}
                className="mb-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">{honor.title}</h3>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {honor.year}
                  </span>
                </div>
                <div className="mt-1">
                  {honor.event && (
                    <span className="text-gray-600 dark:text-gray-300">
                      {honor.event}
                    </span>
                  )}
                  {honor.organization && (
                    <span className="text-gray-600 dark:text-gray-300">
                      {honor.organization}
                    </span>
                  )}
                  {honor.location && (
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {" "}
                                • {honor.location}
                    </span>
                  )}
                </div>
                {honor.details && (
                  <ul className="list-disc list-inside mt-2">
                    {honor.details.map((detail, idx) => (
                      <li
                        key={idx}
                        className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
                      >
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Resume;
