// Strand living surface / v1: 4 connected walls, 32x32 cells per wall.
// Each cell is an addressable moss colony; the field is uploaded as one tiny RGBA texture.
// Green channel = living coverage, red channel = soot deposition. No additional geometry.
export function createAccretion(T){
 const side=32,width=side*4,height=side;
 const data=new Uint8Array(width*height*4),moss=new Float32Array(width*height),soot=new Float32Array(width*height);
 const texture=new T.DataTexture(data,width,height,T.RGBAFormat);
 texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearFilter;texture.wrapS=T.ClampToEdgeWrapping;texture.wrapT=T.ClampToEdgeWrapping;texture.needsUpdate=true;
 let elapsed=0,accumulator=0,ticks=0,events=0;
 const index=(face,x,y)=>y*width+((face+4)%4)*side+((x+side)%side);
 const hash=(a,b)=>{let v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v)};
 // Initial colonies: discrete, readable, and on several sides.
 for(const [face,x,y] of [[0,8,2],[1,17,1],[2,26,3],[3,5,2]])moss[index(face,x,y)]=.92;
 function tick(){
  ticks++;
  const next=moss.slice();
  for(let face=0;face<4;face++)for(let y=0;y<height;y++)for(let x=0;x<side;x++){
   const i=index(face,x,y),c=moss[i];
   // Horizontal seams connect around corners; vertical growth branches upward.
   const left=index(face,x-1,y),right=index(face,x+1,y);
   const below=index(face,x,Math.max(0,y-1)),above=index(face,x,Math.min(height-1,y+1));
   const influence=Math.max(moss[left]*.92,moss[right]*.92,moss[below]*1.12,moss[above]*.55);
   const suitability=.48+.52*hash(x+face*side,y);
   if(influence>.16 && hash(i,ticks) < .42*suitability){
    next[i]=Math.min(1,Math.max(c,influence*.92)+.19);
    if(c<.2&&next[i]>=.2)events++;
   }else if(c>0)next[i]=Math.min(1,c+.035);
   // A small localized soot source on wall 0; deposited upward and slowly spread.
   if(face===0){
    const plume=Math.exp(-Math.pow((x-18)/6,2))*Math.max(0,(y-8)/24);
    soot[i]=Math.min(1,soot[i]+plume*.009);
   }
  }
  moss.set(next);
  for(let i=0;i<moss.length;i++){data[i*4]=Math.round(soot[i]*255);data[i*4+1]=Math.round(moss[i]*255);data[i*4+2]=0;data[i*4+3]=255}
  texture.needsUpdate=true;
 }
 tick();
 function update(dt){
  const d=Math.min(Math.max(dt||0,0),.05);elapsed+=d;accumulator+=d;
  while(accumulator>=.12){accumulator-=.12;tick()}
 }
 function inspect(){let occupied=0;for(const v of moss)if(v>.2)occupied++;return{elapsed,ticks,growthEvents:events,colonizedCells:occupied,totalCells:moss.length,coverage:occupied/moss.length,model:'4 connected 32x32 wall fields; local propagation; illustrative moisture and soot source'}}
 return{texture,update,inspect};
}
