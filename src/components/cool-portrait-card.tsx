/**
 * CoolPortraitCard: Wrapper that applies a 3D mouse-follow tilt effect.
 * Used on the About section portrait image (desktop only).
 */
"use client";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

export default function CoolPortraitCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CardContainer className={className}>
      <CardBody>
        <CardItem translateZ="50">{children}</CardItem>
      </CardBody>
    </CardContainer>
  );
}
