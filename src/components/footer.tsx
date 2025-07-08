"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRss, faRobot, faUser } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
  return (
    <footer className="mt-24 flex flex-col items-center gap-4 py-8 text-sm text-muted-foreground">
      {/* Static resource links */}
      <p className="flex gap-6">
        {/* RSS feed */}
        <a
          href="/feed.xml"
          className="flex items-center gap-1 hover:underline"
        >
          <FontAwesomeIcon icon={faRss} className="h-4 w-4" />
          RSS
        </a>

        {/* robots.txt */}
        <a
          href="/robots.txt"
          className="flex items-center gap-1 hover:underline"
        >
          <FontAwesomeIcon icon={faRobot} className="h-4 w-4" />
          robots.txt
        </a>

        {/* humans.txt */}
        <a
          href="/humans.txt"
          className="flex items-center gap-1 hover:underline"
        >
          <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
          humans.txt
        </a>
      </p>

      {/* Copyright */}
      <p>© {new Date().getFullYear()} Yiqing Sun</p>
    </footer>
  );
}
