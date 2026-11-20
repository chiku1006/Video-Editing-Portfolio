"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

export function PageMotion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scope = container.current;
    if (!scope) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", (context) => {
      const entering = scope.querySelectorAll("[data-page-enter]");
      const title = scope.querySelectorAll("[data-title-enter]");
      if (title.length) {
        gsap.fromTo(
          title,
          { yPercent: 104 },
          {
            yPercent: 0,
            duration: 0.74,
            ease: "power4.out",
            stagger: 0.09,
            clearProps: "transform",
          },
        );
      }
      if (entering.length) {
        gsap.fromTo(
          entering,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.48,
            ease: "power3.out",
            stagger: 0.055,
            clearProps: "opacity,transform",
          },
        );
      }

      const sections = scope.querySelectorAll("[data-scroll-reveal]");
      if (!sections.length || !("IntersectionObserver" in window)) return;
      gsap.set(sections, { opacity: 0, y: 20 });
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .map((entry) => entry.target);
          if (!visible.length) return;
          visible.forEach((element) => observer.unobserve(element));
          context.add(() => {
            gsap.to(visible, {
              opacity: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.065,
              ease: "power3.out",
              clearProps: "opacity,transform",
            });
          });
        },
        { threshold: 0.1 },
      );

      sections.forEach((section) => observer.observe(section));
      function revealFocused(event: FocusEvent) {
        if (!(event.target instanceof Element)) return;
        const section = event.target.closest("[data-scroll-reveal]");
        if (!section || !scope?.contains(section)) return;
        observer.unobserve(section);
        gsap.killTweensOf(section);
        gsap.set(section, { clearProps: "opacity,transform" });
      }
      scope.addEventListener("focusin", revealFocused);
      return () => {
        observer.disconnect();
        scope.removeEventListener("focusin", revealFocused);
      };
    });

    return () => media.revert();
  }, []);

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  );
}
