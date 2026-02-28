/**
 * About: Biography section on the homepage.
 * Shows a short personal introduction alongside a portrait photo.
 * The portrait uses a 3D tilt effect on desktop and a hover-scale on mobile.
 */
import CoolPortraitCard from "@/components/cool-portrait-card";
import Image from "next/image";
import MotionDiv from "@/components/motion-div";
import { author } from "@/lib/site.config.mjs";

export default function About() {
  return (
    <section
      id="about"
      className="mx-auto my-16 flex flex-col items-center justify-center gap-4 px-2 md:my-20 md:max-w-full lg:flex-row lg:items-start lg:gap-16"
    >
      {/* Bio text column */}
      <div className="order-2 lg:order-1 lg:w-2/3">
        <MotionDiv delayOffset={0.2}>
          <h2 className="mb-3 w-full text-center md:mb-6">About Me</h2>
        </MotionDiv>
        <article className="flex flex-col gap-4">
          <MotionDiv delayOffset={0.4}>
            <p>
              Hi, I'm {author.name}, a software engineer and current
              Master's student at Carnegie Mellon University.
            </p>
          </MotionDiv>
          <MotionDiv delayOffset={0.5}>
            <p>
              I build backend and cloud-native systems, mostly in Go and Python,
              with a focus on performance and distributed architecture. At CMU's
              School of Computer Science, I TA the 15-619 Cloud Computing
              course, where I design projects that take students through real
              production challenges: large-scale data pipelines, Kubernetes
              deployments, and high-throughput service optimization.
            </p>
          </MotionDiv>
          <MotionDiv delayOffset={0.6}>
            <p>
              I grew up in China, studied Information Systems at Tianjin
              University, and have been writing software ever since. Most of my
              work is open source under the MIT License.
            </p>
          </MotionDiv>
        </article>
      </div>

      {/* Portrait column */}
      <div className="lg:order-2 lg:w-1/3">
        <MotionDiv delayOffset={0.4}>
          {/* Desktop: 3D tilt card */}
          <CoolPortraitCard className="hidden lg:block">
            <Image src="/selfie.jpg"
              alt={author.image.alt}
              width={350}
              height={438}
              className="w-[350px] min-w-[300px] rounded-xl transition-all"
            />
          </CoolPortraitCard>
          {/* Mobile: simple hover-scale */}
          <Image src="/selfie.jpg"
            alt={author.image.alt}
            width={350}
            height={438}
            className="w-[350px] min-w-[300px] rounded-xl transition-all hover:rotate-3 hover:scale-105 lg:hidden"
          />
        </MotionDiv>
      </div>
    </section>
  );
}
