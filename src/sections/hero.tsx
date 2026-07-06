/**
 * Hero: Landing section of the homepage.
 * Contains the animated greeting, Animoji video avatar,
 * taglines, social icons, and résumé download link.
 */
"use client";

import Link from "next/link";
import { author } from "@/lib/site.config.mjs";

import ContactList from "@/components/contact-list";
import MotionText from "@/components/motion-text";
import MotionDiv from "@/components/motion-div";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const RESUME_URL = "https://wsun.io/resume.pdf";

export default function Hero() {
  return (
    <section className="my-8 flex flex-col items-center justify-center">
      {/* Greeting */}
      <h1 className="mb-4 text-[1.4rem] md:text-[2rem]">
        <MotionText delayOffset={0}>
          {`Hi, I'm ${author.name}! 👋`}
        </MotionText>
      </h1>

      {/* Animoji video avatar */}
      <div className="safari-mask-fix relative overflow-hidden rounded-full p-3 md:p-4">
        {/* 外层容器保持原来的大小，并使用 flex 居中 */}
        <MotionDiv className="relative flex items-center justify-center h-[170px] w-[170px] md:h-[190px] md:w-[190px]">
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
            style={{ backgroundColor: "transparent" }}
            src="/animoji.webm"
          />
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
        <ContactList delayOffset={0.7} showWhenInView={false} />
      </div>

      {/* Résumé download button (opens Google Docs viewer) */}
      <MotionDiv delayOffset={0.8}>
        <Button asChild>
          <Link
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Eye className="mr-2 h-4 w-4" />
            View My Résumé
          </Link>
        </Button>
      </MotionDiv>
    </section>
  );
}
