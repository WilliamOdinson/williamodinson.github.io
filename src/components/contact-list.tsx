/**
 * ContactList: Row of social/contact icon buttons with tooltips.
 * Renders icons from Font Awesome; each icon adapts its color for dark mode.
 */
"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faLinkedin,
  faXTwitter,
  faTiktok,
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
import { useTheme } from "@/components/theme-provider";

/** Descriptor for a single contact channel. */
type Contact = {
  name: string;
  href: string;
  icon: import("@fortawesome/fontawesome-svg-core").IconDefinition;
  color: string;       // Icon color for light mode
  colorDark?: string;  // Override for dark mode (falls back to `color`)
};

/** All social/contact links displayed in the hero section. */
const contacts: Contact[] = [
  {
    name: "earthsuperman@outlook.com",
    href: "mailto:earthsuperman@outlook.com",
    icon: faEnvelope,
    color: "#EA4335",
  },
  {
    name: "X",
    href: "https://x.com/william18652",
    icon: faXTwitter,
    color: "#000000",
    colorDark: "#FFFFFF",
  },
  {
    name: "GitHub",
    href: "https://github.com/williamodinson",
    icon: faGithub,
    color: "#181717",
    colorDark: "#FFFFFF",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/williamodinson",
    icon: faLinkedin,
    color: "#0A66C2",
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@william18652",
    icon: faTiktok,
    color: "#000000",
    colorDark: "#FFFFFF",
  },
  {
    name: "Steam",
    href: "https://steamcommunity.com/profiles/76561199087095739/",
    icon: faSteam,
    color: "#000000",
    colorDark: "#FFFFFF",
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
  const { theme } = useTheme();

  return (
    <TooltipProvider delayDuration={0}>
      <MotionList delayOffset={delayOffset} showWhenInView={showWhenInView}>
        {contacts.map(({ name, href, icon, color, colorDark }) => {
          const iconColor = theme === "dark" ? (colorDark ?? color) : color;

          return (
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
                    <FontAwesomeIcon
                      icon={icon}
                      className="size-6"
                      style={{ color: iconColor }}
                    />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </MotionList>
    </TooltipProvider>
  );
}
