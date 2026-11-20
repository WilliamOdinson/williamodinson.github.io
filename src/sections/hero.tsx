/**
 * Hero: Landing section of the homepage.
 * Contains the animated greeting, Animoji video avatar,
 * taglines, social icons, and résumé download link.
 */
import { author, resume, site } from "@/lib/site.config.mjs";

import ContactList from "@/components/contact-list";
import MotionText from "@/components/motion-text";
import MotionDiv from "@/components/motion-div";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function Hero() {
  return (
    <section className="my-8 flex flex-col items-center justify-center">
      {/* Greeting */}
      <h1 className="mb-4 text-[1.4rem] md:text-[2rem]">
        <MotionText>{`Hi, I'm ${author.name}! 👋`}</MotionText>
      </h1>

      {/* Animoji video avatar */}
      <div className="safari-mask-fix relative overflow-hidden rounded-full p-3 md:p-4">
        <MotionDiv className="h-[170px] w-[170px] md:h-[190px] md:w-[190px]">
          <video
            className="
              h-[80%] w-[80%]
              object-contain
            "
            width={152}
            height={152}
            muted
            autoPlay
            loop
            playsInline
            aria-label="Animated Animoji avatar of William Sun"
            role="img"
          >
            <source src="/animoji.mov" type='video/quicktime; codecs="hvc1"' />
            <source src="/animoji.webm" type="video/webm" />
          </video>
        </MotionDiv>
      </div>

      {/* Animated taglines */}
      <div className="text-[2rem] font-bold md:text-[2.7rem]">
        <MotionDiv delayOffset={0.4}>Software Developer 🧑🏻‍💻</MotionDiv>
      </div>
      <div className="text-[2rem] font-bold md:text-[2.7rem]">
        <MotionDiv delayOffset={0.5}>Fitness Enthusiast 🏋🏻‍♂️</MotionDiv>
      </div>

      {/* Introductory text */}
      <div className="my-6 flex w-full flex-col gap-2 text-center lg:w-[50%]">
        <MotionDiv delayOffset={0.6}>
          <p>Welcome to my personal page!</p>
        </MotionDiv>
        <MotionDiv delayOffset={0.65}>
          <p>
            Build cool stuff, learn new things, and share my journey with
            others.
          </p>
        </MotionDiv>
      </div>

      {/* Social / contact icons */}
      <div className="my-5">
        <ContactList delayOffset={0.5} />
      </div>

      {/* Résumé download button, omitted while the résumé is hidden in site.config */}
      {!resume.hidden && (
        <MotionDiv delayOffset={1.4}>
          <Button asChild>
            <a
              href={`${site.url}/resume.pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View My Résumé
            </a>
          </Button>
        </MotionDiv>
      )}
    </section>
  );
}
