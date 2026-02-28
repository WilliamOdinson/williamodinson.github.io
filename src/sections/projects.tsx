/**
 * FeaturedProjects: Homepage section showcasing top GitHub repositories.
 * Server component: fetches featured projects and sorts by star count,
 * then passes them to the client-side animated ProjectsGrid.
 */
import { getAllProjects } from "@/lib/get-projects";
import ProjectsGrid from "@/components/projects-grid";

export default async function FeaturedProjects() {
  const projects = await getAllProjects({ featured: true });

  /* Sort by GitHub star count, descending. */
  const sorted = [...projects].sort((a, b) => b.stars - a.stars);

  return (
    <section id="projects" className="my-16 space-y-8">
      <h2 className="text-2xl font-bold dark:text-white">
        Featured Repositories
      </h2>
      <ProjectsGrid items={sorted} />
    </section>
  );
}
