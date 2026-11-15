// StrandStone / 06 — baked, tileable PBR basalt. No per-fragment procedural loops.
// Four shared 128px material variants; standard Three.js texture sampling and mipmaps.
const SIZE=128, VARIANTS=4;
const fract=x=>x-Math.floor(x);
const hash=(x,y,seed)=>fract(Math.sin(x*127.1+y*311.7+seed*74.7)*43758.5453);
function noise(x,y,frequency,seed){
 const a=x*frequency,b=y*frequency,ix=Math.floor(a),iy=Math.floor(b);
 let fx=fract(a),fy=fract(b);fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
 const h=(dx,dy)=>hash((ix+dx+frequency)%frequency,(iy+dy+frequency)%frequency,seed);
 return (h(0,0)*(1-fx)+h(1,0)*fx)*(1-fy)+(h(0,1)*(1-fx)+h(1,1)*fx)*fy;
}
function build(T,seed){
 const count=SIZE*SIZE,height=new Float32Array(count),tone=new Float32Array(count),rough=new Float32Array(count);
 const index=(x,y)=>((y+SIZE)%SIZE)*SIZE+(x+SIZE)%SIZE;
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
  const u=x/SIZE,v=y/SIZE,k=index(x,y);
  // Layered erosion and mineral granularity. No Voronoi pits, circles or square masks.
  const broad=noise(u,v,4,seed),medium=noise(u,v,12,seed+11);
  const fine=noise(u,v,32,seed+23),micro=noise(u,v,64,seed+37);
  const ridge=Math.abs(medium-.5);
  height[k]=.50*broad+.32*medium+.13*fine+.05*micro-.07*ridge;
  tone[k]=.58*broad+.26*medium+.16*fine;
  rough[k]=.68+.18*medium+.10*micro;
 }
 const albedo=new Uint8Array(count*4),normals=new Uint8Array(count*4),rmap=new Uint8Array(count*4);
 const clamp=v=>Math.max(0,Math.min(255,Math.round(v)));
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
  const k=index(x,y),o=k*4;
  const t=tone[k],warm=Math.max(0,t-.54);
  albedo[o]=clamp(76+58*t+21*warm);
  albedo[o+1]=clamp(79+57*t+7*warm);
  albedo[o+2]=clamp(82+55*t-9*warm);
  albedo[o+3]=255;
  const dx=(height[index(x+1,y)]-height[index(x-1,y)])*4.0;
  const dy=(height[index(x,y+1)]-height[index(x,y-1)])*4.0;
  const nx=-dx,ny=-dy,inv=1/Math.hypot(nx,ny,1);
  normals[o]=clamp(127.5+127.5*nx*inv);
  normals[o+1]=clamp(127.5+127.5*ny*inv);
  normals[o+2]=clamp(127.5+127.5*inv);
  normals[o+3]=255;
  rmap[o]=255;rmap[o+1]=clamp(rough[k]*255);rmap[o+2]=255;rmap[o+3]=255;
 }
 function tex(data,srgb=false){
  const t=new T.DataTexture(data,SIZE,SIZE,T.RGBAFormat,T.UnsignedByteType);
  t.wrapS=t.wrapT=T.RepeatWrapping;
  t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;
  t.generateMipmaps=true;
  if(srgb)t.colorSpace=T.SRGBColorSpace;
  t.needsUpdate=true;return t;
 }
 return new T.MeshStandardMaterial({
  name:'StrandStone / 05 · Baked basalt',color:0xffffff,metalness:0,
  roughness:1,map:tex(albedo,true),normalMap:tex(normals),
  normalScale:new T.Vector2(1,1),roughnessMap:tex(rmap)
 });
}
export function createStrandStone(T,{variant=0}={}){
 // Cache once per renderer library instance; no per-brick GPU texture allocation.
 let cache=createStrandStone.cache.get(T);
 if(!cache){cache=Array.from({length:VARIANTS},(_,i)=>build(T,101+i*47));createStrandStone.cache.set(T,cache);}
 return cache[((variant%VARIANTS)+VARIANTS)%VARIANTS];
}
createStrandStone.cache=new WeakMap();
