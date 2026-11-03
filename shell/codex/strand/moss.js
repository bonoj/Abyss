// Strand host-local moss experiment.
export function createMossExperiment(T,{parent,retina}){
 const root=new T.Group();root.name='Strand moss';parent.add(root);
 return {update(){},inspect:()=>({name:'Strand moss',colonies:0})};
}
