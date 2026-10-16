// Sieve's native workspace drawer. No nested Sieve iframe or second cockpit.
(()=>{'use strict';
const toggle=document.getElementById('sieveToggle');
const panel=document.getElementById('sieveOverlay');
const close=document.getElementById('sieveClose');
if(!toggle||!panel||!close)return;
function setOpen(open){
 panel.hidden=!open;
 toggle.setAttribute('aria-expanded',String(open));
 (open?close:toggle).focus();
}
toggle.addEventListener('click',()=>setOpen(panel.hidden));
close.addEventListener('click',()=>setOpen(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)setOpen(false)});
})();
