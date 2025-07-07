"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faLinkedin,
  faXTwitter,
  faTiktok,
  faInstagram,
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

/** Contact item shape */
type Contact = {
  name: string;
  href: string;
  icon: any; // FontAwesome icon definition
  color: string; // light-mode color
  colorDark?: string; // optional override for dark mode
};

/**
 * Centralized list of contact points.
 * Background is kept neutral; brand color is applied to the icon itself.
 */
const contacts: Contact[] = [
  {
    name: "earthsuperman@outlook.com",
    href: "mailto:earthsuperman@outlook.com",
    icon: faEnvelope,
    color: "#EA4335",
  },
  {
    name: "X (not registered yet)",
    href: "https://twitter.com/",
    icon: faXTwitter,
    color: "#000000",
    colorDark: "#FFFFFF",
  },
  {
    name: "Instagram (not registered yet)",
    href: "https://instagram.com/",
    icon: faInstagram,
    color: "#E4405F",
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
];

export default function ContactList({
  delayOffset = 0,
  showWhenInView = true,
}: {
  delayOffset?: number;
  showWhenInView?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <MotionList delayOffset={delayOffset} showWhenInView={showWhenInView}>
      {contacts.map(({ name, href, icon, color, colorDark }, idx) => {
        // choose color based on current theme
        const iconColor = theme === "dark" ? colorDark ?? color : color;

        return (
          <TooltipProvider delayDuration={0} key={idx}>
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Transparent "ghost" button */}
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
          </TooltipProvider>
        );
      })}
    </MotionList>
  );
}
