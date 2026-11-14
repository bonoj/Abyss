// Port of the JIT Assets Ice / 03 fragment model, not a substitute PBR finish.
// Source: https://bonoj.github.io/jit/assets/ice-frost-backlit/
// Original procedural noise, thickness absorption, Fresnel, specular, and backlit
// scattering are preserved. Camera rays are transformed into each brick's local
// coordinates; the brick's existing geometry/physics remain untouched.
export function createFrostBacklitIce(T,halfSize){
 const material=new T.ShaderMaterial({
  name:'Strand Ice / JIT Frosted Backlit',
  glslVersion:T.GLSL3,
  vertexShader:"out vec3 vLocalPosition;\nout vec3 vLocalCamera;\nvoid main(){\n vLocalPosition=position;\n vLocalCamera=(inverse(modelMatrix)*vec4(cameraPosition,1.0)).xyz;\n gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);\n}",
  fragmentShader:"precision highp float;\nin vec3 vLocalPosition;\nin vec3 vLocalCamera;\nuniform vec3 iceHalfSize;\nout vec4 fragColor;\nuniform vec2 resolution;\nuniform float frost,backlight,bubbleToggle;\nfloat hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}\nfloat noise3(vec3 p){\n vec3 i=floor(p),f=fract(p);\n f=f*f*(3.-2.*f);\n float a=hash(i),b=hash(i+vec3(1,0,0)),c=hash(i+vec3(0,1,0)),d=hash(i+vec3(1,1,0));\n float e=hash(i+vec3(0,0,1)),g=hash(i+vec3(1,0,1)),h=hash(i+vec3(0,1,1)),j=hash(i+vec3(1,1,1));\n return mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),mix(mix(e,g,f.x),mix(h,j,f.x),f.y),f.z);\n}\nvec2 intersectBox(vec3 ro,vec3 rd,vec3 s){\n vec3 inv=1./rd;\n vec3 lo=(-s-ro)*inv,hi=(s-ro)*inv;\n vec3 mn=min(lo,hi),mx=max(lo,hi);\n return vec2(max(max(mn.x,mn.y),mn.z),min(min(mx.x,mx.y),mx.z));\n}\nvec3 normalBox(vec3 p,vec3 s){\n vec3 a=abs(p/s);\n if(a.x>a.y&&a.x>a.z)return vec3(sign(p.x),0.,0.);\n if(a.y>a.z)return vec3(0.,sign(p.y),0.);\n return vec3(0.,0.,sign(p.z));\n}\nvoid main(){\n vec3 ro=vLocalCamera;\n vec3 rd=normalize(vLocalPosition-ro);\n vec3 bg=vec3(.045,.075,.095);\n vec2 hit=intersectBox(ro,rd,iceHalfSize);\n if(hit.x>hit.y||hit.y<0.)discard;\n float entry=max(0.,hit.x),thick=hit.y-entry;\n vec3 p=ro+rd*entry;\n vec3 n=normalBox(p,iceHalfSize);\n float facing=max(dot(n,-rd),0.);\n float fresnel=pow(1.-facing,5.);\n float grain=noise3(p*23.)*.65+noise3(p*59.)*.35;\n float crystalline=noise3(p*7.+vec3(3.1,8.2,1.4));\n float frostMask=clamp(frost*(.38+.62*grain)*(.7+.3*crystalline),0.,1.);\n float trans=exp(-thick*(.45+frostMask*.85));\n vec3 absorb=exp(-thick*vec3(.9,.43,.26));\n vec3 source=vec3(.77,.93,1.)*backlight;\n vec3 transmitted=source*trans*absorb;\n vec3 diffuseFrost=vec3(.55,.79,.86)*frostMask*(.35+.65*backlight);\n vec3 ice=transmitted+diffuseFrost;\n vec3 key=normalize(vec3(-.5,.8,1.));\n float spec=pow(max(dot(reflect(rd,n),key),0.),48.);\n ice+=vec3(.9,.98,1.)*spec*(1.-frostMask*.65);\n ice+=vec3(.20,.37,.45)*fresnel;\n ice=mix(ice,vec3(.7,.87,.94),fresnel*.6);\n if(bubbleToggle>.5){\n  float contribution=0.;\n  for(int i=0;i<10;i++){\n   float k=float(i);\n   vec3 center=vec3(fract(sin(k*17.31+1.2)*43758.5)-.5,fract(sin(k*27.73+4.5)*43758.5)-.5,fract(sin(k*11.93+7.1)*43758.5)-.5)*vec3(1.65,1.12,.95);\n   float radius=.025+.035*fract(sin(k*8.7+2.1)*4567.2);\n   vec3 v=center-ro;\n   float t=dot(v,rd);\n   float d=length(v-rd*clamp(t,entry,hit.y));\n   float ring=smoothstep(radius*.60,radius*.94,d)*(1.-smoothstep(radius,radius*1.15,d));\n   contribution=max(contribution,ring);\n  }\n  ice+=vec3(.18,.28,.30)*contribution*(1.-frostMask*.65);\n }\n ice=mix(ice,bg,.10);\n fragColor=vec4(pow(clamp(ice,0.,1.),vec3(.93)),1.);\n}",
  uniforms:{
   frost:{value:.33},backlight:{value:.66},bubbleToggle:{value:0},
   iceHalfSize:{value:new T.Vector3(...halfSize)}
  },
  side:T.FrontSide,transparent:false,depthWrite:true
 });
 material.userData={finish:'jit-ice-03',frost:.33,backlight:.66,bubbles:false,source:'jit/assets/ice-frost-backlit/index.html'};
 return material;
}
