    // Scrollspy + custom smooth scroll (slower)
    const nav = document.getElementById('side-nav');
    const links = Array.from(nav.querySelectorAll('a'));
    const aboutLink  = links.find(a => a.getAttribute('href') === '#about');
    const resumeLink = links.find(a => a.getAttribute('href') === '#resume');
    const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);

    function setActive(el){
      links.forEach(a => a.setAttribute('aria-current','false'));
      el && el.setAttribute('aria-current','true');
    }
    
    // --- Center-based scrollspy (resolves edge ambiguity) ---

function currentSectionByCenter(){
  const centerY = (window.scrollY || document.documentElement.scrollTop) + window.innerHeight / 2;
  let best = null, bestDist = Infinity;
  for(const s of sections){
    const rect = s.getBoundingClientRect();
    const top = (window.scrollY || document.documentElement.scrollTop) + rect.top;
    const bottom = top + rect.height;
    const mid = (top + bottom) / 2;
    const dist = Math.abs(mid - centerY);
    if(dist < bestDist){ bestDist = dist; best = s; }
  }
  return best;
}

function updateActiveByCenter(){
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const viewportBottom = scrollTop + window.innerHeight;
  const docHeight = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight
  );

  // Only force at the true extremes
  if (scrollTop <= 1 && aboutLink){
    setActive(aboutLink);
    history.replaceState(null, '', '#about');
    return;
  }
  if (viewportBottom >= docHeight - 1 && resumeLink){
    setActive(resumeLink);
    history.replaceState(null, '', '#resume');
    return;
  }

  const s = currentSectionByCenter();
  if(!s) return;
  const link = links.find(a => a.getAttribute('href') === '#' + s.id);
  if(link){
    setActive(link);
    history.replaceState(null, '', '#' + s.id);
  }
}

// run + bind
updateActiveByCenter();
window.addEventListener('scroll', updateActiveByCenter, { passive: true });
window.addEventListener('resize', updateActiveByCenter);
document.addEventListener('DOMContentLoaded', updateActiveByCenter);

    // Ensure first/last sections highlight at the extremes
    function clampEnds(){
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const viewportBottom = scrollTop + window.innerHeight;
    const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight
    );

  // Top of page → force "About"
  if (scrollTop <= 2 && aboutLink) {
    setActive(aboutLink);
    history.replaceState(null, '', '#about');
    return;
  }

  // Bottom of page → force "Resume"
  if (viewportBottom >= docHeight - 2 && resumeLink) {
    setActive(resumeLink);
    history.replaceState(null, '', '#resume');
    return;
  }
}

window.addEventListener('scroll', clampEnds, { passive: true });
window.addEventListener('resize', clampEnds);
document.addEventListener('DOMContentLoaded', clampEnds);


    // Custom smooth scroll (~900ms, eased)
    function smoothScrollTo(targetY, duration = 900){
      const startY = window.scrollY || document.documentElement.scrollTop;
      const delta = targetY - startY;
      const startTime = performance.now();
      const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
      function step(now){
        const t = Math.min(1, (now - startTime) / duration);
        window.scrollTo(0, startY + delta * easeOutCubic(t));
        if(t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    links.forEach(a=>{
      a.addEventListener('click', e=>{
        e.preventDefault();
        const id = a.getAttribute('href');
        const el = document.querySelector(id);
        if(!el) return;
        const rect = el.getBoundingClientRect();
        const targetY = (window.scrollY || document.documentElement.scrollTop) + rect.top;
        smoothScrollTo(targetY, 900);
        setActive(a);
      });
    });

    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      document.documentElement.style.scrollBehavior = 'auto';
    }

    // --- Cursor spotlight (subtle, performant) ---
    document.addEventListener('DOMContentLoaded', function(){
  const spot = document.getElementById('spotlight');
  if(!spot) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let rafId = null;
  let visible = false;

  const lerp = (a,b,t)=>a+(b-a)*t;

  function animate(){
    currentX = lerp(currentX, targetX, 0.18);
    currentY = lerp(currentY, targetY, 0.18);
    spot.style.setProperty('--spot-x', `${currentX}px`);
    spot.style.setProperty('--spot-y', `${currentY}px`);
    rafId = requestAnimationFrame(animate);
  }

  function show(){
    if(!visible){
      visible = true;
      spot.style.opacity = '1';
      if(!rafId) rafId = requestAnimationFrame(animate);
    }
  }
  function hide(){
    visible = false;
    spot.style.opacity = '0';
    if(rafId){ cancelAnimationFrame(rafId); rafId = null; }
  }

  // Mouse / pointer tracking
  window.addEventListener('pointermove', (e)=>{
    // ignore touch pointers to avoid battery drain on mobile
    if(e.pointerType === 'touch') return;
    targetX = e.clientX; targetY = e.clientY;
    show();
  }, {passive:true});

  window.addEventListener('pointerenter', (e)=>{
    if(e.pointerType === 'touch') return;
    show();
  });
  window.addEventListener('pointerleave', hide);

  // Hide on scroll if user never moved the mouse yet (prevents faint glow on load)
  let hasMoved = false;
  window.addEventListener('pointermove', ()=>{ hasMoved = true; }, {once:true});
  window.addEventListener('scroll', ()=>{ if(!hasMoved) hide(); }, {passive:true});

  // Coarse pointers (touch devices): keep it off
  if(window.matchMedia && window.matchMedia('(pointer: coarse)').matches){
    hide();
  }
})();