import CoolPortraitCard from "@/components/cool-portrait-card";
import MotionDiv from "@/components/motion-div";

export default function about() {
  return (
    <section
      id="about"
      className="mx-auto my-16 flex flex-col items-center justify-center gap-4 px-2 md:my-20  md:max-w-full lg:flex-row lg:items-start lg:gap-16"
    >
      <div className="order-2 lg:order-1 lg:w-2/3">
        <MotionDiv delayOffset={0.2}>
          <h2 className="mb-3 w-full text-center md:mb-6">About Me</h2>
        </MotionDiv>
        <article className="flex flex-col gap-4">
          <MotionDiv delayOffset={0.4}>
            <p>
              Hello, I'm William Sun and my Chinese name is
              <span className="whitespace-nowrap">
                {" "}
                孙逸青 (Soo-n Ee-ching, Sūn Yì qīng)
              </span>
              . I'm a full-stack software developer based in Pittsburgh, PA.
            </p>
          </MotionDiv>
          <MotionDiv delayOffset={0.5}>
            <p>
              I graduated from Tianjin University as an Outstanding Graduate,
              earning a Bachelor of Management in Information Management and
              Information Systems. Passionate about the intersection of
              technology and business, I enjoy building software{" "}
              <em>(primarily under the MIT License)</em> that solves real-world
              problems and enhances user experiences.
            </p>
          </MotionDiv>
          <MotionDiv delayOffset={0.6}>
            <p>
              Professionally, I&rsquo;ve thrived in both corporate and tech
              environments. As a Data Analysis Intern at Ernst &amp; Young, I
              deployed advanced analytics to streamline financial-audit
              workflows. Later, at Shanghai Mingchen Mould &amp; Plastic
              Technology, I shifted my focus to software development and
              cross-functional project coordination. These roles deepened my
              understanding of data-science principles and sharpened my ability
              to translate technical insight for stakeholders of all kinds.
            </p>
          </MotionDiv>
        </article>
      </div>
      <div className="lg:order-2 lg:w-1/3">
        <MotionDiv delayOffset={0.4}>
          <CoolPortraitCard className="hidden lg:block">
            <img
              src="/selfie.jpg"
              alt="photo"
              className="w-[350px] min-w-[300px] rounded-xl transition-all"
            />
          </CoolPortraitCard>
        </MotionDiv>
        <MotionDiv delayOffset={0.4}>
          <img
            src="/selfie.jpg"
            alt="photo"
            className="w-[350px] min-w-[300px] rounded-xl transition-all hover:rotate-3 hover:scale-105 lg:hidden"
          />
        </MotionDiv>
      </div>
    </section>
  );
}
