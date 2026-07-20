// Dev-only visual editor for the site's portfolio content, read through the
// typed accessor in lib/portfolio.ts; excluded from production builds at the
// routing level via the pageExtensions split in next.config.js.
//
// KNOWN GAP (Phase 5 / EDIT-02): the Skills tab is out of sync with the real
// content model. It edits `resume.skills.softwareAndOS`, a field that no longer
// exists in the committed content, and offers no control for the two fields
// that do (`cloudAndDevOps`, `dataAndML`). Loading and saving without touching
// that textarea is a no-op, but typing into it writes a `softwareAndOS` array
// back to the content file, which then fails lib/portfolio.ts's `satisfies
// PortfolioData` check on the next `yarn typecheck`. Loud, not silent — but
// still wrong. Typing this file (Plan 04-08) deliberately did not redesign the
// tab; see D-25.
import React, { useState, useEffect } from "react";
import Nav from "../components/wood/Nav";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "next-themes";

// Data
import yourData from "../lib/portfolio";
import type {
  PortfolioData,
  Resume,
  ResumeExperienceEntry,
  ResumeEducationEntry,
  ResumeSkills,
  ResumeProjectEntry,
  ResumeHonorEntry,
  RawProjectEntry,
  Experience,
  Social,
} from "../types/portfolio";

/* ── Editable shape ──────────────────────────────────────────────────────
 * The editor's working state is NOT PortfolioData. Several `string[]` fields
 * are joined into newline-separated strings so a single <textarea> can edit
 * them, then split back on save. These types describe that transformed shape;
 * every other field keeps its canonical type.
 *
 * `softwareAndOS` is optional and lives ONLY here — it is absent from both the
 * committed JSON and types/portfolio.ts's ResumeSkills. Adding it to the shared
 * type would fabricate a content-model field that no real data carries.
 */

type EditableResumeExperience = Omit<ResumeExperienceEntry, "bullets"> & {
  bullets: string;
};

type EditableResumeEducation = Omit<
  ResumeEducationEntry,
  "relevantCoursework"
> & {
  relevantCoursework: string;
};

type EditableResumeSkills = Omit<ResumeSkills, "languages"> & {
  languages: string;
  softwareAndOS?: string;
};

type EditableResumeProject = Omit<ResumeProjectEntry, "details"> & {
  details: string;
};

type EditableResume = Omit<
  Resume,
  "experiences" | "education" | "skills" | "projects"
> & {
  experiences: EditableResumeExperience[];
  education: EditableResumeEducation[];
  skills: EditableResumeSkills;
  projects: EditableResumeProject[];
};

type EditableData = Omit<PortfolioData, "resume"> & { resume: EditableResume };

type TabId =
  | "HEADER"
  | "PROJECTS"
  | "EXPERIENCES"
  | "ABOUT"
  | "SOCIAL"
  | "RESUME";

/* ── Helpers ─────────────────────────────────────────────────────────── */

// PortfolioData -> EditableData. Takes an already-deep-cloned source so the
// untouched nested objects it spreads through cannot alias the imported module.
const toEditable = (source: PortfolioData): EditableData => ({
  ...source,
  resume: {
    ...source.resume,
    experiences: source.resume.experiences.map((exp) => ({
      ...exp,
      bullets: exp.bullets.join("\n"),
    })),
    education: source.resume.education.map((edu) => ({
      ...edu,
      relevantCoursework: edu.relevantCoursework.join("\n"),
    })),
    skills: {
      ...source.resume.skills,
      languages: source.resume.skills.languages.join("\n"),
    },
    projects: source.resume.projects.map((proj) => ({
      ...proj,
      details: proj.details ? proj.details.join("\n") : "",
    })),
  },
});

const splitLines = (value: string): string[] =>
  value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

