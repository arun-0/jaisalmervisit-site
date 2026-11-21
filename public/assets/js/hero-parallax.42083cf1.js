  // ---- hero: 3-layer scroll parallax (sky, fort photo, text) ----
  // Desktop: unchanged fixed travel values. Mobile (<=680px): a lighter version whose
  // travel is derived from the fort photo's rendered height, so it scales with the screen.
  // prefers-reduced-motion always gets the fully static version.
  (function(){
    var art = document.querySelector('.hero-bg-art');
    var heroEl = document.querySelector('.hero');
    var txt = document.querySelector('.hero-content');
    if(!art || !heroEl) return;

    var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var mobileQuery = window.matchMedia('(max-width: 680px)');

    // desktop values — identical to before
    var PHOTO_D = 260;   // px the fort photo travels down over the hero (CSS keeps it anchored to the bottom edge)
    var SKY_D   = 170;   // px the sky layer travels down (its layer has 170px overscan top and bottom)
    var TEXT_D  = 110;   // px the text block drifts UP, on top of normal scroll

    // mobile values — fractions of the photo's rendered height (art.offsetHeight), recomputed on
    // resize / orientation change. "Strong" mobile setting ≈ 40% of the desktop travel:
    // on a 390px phone (offsetHeight = 260px) → photo ≈ 100px, sky ≈ 68px, text ≈ 44px.
    // The photo only ever moves DOWN from its bottom anchor, so the hero's bottom edge stays covered.
    var M_PHOTO_RATIO = 0.385;
    var M_PHOTO_MAX_RATIO = 0.40;          // hard ceiling
    var M_SKY_RATIO   = 0.26, M_SKY_MIN  = 40, M_SKY_MAX  = 70;    // stays well inside the 170px sky overscan
    var M_TEXT_RATIO  = 0.17, M_TEXT_MIN = 24, M_TEXT_MAX = 44;

    var PHOTO = PHOTO_D, SKY = SKY_D, TEXT = TEXT_D, SCALE = 1.06, isMobile = false;
    var current = 0, target = 0, raf = null, heroH = heroEl.offsetHeight || 1;
    var heroTop = 0, viewH = window.innerHeight;   // cached for the mobile scroll path (no per-scroll layout reads)

    function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

    function parallaxAllowed(){
      return !reduceMotionQuery.matches;
    }

    function measure(){
      // all layout reads happen here (resize / orientation / image load), never inside the scroll handler on mobile
      heroH = heroEl.offsetHeight || 1;
      viewH = window.innerHeight;
      heroTop = heroEl.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop);
      isMobile = mobileQuery.matches;
      if(isMobile){
        var artH = art.offsetHeight || (window.innerWidth * 0.306);   // fallback if the image hasn't laid out yet
        PHOTO = Math.min(artH * M_PHOTO_RATIO, artH * M_PHOTO_MAX_RATIO);
        SKY   = clamp(artH * M_SKY_RATIO,  M_SKY_MIN,  M_SKY_MAX);
        TEXT  = clamp(artH * M_TEXT_RATIO, M_TEXT_MIN, M_TEXT_MAX);
        SCALE = 1.03;
      } else {
        PHOTO = PHOTO_D; SKY = SKY_D; TEXT = TEXT_D; SCALE = 1.06;
      }
    }

    function setStatic(){
      if(raf){ cancelAnimationFrame(raf); raf = null; }
      art.style.transform = 'translate3d(0,0,0) scale(' + (mobileQuery.matches ? 1.03 : 1.06) + ')';
      heroEl.style.removeProperty('--hero-sky-y');
      heroEl.style.removeProperty('--hero-txt-y');
    }

    function render(){
      current += (target - current) * 0.12;
      var q = Math.max(0, Math.min(1, current / heroH));   // 0 at page top … 1 once the hero has fully scrolled away
      // q >= 0 so the photo only ever moves DOWN from its bottom anchor: the hero's bottom edge stays covered
      art.style.transform = 'translate3d(0,' + (q * PHOTO).toFixed(2) + 'px,0) scale(' + SCALE + ')';
      heroEl.style.setProperty('--hero-sky-y', (q * SKY).toFixed(2) + 'px');
      heroEl.style.setProperty('--hero-txt-y', (-q * TEXT).toFixed(2) + 'px');
      if(Math.abs(target - current) > 0.4){
        raf = requestAnimationFrame(render);
      } else {
        raf = null;
      }
    }

    function onScroll(){
      if(!parallaxAllowed()) return;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      var top, bottom;
      if(isMobile){
        // cached geometry — no getBoundingClientRect() per scroll event on phones
        top = heroTop - y; bottom = top + heroH;
        if(bottom < -200 || top > viewH + 200) return;
      } else {
        var heroRect = heroEl.getBoundingClientRect();
        // only bother animating while the hero is anywhere near the viewport
        if(heroRect.bottom < -200 || heroRect.top > window.innerHeight + 200) return;
      }
      target = y;
      if(!raf){ raf = requestAnimationFrame(render); }
    }

    function refresh(){
      measure();
      if(parallaxAllowed()){
        onScroll();
      } else {
        setStatic();
      }
    }

    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', refresh, {passive:true});
    window.addEventListener('orientationchange', refresh, {passive:true});
    window.addEventListener('load', refresh, {passive:true});
    if(!art.complete) art.addEventListener('load', refresh, {once:true});
    if(reduceMotionQuery.addEventListener) reduceMotionQuery.addEventListener('change', refresh);
    if(mobileQuery.addEventListener) mobileQuery.addEventListener('change', refresh);

    refresh();
  })();
