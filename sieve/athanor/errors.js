
(function(){
 const el=document.getElementById('error');
 function fatal(error){
  const message=String(error&&error.stack||error&&error.message||error||'Unknown error');
  const report=['BAUBLE FAILED TO WAKE',message,'URL: '+location.href,'Time: '+new Date().toISOString()].join('\n');
  el.replaceChildren();
  el.style.cssText='position:fixed;z-index:9999;top:15%;bottom:12%;left:12px;right:12px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;background:#211a20;color:#ffe1d6;padding:16px;border:2px solid #ff9784;border-radius:12px;font:13px/1.5 monospace';
  const heading=document.createElement('div');heading.textContent=report;el.append(heading);
  const button=document.createElement('button');button.textContent='COPY ERROR';button.style.cssText='display:block;width:100%;min-height:56px;margin:14px 0;font:700 17px system-ui';el.append(button);
  const manual=document.createElement('textarea');manual.value=report;manual.readOnly=true;manual.style.cssText='display:block;width:100%;min-height:110px;font:12px monospace';el.append(manual);
  button.onclick=async()=>{try{await navigator.clipboard.writeText(report);button.textContent='COPIED'}catch(_){manual.focus();manual.select();button.textContent='SELECTED — TAP COPY IN MENU'}};
 }
 window.BaubleFatal=fatal;
 addEventListener('error',e=>fatal(e.error||e.message));
 addEventListener('unhandledrejection',e=>fatal(e.reason));
})();