// EditableData -> PortfolioData, the inverse of toEditable. Builds a new object
// rather than mutating a clone, so the live editor state is never touched.
const toSaved = (edited: EditableData): PortfolioData => ({
  ...edited,
  resume: {
    ...edited.resume,
    experiences: edited.resume.experiences.map((exp) => ({
      ...exp,
      bullets: splitLines(exp.bullets),
    })),
    education: edited.resume.education.map((edu) => ({
      ...edu,
      relevantCoursework: splitLines(edu.relevantCoursework),
    })),
    skills: {
      ...edited.resume.skills,
      languages: splitLines(edited.resume.skills.languages),
      // Preserved only to keep the legacy textarea's save path behaving exactly
      // as it did before this file was typed. See the KNOWN GAP note above.
      ...(typeof edited.resume.skills.softwareAndOS === "string"
        ? { softwareAndOS: splitLines(edited.resume.skills.softwareAndOS) }
        : {}),
    },
    projects: edited.resume.projects.map((proj) => ({
      ...proj,
      details: proj.details ? splitLines(proj.details) : [],
    })),
  },
});

// Local replacement for the legacy Button component: the editor only ever used
// its plain-button branch (children/onClick/classes), so this keeps the same
// base utility classes without pulling in the dying legacy component tree.
//
// `classes` accepts `false` because two call sites pass `!data.darkMode &&
// "..."`. The `?? ""` below is deliberately NOT `|| ""`: nullish coalescing lets
// a `false` through and renders a literal "false" class. That is a pre-existing
// cosmetic quirk, preserved here so typing this file changes no rendered markup.
// Tracked for Phase 5 alongside the tab-highlight gap noted below.
type EditButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  classes?: string | false;
};

const EditButton = ({ children, onClick, classes }: EditButtonProps) => (
  <button
    onClick={onClick}
    type="button"
    className={`text-sm tablet:text-base p-1 laptop:p-2 m-1 laptop:m-2 rounded-lg transition-all duration-300 ease-out first:ml-0 hover:scale-105 active:scale-100 ${classes ?? ""}`}
  >
    {children}
  </button>
);

/* ── Page ────────────────────────────────────────────────────────────── */

