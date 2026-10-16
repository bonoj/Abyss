// EUROPA-01 material conservation ledger; synthetic accounting units, not kilograms.
// Pure logic. The terrain adapter must provide the removed inventory.
const finite=x=>Number.isFinite(x)&&x>=0;
export function createMaterialLedger(initial={}){
 const species=Object.keys(initial);
 if(!species.length||species.some(k=>!k||!finite(initial[k])))throw Error('invalid initial inventory');
 const state={inPlace:{...initial},recovered:{},dispersed:{},lost:{},introduced:{}};
 for(const k of species)for(const name of ['recovered','dispersed','lost','introduced'])state[name][k]=0;
 const transfer=(from,to,inventory)=>{
  if(from!=='inPlace'||!['recovered','dispersed','lost'].includes(to))throw Error('invalid transfer');
  if(!inventory||Object.keys(inventory).some(k=>!species.includes(k)||!finite(inventory[k])))throw Error('invalid inventory');
  for(const [k,n] of Object.entries(inventory))if(n>state[from][k]+1e-9)throw Error('insufficient '+k);
  for(const [k,n] of Object.entries(inventory)){state[from][k]-=n;state[to][k]+=n}
 };
 const introduce=inventory=>{
  if(!inventory||Object.keys(inventory).some(k=>!species.includes(k)||!finite(inventory[k])))throw Error('invalid introduction');
  for(const [k,n] of Object.entries(inventory)){state.introduced[k]+=n;state.recovered[k]+=n}
 };
 const inspect=()=>{
  const residual={};
  for(const k of species)residual[k]=initial[k]+state.introduced[k]-state.inPlace[k]-state.recovered[k]-state.dispersed[k]-state.lost[k];
  return {schema:'europa-material-ledger/v0',units:'synthetic accounting units',state:structuredClone(state),residual,balanced:Object.values(residual).every(x=>Math.abs(x)<1e-8)};
 };
 return {transfer,introduce,inspect};
}
