/** Real R3F + drei version of the sculptural facial explorer.
 * The model is a conceptual sculpture, not a medical reconstruction or patient portrait.
 */
import React, {useEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {Canvas, useFrame} from '@react-three/fiber';
import {Float, OrbitControls, Html, Environment} from '@react-three/drei';
import {create} from 'zustand';
import {motion} from 'framer-motion';

export const useFaceStore=create(set=>({selected:null,setSelected:(selected)=>set({selected})}));
const zones=[
  ['testa','Testa',0,.50,.77],['olhos','Olhos',.31,.16,.67],
  ['macas','Maçãs do rosto',-.38,-.15,.64],['labios','Lábios',0,-.36,.88],
  ['mandibula','Contorno',.41,-.58,.43],['pescoco','Pescoço',0,-1.20,.27]
];
function sculptedHead(){
 const geometry=new THREE.SphereGeometry(1,92,72);const p=geometry.attributes.position;
 const g=(x,m,w)=>Math.exp(-Math.pow((x-m)/w,2));
 for(let i=0;i<p.count;i++){
  const a=p.getX(i),b=p.getY(i),c=p.getZ(i),x=a*.77,y=b*1.03+.15;
  let z=c*.67;
  if(c>0){z+=c*c*(.27*g(a,0,.19)*g(b,-.03,.33)+.23*g(a,0,.17)*g(b,-.29,.17)+.09*g(a,0,.2)*g(b,-.55,.075)+.056*g(a,0,.32)*g(b,-.81,.14)+.07*(g(a,-.49,.29)+g(a,.49,.29))*g(b,-.24,.27)-.05*(g(a,-.4,.14)+g(a,.4,.14))*g(b,.16,.13));}
  p.setXYZ(i,x,y,z);
 }
 p.needsUpdate=true;geometry.computeVertexNormals();return geometry;
}
function Zones(){
 const selected=useFaceStore(s=>s.selected),setSelected=useFaceStore(s=>s.setSelected);
 return zones.map(([id,label,x,y,z])=>(
  <Html key={id} position={[x,y,z]} center zIndexRange={[11,1]}>
    <button type="button" className={`r3f-zone ${selected===id?'r3f-zone-active':''}`} aria-label={`Explorar ${label}`} title={label}
    onClick={e=>{e.stopPropagation();setSelected(id);window.__anaSelectArea?.(id);}}/>
  </Html>
 ));
}
function Head(){
 const geometry=useMemo(sculptedHead,[]),group=useRef();
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 useFrame((state,delta)=>{if(group.current)group.current.rotation.y=Math.sin(state.clock.elapsedTime*.23)*.035;});
 return <group ref={group} rotation={[.02,-.12,0]} position={[0,.18,0]}>
   <mesh position={[0,-1.62,-.07]} scale={[1.14,.38,.51]} castShadow><sphereGeometry args={[1,64,48]}/><meshPhysicalMaterial color="#b78b77" metalness={.02} roughness={.33} clearcoat={.5} clearcoatRoughness={.26}/></mesh>
   <mesh position={[0,-1.13,-.06]} scale={[.33,.56,.31]} castShadow><sphereGeometry args={[1,48,32]}/><meshPhysicalMaterial color="#c69b84" roughness={.35} clearcoat={.55}/></mesh>
   <mesh geometry={geometry} castShadow receiveShadow><meshPhysicalMaterial color="#d0a893" metalness={.04} roughness={.29} clearcoat={.9} clearcoatRoughness={.23} sheen={.6} sheenColor="#f4dac2" /></mesh>
   <Zones/>
 </group>;
}
function Scene(){return <>
 <ambientLight intensity={1.45} color="#fff0df"/>
 <directionalLight color="#fff3e4" intensity={4.2} position={[-4,7,7]}/>
 <directionalLight color="#c99480" intensity={1.6} position={[6,1,-3]}/>
 <spotLight color="#fff8f2" position={[4,-2,8]} intensity={2.2} angle={.72} penumbra={.8}/>
 <Float speed={.8} rotationIntensity={.04} floatIntensity={.14}><Head /></Float>
 <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={1.2} maxPolarAngle={1.85} minAzimuthAngle={-.9} maxAzimuthAngle={.9} rotateSpeed={.55}/>
 </>}
export default function FaceScene(){
 return <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1.2}}
 style={{position:'absolute',inset:0,zIndex:2,touchAction:'pan-y'}} aria-label="Busto tridimensional artístico rotacionável">
 <style>{`.r3f-zone{height:20px;width:20px;border-radius:50%;border:1px solid #efd2b9;background:#cf9f8066;box-shadow:0 0 0 7px #dbad8e27,0 0 20px #fae4c3b0;cursor:pointer}.r3f-zone:after{content:'';display:block;height:6px;width:6px;position:absolute;top:6px;left:6px;border-radius:50%;background:#fae3cf}.r3f-zone-active,.r3f-zone:hover{transform:scale(1.25);background:#f2dbc8}`}</style>
 <Canvas dpr={[1,1.5]} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} camera={{position:[0,.1,4.4],fov:38,near:.1,far:50}} style={{background:'transparent'}}>
 <Scene />
 </Canvas></motion.div>;
}