const Edit = () => {
  // states
  const [data, setData] = useState<EditableData | null>(null);
  const [currentTabs, setCurrentTabs] = useState<TabId>("HEADER");
  const { theme } = useTheme();

  useEffect(() => {
    // Deep-clone first: the editor mutates arrays in place, and the imported
    // module object must not be one of them.
    const cloned = JSON.parse(JSON.stringify(yourData)) as PortfolioData;
    setData(toEditable(cloned));
  }, []);

  const saveData = async () => {
    if (!data) return;
    if (process.env.NODE_ENV !== "development") {
      alert("This thing only works in development mode.");
      return;
    }
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toSaved(data)),
      });
      if (!res.ok) throw new Error(`save failed: ${res.status}`);
      alert("Saved.");
    } catch (err) {
      console.error(err);
      alert(`Save failed: ${err}`);
    }
  };

  // Project Handler
  const editProjects = (projectIndex: number, editProject: RawProjectEntry) => {
    if (!data) return;
    setData({
      ...data,
      projects: data.projects.map((p, i) =>
        i === projectIndex ? { ...editProject } : p,
      ),
    });
  };

  const addProject = () => {
    if (!data) return;
    const newId = (
      data.projects.length > 0
        ? Math.max(...data.projects.map((p) => parseInt(p.id, 10))) + 1
        : 1
    ).toString();
    setData({
      ...data,
      projects: [
        {
          id: newId,
          // Required by RawProjectEntry and by lib/projects.ts, which keys
          // every showcase page off `slug`. Left as a placeholder for the owner
          // to replace — an entry without it cannot render a project page.
          slug: "new-project",
          title: "New Project",
          subtitle: "Project Subtitle",
          techStack: [],
          startDate: "January 2025",
          endDate: "January 2025",
          description: "Web Design & Development",
          imageSrc:
            "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTAyfHxwYXN0ZWx8ZW58MHx8MHw%3D&auto=format&fit=crop&w=400&q=60",
          url: "http://localhost",
          demoUrl: null,
          // The owner writes this prose himself — never generated.
          role: null,
          problem: null,
          process: null,
          outcome: null,
        },
        ...data.projects,
      ],
    });
  };

  const deleteProject = (id: string) => {
    if (!data) return;
    const copyProjects = data.projects.filter((project) => project.id !== id);
    setData({ ...data, projects: copyProjects });
  };

  // Experience Handler
  const editExperiences = (
    experienceIndex: number,
    editExperience: Experience,
  ) => {
    if (!data) return;
    setData({
      ...data,
      experiences: data.experiences.map((e, i) =>
        i === experienceIndex ? { ...editExperience } : e,
      ),
    });
  };

  const addExperience = () => {
    if (!data) return;
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

  const deleteExperience = (id: string) => {
    if (!data) return;
    const copyExperiences = data.experiences.filter(
      (experience) => experience.id !== id,
    );
    setData({ ...data, experiences: copyExperiences });
  };

  // Socials Handler
  // Socials are addressed by index, not id: Social carries no `id` in the real
  // content model, so the previous id-based filter compared `undefined !==
  // undefined` for every existing entry and deleted the entire list.

  const editSocials = (socialIndex: number, editSocial: Social) => {
    if (!data) return;
    setData({
      ...data,
      socials: data.socials.map((s, i) =>
        i === socialIndex ? { ...editSocial } : s,
      ),
    });
  };

  const addSocials = () => {
    if (!data) return;
    setData({
      ...data,
      socials: [
        ...data.socials,
        {
          title: "New Link",
          link: "localhost",
        },
      ],
    });
  };

  const deleteSocials = (socialIndex: number) => {
    if (!data) return;
    const copySocials = data.socials.filter((_, i) => i !== socialIndex);
    setData({ ...data, socials: copySocials });
  };

  // Resume

  const handleAddExperiences = () => {
    if (!data) return;
    setData({
      ...data,
      resume: {
        ...data.resume,
        experiences: [
          {
            id: uuidv4(),
            dates: "Enter Dates",
            type: "Full Time",
            position: "Frontend Engineer at X",
            // Required by ResumeExperienceEntry; every real entry carries it.
            location: "Location",
            bullets: "Worked on the frontend of a React application",
          },
          ...data.resume.experiences,
        ],
      },
    });
  };

  const handleEditExperiences = (
    index: number,
    editExperience: EditableResumeExperience,
  ) => {
    if (!data) return;
    setData({
      ...data,
      resume: {
        ...data.resume,
        experiences: data.resume.experiences.map((e, i) =>
          i === index ? { ...editExperience } : e,
        ),
      },
    });
  };

  const handleDeleteExperience = (id: string) => {
    if (!data) return;
    const copyExperiences = data.resume.experiences.filter(
      (experience) => experience.id !== id,
    );
    setData({
      ...data,
      resume: { ...data.resume, experiences: copyExperiences },
    });
  };

  const handleDeleteEducation = (id: string) => {
    if (!data) return;
    const copyEducation = data.resume.education.filter((edu) => edu.id !== id);
    setData({
      ...data,
      resume: { ...data.resume, education: copyEducation },
    });
  };

  // Resume Projects
  const handleAddResumeProject = () => {
    if (!data) return;
    setData({
      ...data,
      resume: {
        ...data.resume,
        projects: [
          {
            id: uuidv4(),
            title: "New Project",
            organization: "Organization",
            location: "Location",
            dates: "Dates",
            details: "",
          },
          ...data.resume.projects,
        ],
      },
    });
  };

  const handleEditResumeProject = (
    index: number,
    editProject: EditableResumeProject,
  ) => {
    if (!data) return;
    setData({
      ...data,
      resume: {
        ...data.resume,
        projects: data.resume.projects.map((p, i) =>
          i === index ? { ...editProject } : p,
        ),
      },
    });
  };

  const handleDeleteResumeProject = (id: string) => {
    if (!data) return;
    const copyProjects = data.resume.projects.filter(
      (project) => project.id !== id,
    );
    setData({ ...data, resume: { ...data.resume, projects: copyProjects } });
  };

  // Resume Honors
  const handleAddHonor = () => {
    if (!data) return;
    setData({
      ...data,
      resume: {
        ...data.resume,
        honors: [
          {
            id: uuidv4(),
            title: "New Honor",
            event: "Event",
            location: "Location",
            year: "Year",
          },
          ...data.resume.honors,
        ],
      },
    });
  };

  const handleEditHonor = (index: number, editHonor: ResumeHonorEntry) => {
    if (!data) return;
    setData({
      ...data,
      resume: {
        ...data.resume,
        honors: data.resume.honors.map((h, i) =>
          i === index ? { ...editHonor } : h,
        ),
      },
    });
  };

  const handleDeleteHonor = (id: string) => {
    if (!data) return;
    const copyHonors = data.resume.honors.filter((honor) => honor.id !== id);
    setData({ ...data, resume: { ...data.resume, honors: copyHonors } });
  };

  if (!data) return <p>Loading Editor...</p>;

  return (
    <div className={`container mx-auto`}>
      <Nav />
      <div className="mt-10">
        <div className={`${theme === "dark" ? "bg-transparent" : "bg-white"}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl">Dashboard</h1>
            <div className="flex items-center">
              <EditButton onClick={saveData}>
                Save
              </EditButton>
            </div>
          </div>

          <div className="flex items-center">
            <EditButton
              onClick={() => setCurrentTabs("HEADER")}
            >
              Header
            </EditButton>
            <EditButton
              onClick={() => setCurrentTabs("PROJECTS")}
            >
              Projects
            </EditButton>
            <EditButton
              onClick={() => setCurrentTabs("EXPERIENCES")}
            >
              Experiences
            </EditButton>
            <EditButton
              onClick={() => setCurrentTabs("ABOUT")}
            >
              About
            </EditButton>
            <EditButton
              onClick={() => setCurrentTabs("SOCIAL")}
            >
              Social
            </EditButton>
            <EditButton
              onClick={() => setCurrentTabs("RESUME")}
            >
              Resume
            </EditButton>
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
                className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                type="text"
              ></input>
            </div>
            <div className="mt-5 flex items-center">
              <label className="text-sx w-1/5 opacity-50">
                Header Tagline One
              </label>
              <input
                value={data.headerTaglineOne}
                onChange={(e) =>
                  setData({ ...data, headerTaglineOne: e.target.value })
                }
                className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
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
                className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
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
                className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
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
                className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                type="text"
              ></input>
            </div>
            <div className="mt-5 flex items-center">
              <label className="w-1/5 text-lg opacity-50">Dark Mode</label>
              <div className="ml-10 flex w-4/5 items-center">
                <EditButton
                  onClick={() => setData({ ...data, darkMode: true })}
                >
                  Yes
                </EditButton>
                <EditButton
                  onClick={() => setData({ ...data, darkMode: false })}
                  classes={
                    !data.darkMode && "bg-red-500 text-white hover:bg-red-600"
                  }
                >
                  No
                </EditButton>
              </div>
            </div>
            <div className="mt-5 flex items-center">
              <label className="w-1/5 text-lg opacity-50">Show Resume</label>
              <div className="ml-10 flex w-4/5 items-center">
                <EditButton
                  onClick={() => setData({ ...data, showResume: true })}
                >
                  Yes
                </EditButton>
                <EditButton
                  onClick={() => setData({ ...data, showResume: false })}
                  classes={
                    !data.showResume && "bg-red-500 text-white hover:bg-red-600"
                  }
                >
                  No
                </EditButton>
              </div>
            </div>
          </div>
        )}
        {/* PROJECTS */}
        {currentTabs === "PROJECTS" && (
          <>
            <div className="mt-10">
              <div className="my-10">
                <EditButton onClick={addProject}>
                  Add Project +
                </EditButton>
              </div>
              {data.projects.map((project, index) => (
                <div className="mt-10" key={project.id}>
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{project.title}</h1>
                    <EditButton
                      onClick={() => deleteProject(project.id)}
                    >
                      Delete
                    </EditButton>
                  </div>

                  <div className="mt-5 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Title</label>
                    <input
                      value={project.title}
                      onChange={(e) =>
                        editProjects(index, {
                          ...project,
                          title: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Subtitle</label>
                    <input
                      value={project.subtitle ?? ""}
                      onChange={(e) =>
                        editProjects(index, {
                          ...project,
                          subtitle: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
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
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">End Date</label>
                    <input
                      value={project.endDate}
                      onChange={(e) =>
                        editProjects(index, {
                          ...project,
                          endDate: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
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
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
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
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">url</label>
                    <input
                      value={project.url}
                      onChange={(e) =>
                        editProjects(index, {
                          ...project,
                          url: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <hr className="my-10"></hr>
                </div>
              ))}
            </div>

            <div className="my-10">
              <EditButton onClick={addProject}>
                Add Project +
              </EditButton>
            </div>
          </>
        )}
        {/* EXPERIENCES */}
        {currentTabs === "EXPERIENCES" && (
          <>
            <div className="mt-10">
              <div className="my-10">
                <EditButton onClick={addExperience}>
                  Add Experience +
                </EditButton>
              </div>
              {data.experiences.map((experience, index) => (
                <div key={experience.id}>
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{experience.title}</h1>
                    <EditButton
                      onClick={() => deleteExperience(experience.id)}
                    >
                      Delete
                    </EditButton>
                  </div>
                  <div className="mt-5 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Title</label>
                    <input
                      value={experience.title}
                      onChange={(e) =>
                        editExperiences(index, {
                          ...experience,
                          title: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-5 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">
                      Description
                    </label>
                    <textarea
                      rows={5}
                      value={experience.description}
                      onChange={(e) =>
                        editExperiences(index, {
                          ...experience,
                          description: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
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
              className="mt-10 h-96 w-full rounded-md border p-2 shadow-md"
              value={data.aboutpara}
              onChange={(e) => setData({ ...data, aboutpara: e.target.value })}
            ></textarea>
          </div>
        )}
        {currentTabs === "SOCIAL" && (
          <div className="mt-10">
            {data.socials.map((social, index) => (
              <div key={index}>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl">{social.title}</h1>
                  <EditButton onClick={() => deleteSocials(index)}>
                    Delete
                  </EditButton>
                </div>
                <div className="mt-5 flex items-center">
                  <label className="w-1/5 text-lg opacity-50">Title</label>
                  <input
                    value={social.title}
                    onChange={(e) =>
                      editSocials(index, {
                        ...social,
                        title: e.target.value,
                      })
                    }
                    className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                    type="text"
                  ></input>
                </div>
                <div className="mt-5 flex items-center">
                  <label className="w-1/5 text-lg opacity-50">Link</label>
                  <input
                    value={social.link}
                    onChange={(e) =>
                      editSocials(index, {
                        ...social,
                        link: e.target.value,
                      })
                    }
                    className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                    type="text"
                  />
                </div>
                <hr className="my-10"></hr>
              </div>
            ))}
            <div className="my-10">
              <EditButton onClick={addSocials}>
                Add Social +
              </EditButton>
            </div>
          </div>
        )}
        {currentTabs === "RESUME" && (
          <div className="mt-10">
            <h1>Main</h1>
            <div className="mt-5 flex items-center">
              <label className="text-sx w-1/5 opacity-50">Tagline</label>
              <input
                value={data.resume.tagline}
                onChange={(e) =>
                  setData({
                    ...data,
                    resume: { ...data.resume, tagline: e.target.value },
                  })
                }
                className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                type="text"
              ></input>
            </div>
            <div className="mt-5 flex items-center">
              <label className="w-1/5 text-lg opacity-50">Description</label>
              <textarea
                rows={5}
                value={data.resume.description}
                onChange={(e) =>
                  setData({
                    ...data,
                    resume: { ...data.resume, description: e.target.value },
                  })
                }
                className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
              ></textarea>
            </div>
            <hr className="my-10"></hr>

            <h1>Experiences</h1>
            <div className="my-10">
              <EditButton onClick={handleAddExperiences}>
                Add Experience +
              </EditButton>
            </div>
            <div className="mt-10">
              {data.resume.experiences.map((experiences, index) => (
                <div className="mt-5" key={experiences.id}>
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{experiences.position}</h1>
                    <EditButton
                      onClick={() => handleDeleteExperience(experiences.id)}
                    >
                      Delete
                    </EditButton>
                  </div>

                  <div className="mt-5 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Dates</label>
                    <input
                      value={experiences.dates}
                      onChange={(e) =>
                        handleEditExperiences(index, {
                          ...experiences,
                          dates: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Type</label>
                    <input
                      value={experiences.type}
                      onChange={(e) =>
                        handleEditExperiences(index, {
                          ...experiences,
                          type: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Position</label>
                    <input
                      value={experiences.position}
                      onChange={(e) =>
                        handleEditExperiences(index, {
                          ...experiences,
                          position: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex">
                    <label className="w-1/5 text-lg opacity-50">Bullets</label>
                    <div className="ml-10 flex w-4/5 flex-col">
                      <textarea
                        rows={5}
                        value={experiences.bullets}
                        onChange={(e) =>
                          handleEditExperiences(index, {
                            ...experiences,
                            bullets: e.target.value,
                          })
                        }
                        placeholder="Enter each bullet point on a new line."
                        className="rounded-md border-2 p-2 shadow-lg"
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
                    <EditButton
                      onClick={() => handleDeleteEducation(edu.id)}
                    >
                      Delete
                    </EditButton>
                  </div>
                  <div className="mt-5 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">
                      University Name
                    </label>
                    <input
                      value={edu.universityName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setData({
                          ...data,
                          resume: {
                            ...data.resume,
                            education: data.resume.education.map((it, i) =>
                              i === index ? { ...it, universityName: value } : it,
                            ),
                          },
                        });
                      }}
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-5 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">
                      Graduation Date
                    </label>
                    <input
                      value={edu.universityDate}
                      onChange={(e) => {
                        const value = e.target.value;
                        setData({
                          ...data,
                          resume: {
                            ...data.resume,
                            education: data.resume.education.map((it, i) =>
                              i === index ? { ...it, universityDate: value } : it,
                            ),
                          },
                        });
                      }}
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-5 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Location</label>
                    <input
                      value={edu.location}
                      onChange={(e) => {
                        const value = e.target.value;
                        setData({
                          ...data,
                          resume: {
                            ...data.resume,
                            education: data.resume.education.map((it, i) =>
                              i === index ? { ...it, location: value } : it,
                            ),
                          },
                        });
                      }}
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-5 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Degree</label>
                    <input
                      value={edu.degree}
                      onChange={(e) => {
                        const value = e.target.value;
                        setData({
                          ...data,
                          resume: {
                            ...data.resume,
                            education: data.resume.education.map((it, i) =>
                              i === index ? { ...it, degree: value } : it,
                            ),
                          },
                        });
                      }}
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-5 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">GPA</label>
                    <input
                      value={edu.gpa}
                      onChange={(e) => {
                        const value = e.target.value;
                        setData({
                          ...data,
                          resume: {
                            ...data.resume,
                            education: data.resume.education.map((it, i) =>
                              i === index ? { ...it, gpa: value } : it,
                            ),
                          },
                        });
                      }}
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-5 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">
                      Relevant Coursework
                    </label>
                    <textarea
                      value={edu.relevantCoursework}
                      onChange={(e) => {
                        const value = e.target.value;
                        setData({
                          ...data,
                          resume: {
                            ...data.resume,
                            education: data.resume.education.map((it, i) =>
                              i === index ? { ...it, relevantCoursework: value } : it,
                            ),
                          },
                        });
                      }}
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
            <hr className="my-10"></hr>
            <div className="mt-10">
              <h1>Skills</h1>
              <div className="mt-5 flex">
                <label className="w-1/5 text-lg opacity-50">Languages</label>
                <div className="ml-10 flex w-4/5 flex-col">
                  <textarea
                    value={data.resume.skills.languages}
                    onChange={(e) => {
                      const newSkills = {
                        ...data.resume.skills,
                        languages: e.target.value,
                      };
                      setData({
                        ...data,
                        resume: { ...data.resume, skills: newSkills },
                      });
                    }}
                    className="w-full rounded-md border-2 p-2 shadow-lg"
                  ></textarea>
                </div>
              </div>
              <div className="mt-5 flex">
                <label className="w-1/5 text-lg opacity-50">
                  Software & OS
                </label>
                <div className="ml-10 flex w-4/5 flex-col">
                  <textarea
                    value={data.resume.skills.softwareAndOS ?? ""}
                    onChange={(e) => {
                      const newSkills = {
                        ...data.resume.skills,
                        softwareAndOS: e.target.value,
                      };
                      setData({
                        ...data,
                        resume: { ...data.resume, skills: newSkills },
                      });
                    }}
                    className="w-full rounded-md border-2 p-2 shadow-lg"
                  ></textarea>
                </div>
              </div>
            </div>
            <hr className="my-10"></hr>
            <div className="mt-10">
              <h1>Projects</h1>
              <div className="my-10">
                <EditButton onClick={handleAddResumeProject}>
                  Add Project +
                </EditButton>
              </div>
              {data.resume.projects.map((project, index) => (
                <div key={project.id} className="mt-5">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{project.title}</h1>
                    <EditButton
                      onClick={() => handleDeleteResumeProject(project.id)}
                    >
                      Delete
                    </EditButton>
                  </div>
                  <div className="mt-5 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Title</label>
                    <input
                      value={project.title}
                      onChange={(e) =>
                        handleEditResumeProject(index, {
                          ...project,
                          title: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
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
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Location</label>
                    <input
                      value={project.location}
                      onChange={(e) =>
                        handleEditResumeProject(index, {
                          ...project,
                          location: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Dates</label>
                    <input
                      value={project.dates}
                      onChange={(e) =>
                        handleEditResumeProject(index, {
                          ...project,
                          dates: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex">
                    <label className="w-1/5 text-lg opacity-50">Details</label>
                    <div className="ml-10 flex w-4/5 flex-col">
                      <textarea
                        rows={5}
                        value={project.details}
                        onChange={(e) =>
                          handleEditResumeProject(index, {
                            ...project,
                            details: e.target.value,
                          })
                        }
                        placeholder="Enter each detail on a new line."
                        className="rounded-md border-2 p-2 shadow-lg"
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
                <EditButton onClick={handleAddHonor}>
                  Add Honor +
                </EditButton>
              </div>
              {data.resume.honors.map((honor, index) => (
                <div key={honor.id} className="mt-5">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{honor.title}</h1>
                    <EditButton
                      onClick={() => handleDeleteHonor(honor.id)}
                    >
                      Delete
                    </EditButton>
                  </div>
                  <div className="mt-5 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Title</label>
                    <input
                      value={honor.title}
                      onChange={(e) =>
                        handleEditHonor(index, {
                          ...honor,
                          title: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Event</label>
                    <input
                      value={honor.event ?? ""}
                      onChange={(e) =>
                        handleEditHonor(index, {
                          ...honor,
                          event: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Location</label>
                    <input
                      value={honor.location}
                      onChange={(e) =>
                        handleEditHonor(index, {
                          ...honor,
                          location: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
                      type="text"
                    ></input>
                  </div>
                  <div className="mt-2 flex items-center">
                    <label className="w-1/5 text-lg opacity-50">Year</label>
                    <input
                      value={honor.year}
                      onChange={(e) =>
                        handleEditHonor(index, {
                          ...honor,
                          year: e.target.value,
                        })
                      }
                      className="ml-10 w-4/5 rounded-md border-2 p-2 shadow-lg"
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
