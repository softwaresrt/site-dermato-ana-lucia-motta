import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import siteMarkup from './site.html?raw';

export default function App() {
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    window.__REACT_ENHANCED = true;
    let lenis = null, frame = null, anim = [];
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.registerPlugin(ScrollTrigger);
      lenis = new Lenis({ smoothWheel: true, wheelMultiplier: .9, touchMultiplier: 1.05, duration: 1.25 });
      const tick = (time) => { lenis.raf(time); frame = requestAnimationFrame(tick); };
      frame = requestAnimationFrame(tick);
      lenis.on('scroll', ScrollTrigger.update);
    }
    import('./site-interactions.js').then(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      document.querySelectorAll('.intro .reveal, .treatments .reveal, .about .reveal, .notes .reveal').forEach(el => {
        anim.push(gsap.fromTo(el, { y: 20, autoAlpha: .5 }, { y: 0, autoAlpha: 1, duration: .95, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
      });
    }).catch(console.error);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      anim.forEach(a => a.kill());
      lenis?.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);
  return <div dangerouslySetInnerHTML={{ __html: siteMarkup }} />;
}
