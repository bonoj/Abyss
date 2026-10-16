// Composable observation lens. Original full-scene capture and visual formulas preserved.
import {sourceTreatment} from './source.js';
import {sobelTreatment} from './sobel.js';
import {depthTreatment} from './depth.js';
import {hybridTreatment} from './hybrid.js';
export const observationTreatments=Object.freeze([sourceTreatment,sobelTreatment,depthTreatment,hybridTreatment]);
export function createObservationLens(T,renderer,camera){
let observedTerrain=null;
const terrainLayer=29;
const edgeNames=['OFF',...observationTreatments.map(t=>t.name)];
let edgeMode=0,edgeFrames=0,edgeLastMs=0,edgePeakMs=0;
const edgeTarget=new T.WebGLRenderTarget(1,1,{depthBuffer:true});
edgeTarget.depthTexture=new T.DepthTexture(1,1,T.UnsignedShortType);
edgeTarget.depthTexture.format=T.DepthFormat;
const terrainTarget=new T.WebGLRenderTarget(1,1,{depthBuffer:true});
terrainTarget.depthTexture=new T.DepthTexture(1,1,T.UnsignedShortType);
terrainTarget.depthTexture.format=T.DepthFormat;
const edgeScene=new T.Scene(),edgeCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
const edgeUniforms={tColor:{value:terrainTarget.texture},tDepth:{value:terrainTarget.depthTexture},tSceneDepth:{value:edgeTarget.depthTexture},resolution:{value:new T.Vector2(1,1)},mode:{value:0},nearPlane:{value:camera.near},farPlane:{value:camera.far}};
const edgeShaderErrors=[];
const previousShaderErrorHandler=renderer.debug.onShaderError;
const shaderErrorHandler=(gl,program,vertexShader,fragmentShader)=>{
 const report={at:performance.now(),program:gl.getProgramInfoLog(program)||'',vertex:gl.getShaderInfoLog(vertexShader)||'',fragment:gl.getShaderInfoLog(fragmentShader)||''};
 edgeShaderErrors.push(report);if(edgeShaderErrors.length>5)edgeShaderErrors.shift();console.error('Hermeticon shader compilation',report);
};
renderer.debug.onShaderError=shaderErrorHandler;
const edgeShader=new T.ShaderMaterial({depthTest:false,depthWrite:false,transparent:true,toneMapped:false,uniforms:edgeUniforms,
 vertexShader:`varying vec2 vEdgeUv;void main(){vEdgeUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,0.,1.);}`,
 fragmentShader:`uniform sampler2D tColor,tDepth,tSceneDepth;uniform vec2 resolution;uniform int mode;uniform float nearPlane,farPlane;varying vec2 vEdgeUv;
float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
float linearDepth(float d){float z=d*2.-1.;return 2.*nearPlane*farPlane/(farPlane+nearPlane-z*(farPlane-nearPlane));}
void main(){
vec2 px=1./resolution;
float tl=lum(texture2D(tColor,vEdgeUv+px*vec2(-1.,1.)).rgb);
float tc=lum(texture2D(tColor,vEdgeUv+px*vec2(0.,1.)).rgb);
float tr=lum(texture2D(tColor,vEdgeUv+px*vec2(1.,1.)).rgb);
float ml=lum(texture2D(tColor,vEdgeUv+px*vec2(-1.,0.)).rgb);
float mr=lum(texture2D(tColor,vEdgeUv+px*vec2(1.,0.)).rgb);
float bl=lum(texture2D(tColor,vEdgeUv+px*vec2(-1.,-1.)).rgb);
float bc=lum(texture2D(tColor,vEdgeUv+px*vec2(0.,-1.)).rgb);
float br=lum(texture2D(tColor,vEdgeUv+px*vec2(1.,-1.)).rgb);
float sx=-tl+tr-2.*ml+2.*mr-bl+br;
float sy=-tl-2.*tc-tr+bl+2.*bc+br;
float sobel=clamp(length(vec2(sx,sy))*1.6,0.,1.);
float center=linearDepth(texture2D(tDepth,vEdgeUv).r);
float dx=linearDepth(texture2D(tDepth,vEdgeUv+vec2(px.x,0.)).r);
float dy=linearDepth(texture2D(tDepth,vEdgeUv+vec2(0.,px.y)).r);
float depthEdge=smoothstep(.012,.085,max(abs(dx-center),abs(dy-center))/max(center,.2));
// This is an overlay, not a replacement image: preserve the fully lit terrain and vessel.
float terrainRaw=texture2D(tDepth,vEdgeUv).r;
float sceneRaw=texture2D(tSceneDepth,vEdgeUv).r;
if(terrainRaw>=.999999||terrainRaw>sceneRaw+.00005){gl_FragColor=vec4(0.);return;}
float strength=mode==2?sobel:mode==3?depthEdge:max(sobel*.65,depthEdge);
vec3 ink=mode==2?vec3(.93,.88,.72):vec3(1.,.72,.22);
gl_FragColor=vec4(ink,clamp(strength*.9,0.,.9));
return;
}`});
const edgeQuad=new T.Mesh(new T.PlaneGeometry(2,2),edgeShader);edgeQuad.frustumCulled=false;edgeScene.add(edgeQuad);
const sourceMaterial=new T.MeshBasicMaterial({map:edgeTarget.texture,depthTest:false,depthWrite:false,toneMapped:false});
const edgeButton=document.createElement('button');edgeButton.textContent='🌐';edgeButton.id='edgeLens';edgeButton.type='button';edgeButton.title='Observation lens: OFF';edgeButton.setAttribute('aria-label','Observation lens: OFF');
edgeButton.onclick=()=>{edgeMode=(edgeMode+1)%edgeNames.length;edgeUniforms.mode.value=edgeMode;edgeButton.title='Observation lens: '+edgeNames[edgeMode];edgeButton.setAttribute('aria-label',edgeButton.title)};
document.querySelector('#buttons').append(edgeButton);
const edgeInspect=()=>({shaderErrors:[...edgeShaderErrors],shaderProgramCount:renderer.info.programs?.length??null,mode:edgeNames[edgeMode],source:'terrain-only color/depth + full-scene occlusion depth',terrainOnly:!!observedTerrain,normalBuffer:false,maskReadback:false,frames:edgeFrames,lastRenderMs:+edgeLastMs.toFixed(2),peakRenderMs:+edgePeakMs.toFixed(2),target:[edgeTarget.width,edgeTarget.height],note:'visual experiment; edges not yet 3D witnesses'});

return Object.freeze({
 get mode(){return edgeNames[edgeMode]},
 get modes(){return [...edgeNames]},
 observeTerrain(group){if(observedTerrain)observedTerrain.traverse(o=>o.layers.disable(terrainLayer));observedTerrain=group||null;if(observedTerrain)observedTerrain.traverse(o=>o.layers.enable(terrainLayer));},
 setMode(value){const i=typeof value==='number'?value:edgeNames.indexOf(String(value).toUpperCase());if(!Number.isInteger(i)||i<0||i>=edgeNames.length)throw Error('Unknown edge mode: '+value);edgeMode=i;edgeUniforms.mode.value=i;edgeButton.title='Observation lens: '+edgeNames[i];edgeButton.setAttribute('aria-label',edgeButton.title);return edgeNames[i]},
 render(scene,camera){
 if(edgeMode===0||(!observedTerrain&&edgeMode!==1)){renderer.render(scene,camera);return}
 const start=performance.now(),w=renderer.domElement.width,h=renderer.domElement.height;
 if(edgeTarget.width!==w||edgeTarget.height!==h){edgeTarget.setSize(w,h);terrainTarget.setSize(w,h);edgeUniforms.resolution.value.set(w,h)}
 edgeUniforms.nearPlane.value=camera.near;edgeUniforms.farPlane.value=camera.far;
 // Capture complete-scene depth for foreground occlusion, then draw the normal scene unchanged.
 renderer.setRenderTarget(edgeTarget);renderer.render(scene,camera);renderer.setRenderTarget(null);
 renderer.render(scene,camera);
 if(edgeMode===1){edgeLastMs=performance.now()-start;edgeFrames++;return}
 const previousMask=camera.layers.mask,previousBackground=scene.background,previousFog=scene.fog;
 try{
  camera.layers.set(terrainLayer);scene.background=null;
  renderer.setRenderTarget(terrainTarget);renderer.clear(true,true,true);
  renderer.render(scene,camera);
 }finally{
  renderer.setRenderTarget(null);camera.layers.mask=previousMask;scene.background=previousBackground;scene.fog=previousFog;
 }
 // Overlay must not auto-clear the already rendered scene (including the vessel and sky).
 const previousAutoClear=renderer.autoClear;
 try{renderer.autoClear=false;edgeQuad.material=edgeShader;renderer.render(edgeScene,edgeCamera)}
 finally{renderer.autoClear=previousAutoClear}
 edgeLastMs=performance.now()-start;edgePeakMs=Math.max(edgePeakMs,edgeLastMs);edgeFrames++
},
 inspect:edgeInspect,
 dispose(){edgeButton.remove();edgeTarget.dispose();terrainTarget.dispose();edgeQuad.geometry.dispose();edgeShader.dispose();sourceMaterial.dispose();if(renderer.debug.onShaderError===shaderErrorHandler)renderer.debug.onShaderError=previousShaderErrorHandler}
});
}
