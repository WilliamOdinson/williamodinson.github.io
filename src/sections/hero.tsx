"use client";

import Link from "next/link";

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
        <MotionText delayOffset={0}>
          Hi, I'm Yiqing (William) Sun! 👋
        </MotionText>
      </h1>

      {/* Animoji video avatar */}
      <div className="relative overflow-hidden rounded-full p-3 md:p-4">
        <MotionDiv className="relative">
          <>
            {/* light version visible by default, hidden in dark mode */}
            <video
              className="
                h-[170px] w-[170px] opacity-100 dark:opacity-0
                md:h-[190px] md:w-[190px]
              "
              muted
              autoPlay
              loop
              playsInline
              src="/animoji-light.mp4"
            />

            {/* dark version hidden in light, visible in dark */}
            <video
              className="
                absolute left-0 top-0
                h-[170px] w-[170px] opacity-0 dark:opacity-100
                md:h-[190px] md:w-[190px]
              "
              muted
              autoPlay
              loop
              playsInline
              src="/animoji-dark.mp4"
            />
          </>
        </MotionDiv>
      </div>

      {/* Two animated taglines */}
      <h1>
        <MotionDiv delayOffset={0.8}>Software Development 🧑🏻‍💻</MotionDiv>
      </h1>
      <h1>
        <MotionDiv delayOffset={1}>Fitness Enthusiast 🏋🏻‍♂️</MotionDiv>
      </h1>

      {/* Introductory text */}
      <div className="my-12 flex w-full flex-col gap-2 text-center lg:w-[50%]">
        <MotionDiv delayOffset={1.2}>
          <p>Welcome to my personal page!</p>
        </MotionDiv>
        <MotionDiv delayOffset={1.4}>
          <p>
            Build cool stuff, learn new things, and share my journey with
            others.
          </p>
        </MotionDiv>
      </div>

      {/* Social/contact icons */}
      <div className="my-8">
        <ContactList delayOffset={1.45} showWhenInView={false} />
      </div>

      {/* Résumé download button */}
      <MotionDiv delayOffset={1.6}>
        <Button asChild>
          <Link href="/Resume.pdf" target="_blank" rel="noopener noreferrer">
            <Eye className="mr-2 h-4 w-4" />
            View My Résumé
          </Link>
        </Button>
      </MotionDiv>
    </section>
  );
}
