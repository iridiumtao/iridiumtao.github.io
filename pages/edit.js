import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "next-themes";

// Data
import yourData from "../data/portfolio.json";

const Edit = () => {
  // states
  const [data, setData] = useState(null);
  const [currentTabs, setCurrentTabs] = useState("HEADER");
  const { theme } = useTheme();

  useEffect(() => {
    const transformedData = JSON.parse(JSON.stringify(yourData));

    // Experiences
    transformedData.resume.experiences.forEach((exp) => {
      if (Array.isArray(exp.bullets)) {
        exp.bullets = exp.bullets.join("\n");
      }
    });

    // Education
    transformedData.resume.education.forEach((edu) => {
      if (Array.isArray(edu.relevantCoursework)) {
        edu.relevantCoursework = edu.relevantCoursework.join("\n");
      }
    });

    // Skills
    if (Array.isArray(transformedData.resume.skills.languages)) {
      transformedData.resume.skills.languages =
        transformedData.resume.skills.languages.join("\n");
    }
    if (Array.isArray(transformedData.resume.skills.softwareAndOS)) {
      transformedData.resume.skills.softwareAndOS =
        transformedData.resume.skills.softwareAndOS.join("\n");
    }

    // Resume Projects
    transformedData.resume.projects.forEach((proj) => {
      if (proj.details && Array.isArray(proj.details)) {
        proj.details = proj.details.join("\n");
      } else if (!proj.details) {
        proj.details = "";
      }
    });

    setData(transformedData);
  }, []);


  const saveData = () => {
    if (process.env.NODE_ENV === "development") {
      const dataToSave = JSON.parse(JSON.stringify(data));

      // Experiences
      dataToSave.resume.experiences.forEach((exp) => {
        if (typeof exp.bullets === "string") {
          exp.bullets = exp.bullets
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      });

      // Education
      dataToSave.resume.education.forEach((edu) => {
        if (typeof edu.relevantCoursework === "string") {
          edu.relevantCoursework = edu.relevantCoursework
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      });

      // Skills
      if (typeof dataToSave.resume.skills.languages === "string") {
        dataToSave.resume.skills.languages =
          dataToSave.resume.skills.languages
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
      }
      if (typeof dataToSave.resume.skills.softwareAndOS === "string") {
        dataToSave.resume.skills.softwareAndOS =
          dataToSave.resume.skills.softwareAndOS
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
      }

      // Resume Projects
      dataToSave.resume.projects.forEach((proj) => {
        if (proj.details && typeof proj.details === "string") {
          proj.details = proj.details
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      });
      fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });
    } else {
      alert("This thing only works in development mode.");
    }
  };

  // Project Handler
  const editProjects = (projectIndex, editProject) => {
    let copyProjects = data.projects;
    copyProjects[projectIndex] = { ...editProject };
    setData({ ...data, projects: copyProjects });
  };

  const addProject = () => {
    const newId = (data.projects.length > 0 ? Math.max(...data.projects.map(p => parseInt(p.id))) + 1 : 1).toString();
    setData({
      ...data,
      projects: [
        {
          id: newId,
          title: "New Project",
          subtitle: "Project Subtitle",
          startDate: "January 2025",
          endDate: "January 2025",
          description: "Web Design & Development",
          imageSrc:
            "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTAyfHxwYXN0ZWx8ZW58MHx8MHw%3D&auto=format&fit=crop&w=400&q=60",
          url: "http://localhost",
        },
        ...data.projects,
      ],
    });
  };

  const deleteProject = (id) => {
    let copyProjects = data.projects;
    copyProjects = copyProjects.filter((project) => project.id !== id);
    setData({ ...data, projects: copyProjects });
  };

  // Experience Handler
  const editExperiences = (experienceIndex, editExperience) => {
    let copyExperiences = data.experiences;
    copyExperiences[experienceIndex] = { ...editExperience };
    setData({ ...data, experiences: copyExperiences });
  };

  const addExperience = () => {
    setData({
      ...data,
      experiences: [
        {
          id: uuidv4(),
          title: "New Experience",
          description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. ",
        },
        ...data.experiences,
      ],
    });
  };

  const deleteExperience = (id) => {
    let copyExperiences = data.experiences;
    copyExperiences = copyExperiences.filter((experience) => experience.id !== id);
    setData({ ...data, experiences: copyExperiences });
  };

  // Socials Handler

  const editSocials = (socialIndex, editSocial) => {
    let copySocials = data.socials;
    copySocials[socialIndex] = { ...editSocial };
    setData({ ...data, socials: copySocials });
  };

  const addSocials = () => {
    setData({
      ...data,
      socials: [
        ...data.socials,
        {
          id: uuidv4(),
          title: "New Link",
          link: "localhost",
        },
      ],
    });
  };

  const deleteSocials = (id) => {
    let copySocials = data.socials;
    copySocials = copySocials.filter((social) => social.id !== id);
    setData({ ...data, socials: copySocials });
  };

  // Resume

  const handleAddExperiences = () => {
    setData({
      ...data,
      resume: {
        ...data.resume,
        experiences: [
          ...data.resume.experiences,
          {
            id: uuidv4(),
            dates: "Enter Dates",
            type: "Full Time",
            position: "Frontend Engineer at X",
            bullets: "Worked on the frontend of a React application",
          },
        ],
      },
    });
  };

  const handleEditExperiences = (index, editExperience) => {
    let copyExperiences = data.resume.experiences;
    copyExperiences[index] = { ...editExperience };
    setData({
      ...data,
      resume: { ...data.resume, experiences: copyExperiences },
    });
  };

  const handleDeleteExperience = (id) => {
    let copyExperiences = data.resume.experiences;
    copyExperiences = copyExperiences.filter(
      (experience) => experience.id !== id
    );
    setData({
      ...data,
      resume: { ...data.resume, experiences: copyExperiences },
    });
  };

  const handleDeleteEducation = (id) => {
    let copyEducation = data.resume.education;
    copyEducation = copyEducation.filter((edu) => edu.id !== id);
    setData({
      ...data,
      resume: { ...data.resume, education: copyEducation },
    });
  };

  // Resume Projects
  const handleAddResumeProject = () => {
    setData({
      ...data,
      resume: {
        ...data.resume,
        projects: [
          ...data.resume.projects,
          {
            id: uuidv4(),
            title: "New Project",
            organization: "Organization",
            location: "Location",
            dates: "Dates",
            details: "",
          },
        ],
      },
    });
  };

  const handleEditResumeProject = (index, editProject) => {
    let copyProjects = data.resume.projects;
    copyProjects[index] = { ...editProject };
    setData({
      ...data,
      resume: { ...data.resume, projects: copyProjects },
    });
  };

  const handleDeleteResumeProject = (id) => {
    let copyProjects = data.resume.projects;
    copyProjects = copyProjects.filter((project) => project.id !== id);
    setData({ ...data, resume: { ...data.resume, projects: copyProjects } });
  };

  // Resume Honors
  const handleAddHonor = () => {
    setData({
      ...data,
      resume: {
        ...data.resume,
        honors: [
          ...data.resume.honors,
          {
            id: uuidv4(),
            title: "New Honor",
            event: "Event",
            location: "Location",
            year: "Year",
          },
        ],
      },
    });
  };

  const handleEditHonor = (index, editHonor) => {
    let copyHonors = data.resume.honors;
    copyHonors[index] = { ...editHonor };
    setData({ ...data, resume: { ...data.resume, honors: copyHonors } });
  };

  const handleDeleteHonor = (id) => {
    let copyHonors = data.resume.honors;
    copyHonors = copyHonors.filter((honor) => honor.id !== id);
    setData({ ...data, resume: { ...data.resume, honors: copyHonors } });
  };

  if (!data) return <p>Loading Editor...</p>;

  return (
    <div className={`container mx-auto`}>
      <Header isBlog></Header>
      <div className="mt-10">
        <div className={`${theme === "dark" ? "bg-transparent" : "bg-white"}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl">Dashboard</h1>
            <div className="flex items-center">
              <Button onClick={saveData} type="primary">
                Save
              </Button>
            </div>
          </div>

          <div className="flex items-center">
            <Button
              onClick={() => setCurrentTabs("HEADER")}
              type={currentTabs === "HEADER" && "primary"}
            >
              Header
            </Button>
            <Button
              onClick={() => setCurrentTabs("PROJECTS")}
              type={currentTabs === "PROJECTS" && "primary"}
            >
              Projects
            </Button>
            <Button
              onClick={() => setCurrentTabs("EXPERIENCES")}
              type={currentTabs === "EXPERIENCES" && "primary"}
            >
              Experiences
            </Button>
            <Button
              onClick={() => setCurrentTabs("ABOUT")}
              type={currentTabs === "ABOUT" && "primary"}
            >
              About
            </Button>
            <Button
              onClick={() => setCurrentTabs("SOCIAL")}
              type={currentTabs === "SOCIAL" && "primary"}
            >
              Social
            </Button>
            <Button
              onClick={() => setCurrentTabs("RESUME")}
              type={currentTabs === "RESUME" && "primary"}
            >
              Resume
            </Button>
          </div>
        </div>
        {/* HEADER */}
        {currentTabs === "HEADER" && (
          <div className="mt-10">
            <div className="flex items-center">
              <label className="w-1/5 text-lg opacity-50">Name</label>
              <input
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                type="text"
              ></input>
            </div>
            <div className="mt-5 flex items-center">
              <label className="w-1/5 text-sx opacity-50">
                Header Tagline One
              </label>
              <input
                value={data.headerTaglineOne}
                onChange={(e) =>
                  setData({ ...data, headerTaglineOne: e.target.value })
                }
                className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                type="text"
              ></input>
            </div>
            <div className="mt-5 flex items-center">
              <label className="w-1/5 text-lg opacity-50">
                Header Tagline Two
              </label>
              <input
                value={data.headerTaglineTwo}
                onChange={(e) =>
                  setData({ ...data, headerTaglineTwo: e.target.value })
                }
                className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                type="text"
              ></input>
            </div>
            <div className="mt-5 flex items-center">
              <label className="w-1/5 text-lg opacity-50">
                Header Tagline Three
              </label>
              <input
                value={data.headerTaglineThree}
                onChange={(e) =>
                  setData({ ...data, headerTaglineThree: e.target.value })
                }
                className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                type="text"
              ></input>
            </div>
            <div className="mt-5 flex items-center">
              <label className="w-1/5 text-lg opacity-50">
                Header Tagline Four
              </label>
              <input
                value={data.headerTaglineFour}
                onChange={(e) =>
                  setData({ ...data, headerTaglineFour: e.target.value })
                }
                className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                type="text"
              ></input>
            </div>
            <div className="mt-5 flex items-center">
              <label className="w-1/5 text-lg opacity-50">Blog</label>
              <div className="w-4/5 ml-10 flex items-center">
                <Button
                  onClick={() => setData({ ...data, showBlog: true })}
                  type={data.showBlog && "primary"}
                >
                  Yes
                </Button>
                <Button
                  onClick={() => setData({ ...data, showBlog: false })}
                  classes={
                    !data.showBlog && "bg-red-500 text-white hover:bg-red-600"
                  }
                >
                  No
                </Button>
              </div>
            </div>
            <div className="mt-5 flex items-center">
              <label className="w-1/5 text-lg opacity-50">Dark Mode</label>
              <div className="w-4/5 ml-10 flex items-center">
                <Button
                  onClick={() => setData({ ...data, darkMode: true })}
                  type={data.darkMode && "primary"}
                >
                  Yes
                </Button>
                <Button
                  onClick={() => setData({ ...data, darkMode: false })}
                  classes={
                    !data.darkMode && "bg-red-500 text-white hover:bg-red-600"
                  }
                >
                  No
                </Button>
              </div>
            </div>
            <div className="mt-5 flex items-center">
              <label className="w-1/5 text-lg opacity-50">Show Resume</label>
              <div className="w-4/5 ml-10 flex items-center">
                <Button
                  onClick={() => setData({ ...data, showResume: true })}
                  type={data.showResume && "primary"}
                >
                  Yes
                </Button>
                <Button
                  onClick={() => setData({ ...data, showResume: false })}
                  classes={
                    !data.showResume && "bg-red-500 text-white hover:bg-red-600"
                  }
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* PROJECTS */}
        {currentTabs === "PROJECTS" && (
          <>
            <div className="mt-10">
              <div className="my-10">
                <Button onClick={addProject} type="primary">
                  Add Project +
                </Button>
              </div>
              {data.projects.map((project, index) => (
                <div className="mt-10" key={project.id}>
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{project.title}</h1>
                    <Button
                      onClick={() => deleteProject(project.id)}
                      type="primary"
                    >
                      Delete
                    </Button>
                  </div>

                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">Title</label>
                    <input
                      value={project.title}
                      onChange={(e) =>
                        editProjects(index, {
                          ...project,
                          title: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">
                      Subtitle
                    </label>
                    <input
                      value={project.subtitle}
                      onChange={(e) =>
                        editProjects(index, {
                          ...project,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">
                      Start Date
                    </label>
                    <input
                      value={project.startDate}
                      onChange={(e) =>
                        editProjects(index, {
                          ...project,
                          startDate: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">
                      End Date
                    </label>
                    <input
                      value={project.endDate}
                      onChange={(e) =>
                        editProjects(index, {
                          ...project,
                          endDate: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">
                      Description
                    </label>
                    <input
                      value={project.description}
                      onChange={(e) =>
                        editProjects(index, {
                          ...project,
                          description: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">
                      Image Source
                    </label>
                    <input
                      value={project.imageSrc}
                      onChange={(e) =>
                        editProjects(index, {
                          ...project,
                          imageSrc: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">url</label>
                    <input
                      value={project.url}
                      onChange={(e) =>
                        editProjects(index, {
                          ...project,
                          url: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <hr className="my-10"></hr>
                </div>
              ))}
            </div>

            <div className="my-10">
              <Button onClick={addProject} type="primary">
                Add Project +
              </Button>
            </div>
          </>
        )}
        {/* EXPERIENCES */}
        {currentTabs === "EXPERIENCES" && (
          <>
            <div className="mt-10">
              <div className="my-10">
                <Button onClick={addExperience} type="primary">
                  Add Experience +
                </Button>
              </div>
              {data.experiences.map((experience, index) => (
                <div key={experience.id}>
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{experience.title}</h1>
                    <Button
                      onClick={() => deleteExperience(experience.id)}
                      type="primary"
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">Title</label>
                    <input
                      value={experience.title}
                      onChange={(e) =>
                        editExperiences(index, {
                          ...experience,
                          title: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">
                      Description
                    </label>
                    <textarea
                      rows="5"
                      value={experience.description}
                      onChange={(e) =>
                        editExperiences(index, {
                          ...experience,
                          description: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                    ></textarea>
                  </div>
                  <hr className="my-10"></hr>
                </div>
              ))}
            </div>
          </>
        )}
        {currentTabs === "ABOUT" && (
          <div className="mt-10">
            <h1 className="text-2xl">About</h1>
            <textarea
              className="w-full h-96 mt-10 p-2 rounded-md shadow-md border"
              value={data.aboutpara}
              onChange={(e) => setData({ ...data, aboutpara: e.target.value })}
            ></textarea>
          </div>
        )}
        {currentTabs === "SOCIAL" && (
          <div className="mt-10">
            {data.socials.map((social, index) => (
              <>
                <div key={social.id}>
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{social.title}</h1>
                    <Button
                      onClick={() => deleteSocials(social.id)}
                      type="primary"
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">Title</label>
                    <input
                      value={social.title}
                      onChange={(e) =>
                        editSocials(index, {
                          ...social,
                          title: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">Link</label>
                    <input
                      value={social.link}
                      onChange={(e) =>
                        editSocials(index, {
                          ...social,
                          link: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    />
                  </div>
                  <hr className="my-10"></hr>
                </div>
              </>
            ))}
            <div className="my-10">
              <Button onClick={addSocials} type="primary">
                Add Social +
              </Button>
            </div>
          </div>
        )}
        {currentTabs === "RESUME" && (
          <div className="mt-10">
            <h1>Main</h1>
            <div className="mt-5 flex items-center">
              <label className="w-1/5 text-sx opacity-50">Tagline</label>
              <input
                value={data.resume.tagline}
                onChange={(e) =>
                  setData({
                    ...data,
                    resume: { ...data.resume, tagline: e.target.value },
                  })
                }
                className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                type="text"
              ></input>
            </div>
            <div className="flex items-center mt-5">
              <label className="w-1/5 text-lg opacity-50">Description</label>
              <textarea
                rows="5"
                value={data.resume.description}
                onChange={(e) =>
                  setData({
                    ...data,
                    resume: { ...data.resume, description: e.target.value },
                  })
                }
                className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
              ></textarea>
            </div>
            <hr className="my-10"></hr>

            <h1>Experiences</h1>
            <div className="my-10">
              <Button onClick={handleAddExperiences} type="primary">
                Add Experience +
              </Button>
            </div>
            <div className="mt-10">
              {data.resume.experiences.map((experiences, index) => (
                <div className="mt-5" key={experiences.id}>
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{experiences.position}</h1>
                    <Button
                      onClick={() => handleDeleteExperience(experiences.id)}
                      type="primary"
                    >
                      Delete
                    </Button>
                  </div>

                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">Dates</label>
                    <input
                      value={experiences.dates}
                      onChange={(e) =>
                        handleEditExperiences(index, {
                          ...experiences,
                          dates: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">Type</label>
                    <input
                      value={experiences.type}
                      onChange={(e) =>
                        handleEditExperiences(index, {
                          ...experiences,
                          type: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">Position</label>
                    <input
                      value={experiences.position}
                      onChange={(e) =>
                        handleEditExperiences(index, {
                          ...experiences,
                          position: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex">
                    <label className="w-1/5 text-lg opacity-50">Bullets</label>
                    <div className="w-4/5 ml-10 flex flex-col">
                      <textarea
                        rows="5"
                        value={experiences.bullets}
                        onChange={(e) =>
                          handleEditExperiences(index, {
                            ...experiences,
                            bullets: e.target.value,
                          })
                        }
                        placeholder="Enter each bullet point on a new line."
                        className="p-2 rounded-md shadow-lg border-2"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <hr className="my-10"></hr>
            <div className="mt-10">
              <h1>Education</h1>
              {data.resume.education.map((edu, index) => (
                <div key={edu.id} className="mt-5">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{edu.universityName}</h1>
                    <Button
                      onClick={() => handleDeleteEducation(edu.id)}
                      type="primary"
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">University Name</label>
                    <input
                      value={edu.universityName}
                      onChange={(e) => {
                        const newEdu = [...data.resume.education];
                        newEdu[index].universityName = e.target.value;
                        setData({ ...data, resume: { ...data.resume, education: newEdu } });
                      }}
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">Graduation Date</label>
                    <input
                      value={edu.universityDate}
                      onChange={(e) => {
                        const newEdu = [...data.resume.education];
                        newEdu[index].universityDate = e.target.value;
                        setData({ ...data, resume: { ...data.resume, education: newEdu } });
                      }}
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">Location</label>
                    <input
                      value={edu.location}
                      onChange={(e) => {
                        const newEdu = [...data.resume.education];
                        newEdu[index].location = e.target.value;
                        setData({ ...data, resume: { ...data.resume, education: newEdu } });
                      }}
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">Degree</label>
                    <input
                      value={edu.degree}
                      onChange={(e) => {
                        const newEdu = [...data.resume.education];
                        newEdu[index].degree = e.target.value;
                        setData({ ...data, resume: { ...data.resume, education: newEdu } });
                      }}
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                   <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">GPA</label>
                    <input
                      value={edu.gpa}
                      onChange={(e) => {
                        const newEdu = [...data.resume.education];
                        newEdu[index].gpa = e.target.value;
                        setData({ ...data, resume: { ...data.resume, education: newEdu } });
                      }}
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">Relevant Coursework</label>
                    <textarea
                      value={edu.relevantCoursework}
                      onChange={(e) => {
                        const newEdu = [...data.resume.education];
                        newEdu[index].relevantCoursework = e.target.value;
                        setData({ ...data, resume: { ...data.resume, education: newEdu } });
                      }}
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
            <hr className="my-10"></hr>
            <div className="mt-10">
              <h1>Skills</h1>
               <div className="flex mt-5">
                <label className="w-1/5 text-lg opacity-50">Languages</label>
                <div className="w-4/5 ml-10 flex flex-col">
                  <textarea
                    value={data.resume.skills.languages}
                    onChange={(e) => {
                      const newSkills = { ...data.resume.skills, languages: e.target.value };
                      setData({ ...data, resume: { ...data.resume, skills: newSkills } });
                    }}
                    className="w-full p-2 rounded-md shadow-lg border-2"
                  ></textarea>
                </div>
              </div>
              <div className="flex mt-5">
                <label className="w-1/5 text-lg opacity-50">Software & OS</label>
                <div className="w-4/5 ml-10 flex flex-col">
                  <textarea
                    value={data.resume.skills.softwareAndOS}
                    onChange={(e) => {
                      const newSkills = { ...data.resume.skills, softwareAndOS: e.target.value };
                      setData({ ...data, resume: { ...data.resume, skills: newSkills } });
                    }}
                    className="w-full p-2 rounded-md shadow-lg border-2"
                  ></textarea>
                </div>
              </div>
            </div>
             <hr className="my-10"></hr>
            <div className="mt-10">
              <h1>Projects</h1>
              <div className="my-10">
                <Button onClick={handleAddResumeProject} type="primary">
                  Add Project +
                </Button>
              </div>
              {data.resume.projects.map((project, index) => (
                <div key={project.id} className="mt-5">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{project.title}</h1>
                    <Button
                      onClick={() => handleDeleteResumeProject(project.id)}
                      type="primary"
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">Title</label>
                    <input
                      value={project.title}
                      onChange={(e) =>
                        handleEditResumeProject(index, {
                          ...project,
                          title: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">
                      Organization
                    </label>
                    <input
                      value={project.organization}
                      onChange={(e) =>
                        handleEditResumeProject(index, {
                          ...project,
                          organization: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">Location</label>
                    <input
                      value={project.location}
                      onChange={(e) =>
                        handleEditResumeProject(index, {
                          ...project,
                          location: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">Dates</label>
                    <input
                      value={project.dates}
                      onChange={(e) =>
                        handleEditResumeProject(index, {
                          ...project,
                          dates: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex">
                    <label className="w-1/5 text-lg opacity-50">Details</label>
                    <div className="w-4/5 ml-10 flex flex-col">
                      <textarea
                        rows="5"
                        value={project.details}
                        onChange={(e) =>
                          handleEditResumeProject(index, {
                            ...project,
                            details: e.target.value,
                          })
                        }
                        placeholder="Enter each detail on a new line."
                        className="p-2 rounded-md shadow-lg border-2"
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <hr className="my-10"></hr>
            <div className="mt-10">
              <h1>Honors</h1>
              <div className="my-10">
                <Button onClick={handleAddHonor} type="primary">
                  Add Honor +
                </Button>
              </div>
              {data.resume.honors.map((honor, index) => (
                <div key={honor.id} className="mt-5">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{honor.title}</h1>
                    <Button
                      onClick={() => handleDeleteHonor(honor.id)}
                      type="primary"
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="flex items-center mt-5">
                    <label className="w-1/5 text-lg opacity-50">Title</label>
                    <input
                      value={honor.title}
                      onChange={(e) =>
                        handleEditHonor(index, {
                          ...honor,
                          title: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">Event</label>
                    <input
                      value={honor.event}
                      onChange={(e) =>
                        handleEditHonor(index, {
                          ...honor,
                          event: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">
                      Location
                    </label>
                    <input
                      value={honor.location}
                      onChange={(e) =>
                        handleEditHonor(index, {
                          ...honor,
                          location: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                  <div className="flex items-center mt-2">
                    <label className="w-1/5 text-lg opacity-50">Year</label>
                    <input
                      value={honor.year}
                      onChange={(e) =>
                        handleEditHonor(index, {
                          ...honor,
                          year: e.target.value,
                        })
                      }
                      className="w-4/5 ml-10 p-2 rounded-md shadow-lg border-2"
                      type="text"
                    ></input>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Edit;
