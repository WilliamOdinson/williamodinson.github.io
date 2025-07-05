import { getAllProjects } from "@/lib/get-projects";
import ProjectsIndex from "@/components/projects-index";

export const metadata = {
  title: "Personal Projects",
  description: "A chronological catalogue of my personal and academic work.",
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 lg:px-28">
      <h1 className="mb-12 text-3xl font-bold dark:text-white">
        Personal Projects
      </h1>
      <ProjectsIndex items={projects} />
    </section>
  );
}
