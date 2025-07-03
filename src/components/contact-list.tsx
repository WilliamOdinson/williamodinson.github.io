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

/**
 * Contact item shape.
 * `color` - official brand-color hex; applied directly to the icon.
 */
type Contact = {
  name: string;
  href: string;
  icon: any; // FontAwesome icon definition
  color: string; // Hex color string
};

/**
 * Centralised list of contact points.
 * Background is kept neutral; brand colour is applied to the icon itself.
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
  },
];

export default function ContactList({
  delayOffset = 0,
  showWhenInView = true,
}: {
  delayOffset?: number;
  showWhenInView?: boolean;
}) {
  return (
    <MotionList delayOffset={delayOffset} showWhenInView={showWhenInView}>
      {contacts.map(({ name, href, icon, color }, index) => (
        <TooltipProvider delayDuration={0} key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Ghost button so only the icon (with its own color) is visible */}
              <Button
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full bg-transparent p-3 hover:bg-gray-200 dark:hover:bg-gray-700 md:h-12 md:w-12",
                )}
                asChild
                aria-label={name}
              >
                <Link href={href} target="_blank" aria-label={name}>
                  <FontAwesomeIcon
                    icon={icon}
                    className="size-6"
                    style={{ color }}
                  />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>
              <p>{name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </MotionList>
  );
}
