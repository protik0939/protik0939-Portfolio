"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function PortfolioAnimations() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      lerp: 0.1,
    });

    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    const syncScrollTrigger = () => ScrollTrigger.update();
    lenis.on("scroll", syncScrollTrigger);

    const revealItems = gsap.utils.toArray("[data-reveal]") as HTMLElement[];
    revealItems.forEach((item: HTMLElement, index: number) => {
      gsap.fromTo(
        item,
        { autoAlpha: 0, y: 48 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          delay: (index % 4) * 0.05,
          scrollTrigger: {
            trigger: item,
            start: "top 82%",
            once: true,
          },
        },
      );
    });

    const floatingAnimation = gsap.to("[data-float]", {
      y: -18,
      duration: 2.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      floatingAnimation.kill();
      ScrollTrigger.getAll().forEach((trigger: { kill: () => void }) => trigger.kill());
      lenis.off("scroll", syncScrollTrigger);
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
