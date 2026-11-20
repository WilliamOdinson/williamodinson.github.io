/**
 * ContactList: Row of social/contact icon buttons with tooltips.
 * Renders icons from Font Awesome in brand colors, with a light variant for
 * the dark-on-dark brands in dark mode.
 */
"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faLinkedin,
  faXTwitter,
  faSteam,
} from "@fortawesome/free-brands-svg-icons";

import MotionList from "./motion-list";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Descriptor for a single contact channel. */
type Contact = {
  name: string;
  href: string;
  icon: import("@fortawesome/fontawesome-svg-core").IconDefinition;
  /** Tailwind text color classes for the icon. */
  color: string;
};

/** All social/contact links displayed in the hero section. */
const contacts: Contact[] = [
  {
    name: "earthsuperman@outlook.com",
    href: "mailto:earthsuperman@outlook.com",
    icon: faEnvelope,
    color: "text-[#EA4335]",
  },
  {
    name: "X",
    href: "https://x.com/william18652",
    icon: faXTwitter,
    color: "text-black dark:text-white",
  },
  {
    name: "GitHub",
    href: "https://github.com/williamodinson",
    icon: faGithub,
    color: "text-[#181717] dark:text-white",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/williamodinson",
    icon: faLinkedin,
    color: "text-[#0A66C2]",
  },
  {
    name: "Steam",
    href: "https://steamcommunity.com/profiles/76561199087095739/",
    icon: faSteam,
    color: "text-black dark:text-white",
  },
];

/**
 * @param delayOffset  - Extra delay (seconds) before the stagger animation starts.
 * @param showWhenInView - If true, animate only when scrolled into view.
 */
export default function ContactList({
  delayOffset = 0,
  showWhenInView = true,
}: {
  delayOffset?: number;
  showWhenInView?: boolean;
}) {
  return (
    <TooltipProvider delayDuration={0}>
      <MotionList delayOffset={delayOffset} showWhenInView={showWhenInView}>
        {contacts.map(({ name, href, icon, color }) => (
          <Tooltip key={name}>
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full bg-transparent p-3",
                  "hover:bg-secondary md:h-12 md:w-12",
                )}
                asChild
                aria-label={name}
              >
                <Link href={href} target="_blank" aria-label={name}>
                  <FontAwesomeIcon icon={icon} className={cn("size-6", color)} />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>
              <p>{name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </MotionList>
    </TooltipProvider>
  );
}
