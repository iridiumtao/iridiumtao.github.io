import {Popover, Transition} from "@headlessui/react";
import { Fragment } from 'react';
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Button from "../Button";
import Image from "next/image";
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
        <Image
          width={24}
          height={24}
          src={`/images/${theme === "dark" ? "moon.svg" : "sun.svg"}`}
          alt="theme toggle"
        />
      </Button>
    );
  };

  // Mobile Menu
  const MobileMenu = () => (
    <Popover className="block tablet:hidden fixed top-0 left-0 right-0 z-50 bg-opacity-50">
      {({ open, close }) => (
        <>
          <div className={`
            flex items-center justify-between px-4 py-1
            backdrop-blur-sm
            ${theme === "light"
                      ? "bg-white/50"  // transparent white background
                      : "bg-gray-900/50 text-white"  // transparent dark background
                    }
        `}>
            <h1
              onClick={() => router.push("/")}
              className="font-medium text-xl"
            >
              {name}
            </h1>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Popover.Button className="focus:outline-none">
                <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E8E4DE] dark:hover:bg-[#6B5B4E] transition-colors">
                  <Image
                    width={16}
                    height={16}
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
                </div>
              </Popover.Button>
            </div>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Popover.Panel className="fixed top-0 right-0 h-full w-64 z-50">
              <div className={`
              h-full w-full
              ${theme === "dark"
                ? "bg-gradient-to-b from-[#6B5B4EF3] to-[#4A4036F3]"
                : "bg-gradient-to-b from-[#E8E4DEF3] to-[#D4C5B9F3]"
              }
              shadow-xl
            `}>
                {/* close button */}
                <div className="flex justify-end p-4">
                  <Popover.Button className="focus:outline-none">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                      <Image
                        width={16}
                        height={16}
                        src={`/images/${theme === "dark" ? "cancel-white.svg" : "cancel.svg"}`}
                        alt="close menu"
                      />
                    </div>
                  </Popover.Button>
                </div>

                {/* nav items */}
                <div className="flex flex-col items-center justify-center h-[calc(100%-5rem)] space-y-6 p-4">
                  {getNavItems(true).map((item, index) => (
                    <Button
                      key={index}
                      {...item}
                      // * uncomment these lines to enable auto close menu *
                      // onClick={() => {
                      //   close(); // close the menu
                      //   item.onClick && item.onClick(); // scroll to the section when it's a scroll button
                      // }}
                      className={`
                      w-full text-center py-3 px-4 rounded-xl
                      ${theme === "dark"
                                      ? "hover:bg-white/10"
                                      : "hover:bg-black/10"
                                    }
                      transition-colors duration-200
                      text-lg font-medium
                    `}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
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