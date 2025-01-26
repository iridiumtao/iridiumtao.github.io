import { Popover } from "@headlessui/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Button from "../Button";
// Local Data
import data from "../../data/portfolio.json";

const Header = ({ handleProjectScroll, handleWorkScroll, handleAboutScroll, isHome }) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { name, showBlog, showResume, darkMode } = data;

  useEffect(() => {
    setMounted(true);
  }, []);

  // get navigation items
  const getNavItems = () => {
    const baseNavItems = isHome
      ? [
        { label: 'Project', onClick: handleProjectScroll },
        { label: 'Work', onClick: handleWorkScroll },
        { label: 'About', onClick: handleAboutScroll },
      ]
      : [
        { label: 'Home', href: '/', isInternal: true },
      ];

    // common buttons
    const commonNavItems = [
      showBlog && { label: 'Blog', href: '/blog', isInternal: true },
      showResume && { label: 'Resume', href: '/resume', isInternal: true },
      { label: 'Contact', href: 'mailto:c.tao@nyu.edu' },
    ].filter(Boolean);

    return [...baseNavItems, ...commonNavItems];
  };

  // Theme toggle button
  const ThemeToggle = () => {
    if (!mounted || !theme || !darkMode) return null;

    return (
      <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        <img
          className="h-6"
          src={`/images/${theme === "dark" ? "moon.svg" : "sun.svg"}`}
          alt="theme toggle"
        />
      </Button>
    );
  };

  // Mobile Menu
  const MobileMenu = () => (
    <Popover className="block tablet:hidden mt-5">
      {({ open }) => (
        <>
          <div className="flex items-center justify-between p-2 laptop:p-0">
            <h1
              onClick={() => router.push("/")}
              className="font-medium p-2 laptop:p-0 link"
            >
              {name}
            </h1>

            <div className="flex items-center">
              <ThemeToggle />
              <Popover.Button>
                <img
                  className="h-5"
                  src={`/images/${
                    !open
                      ? theme === "dark"
                        ? "menu-white.svg"
                        : "menu.svg"
                      : theme === "light"
                        ? "cancel.svg"
                        : "cancel-white.svg"
                  }`}
                  alt="menu"
                />
              </Popover.Button>
            </div>
          </div>
          <Popover.Panel
            className={`absolute right-0 z-10 w-11/12 p-4 ${
              theme === "dark" ? "bg-slate-800" : "bg-white"
            } shadow-md rounded-md`}
          >
            <div className="grid grid-cols-1">
              {getNavItems().map((item, index) => (
                <Button key={index} {...item}>
                  {item.label}
                </Button>
              ))}
            </div>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );

  // Desktop Menu
  const DesktopMenu = () => (
    <div
      className={`mt-10 hidden flex-row items-center justify-between sticky ${
        theme === "light" && "bg-white"
      } dark:text-white top-0 z-10 tablet:flex`}
    >
      <h1
        onClick={() => router.push("/")}
        className="font-medium cursor-pointer mob:p-2 laptop:p-0"
      >
        {name}
      </h1>
      <div className="flex">
        {getNavItems().map((item, index) => (
          <Button key={index} {...item}>
            {item.label}
          </Button>
        ))}
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <>
      <MobileMenu />
      <DesktopMenu />
    </>
  );
};

export default Header;
