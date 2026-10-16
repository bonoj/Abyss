// Sobel/depth hybrid: original strength and gold edge overlay.
export const hybridTreatment=Object.freeze({name:'HYBRID',mode:4,kind:'shader',strength:'max(sobel*.65,depthEdge)',color:'mix(original,vec3(1.,.72,.22),strength*.9)'});
