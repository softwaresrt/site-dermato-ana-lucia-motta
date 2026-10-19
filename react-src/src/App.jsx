import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {motion} from 'framer-motion';
import siteMarkup from './site.html?raw';
import FaceScene from './FaceScene.jsx';

/** The authored, accessible static layout is reused verbatim in the React edition.
 * Existing interaction module attaches after React mounts; R3F takes over the WebGL map.
 * GSAP and Lenis provide optional progressive enhancements.
 */
export default function App(){
 const started=useRef(false),[faceTarget,setFaceTarget]=useState(null);
 useEffect(()=>{
  if(started.current)return;started.current=true;
  window.__ANA_R3F_ACTIVE=true;
  window.__REACT_ENHANCED=true;
  const slot=document.getElementById('map-viewport');setFaceTarget(slot);
  let lenis=null,frame=null,anim=[];
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    gsap.registerPlugin(ScrollTrigger);
    lenis=new Lenis({smoothWheel:true,wheelMultiplier:.9,touchMultiplier:1.05,duration:1.25});
    const tick=(time)=>{lenis.raf(time);frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);
    lenis.on('scroll',ScrollTrigger.update);
  }
  import('./site-interactions.js').then(()=>{
   // A shared static document keeps dialogs, labels and controls identical across builds.
   // GSAP reveals are limited to desktop visual enhancement and respect reduced motion.
   if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   document.querySelectorAll('.intro .reveal, .treatments .reveal, .about .reveal, .notes .reveal').forEach(el=>{
     anim.push(gsap.fromTo(el,{y:20,autoAlpha:.5},{y:0,autoAlpha:1,duration:.95,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
   });
  }).catch(console.error);
  return()=>{if(frame)cancelAnimationFrame(frame);anim.forEach(a=>a.kill());lenis?.destroy();ScrollTrigger.getAll().forEach(t=>t.kill());};
 },[]);
 return <>
 <div dangerouslySetInnerHTML={{__html:siteMarkup}} />
 {faceTarget&&createPortal(<FaceScene/>,faceTarget)}
 </>;
}
