export default function GridBackground() {
  return (
    <div
      className="
        fixed inset-0 -z-10 h-full w-full

        /* light: white base + gray dots */
        bg-white
        bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1.5px,transparent_2px)]
        bg-[size:24px_24px]

        /* dark: rgb(3,8,22) base + white dots */
        dark:bg-[#030816]
        dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1.5px,transparent_2px)]
        dark:bg-[size:24px_24px]
      "
    />
  );
}
