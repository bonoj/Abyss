import * as T from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
/**
 * COMPOSABLE CONTRACT — world-space observation (read-only diagnostics).
 * WORLD radii describe the Genesis glass shell and terrain render aperture.
 * inspectObjectSpace(object,camera) checks actual parent attachment,
 * object bounds, glass containment, camera-space projection and frustum.
 * These checks are not pixel evidence and do not verify a live deployment.
 * Use before changing coordinates of any apparently missing entity.
 * NOTE: bounds include descendant geometry; shell transparency, occlusion,
 * camera clipping and material shader behavior require separate inspection.
 */
export const WORLD={outerRadius:10.25,innerRadius:10.07,terrainAperture:9.72};
export function sphereFits(center,radius,limit=WORLD.innerRadius){return center.length()+radius<=limit}
export function inspectObjectSpace(object,camera){
 object.updateWorldMatrix(true,true);
 const center=object.getWorldPosition(new T.Vector3());
 const bounds=new T.Box3().setFromObject(object);
 const sphere=bounds.getBoundingSphere(new T.Sphere());
 let viewport=null;
 if(camera){
  camera.updateMatrixWorld(true);camera.updateProjectionMatrix();
  const ndc=center.clone().project(camera);
  const direction=center.clone().sub(camera.position);
  viewport={ndc:ndc.toArray(),inFront:direction.dot(camera.getWorldDirection(new T.Vector3()))>0,inFrustum:(()=>{const f=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));return f.intersectsSphere(sphere)})()};
 }
 return {attached:!!object.parent,visible:object.visible,center:center.toArray(),bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},boundingRadius:sphere.radius,withinGlass:sphereFits(center,sphere.radius),viewport};
}
