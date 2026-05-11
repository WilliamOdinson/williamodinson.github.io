/**
 * GridBackground: Fixed full-screen dot-grid background pattern.
 * Uses a CSS radial-gradient to draw subtle dots; adapts for dark mode.
 */
export default function GridBackground() {
  return (
    <div
      className="
        fixed inset-0 -z-10 h-full w-full
        bg-white bg-[size:24px_24px]
        bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1.5px,transparent_2px)]
        dark:bg-[#030816]
        dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1.5px,transparent_2px)]
      "
    />
  );
}
