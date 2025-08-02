
;(function() {
  // ── Utility Classes ──────────────────────────────────────────────────────────
  class Grad {
    constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
    dot2(x, y) { return this.x * x + this.y * y; }
  }
  class Noise {
    constructor(seed=0) {
      this.grad3 = [
        new Grad(1,1,0), new Grad(-1,1,0), new Grad(1,-1,0), new Grad(-1,-1,0),
        new Grad(1,0,1), new Grad(-1,0,1), new Grad(1,0,-1), new Grad(-1,0,-1),
        new Grad(0,1,1), new Grad(0,-1,1), new Grad(0,1,-1), new Grad(0,-1,-1),
      ];
      this.p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,
        /* …full 256-array… trimmed for brevity… */ 156,180];
      this.perm = new Array(512);
      this.gradP = new Array(512);
      this.seed(seed);
    }
    seed(seed) {
      if(seed>0 && seed<1) seed*=65536;
      seed=Math.floor(seed);
      if(seed<256) seed|=seed<<8;
      for(let i=0;i<256;i++){
        const v = i&1 ? this.p[i] ^ (seed&255) : this.p[i] ^ ((seed>>8)&255);
        this.perm[i]=this.perm[i+256]=v;
        this.gradP[i]=this.gradP[i+256]=this.grad3[v%12];
      }
    }
    fade(t){ return t*t*t*(t*(t*6-15)+10); }
    lerp(a,b,t){ return (1-t)*a + t*b; }
    perlin2(x,y){
      let X=Math.floor(x)&255, Y=Math.floor(y)&255;
      x-=Math.floor(x); y-=Math.floor(y);
      const n00=this.gradP[X+this.perm[Y]].dot2(x,y);
      const n01=this.gradP[X+this.perm[Y+1]].dot2(x,y-1);
      const n10=this.gradP[X+1+this.perm[Y]].dot2(x-1,y);
      const n11=this.gradP[X+1+this.perm[Y+1]].dot2(x-1,y-1);
      const u=this.fade(x), v=this.fade(y);
      return this.lerp(this.lerp(n00,n10,u), this.lerp(n01,n11,u), v);
    }
  }

  // ── Configuration ───────────────────────────────────────────────────────────
  const cfg = {
    lineColor: 'rgba(0,0,0,0.3)',
    backgroundColor: 'transparent',
    waveSpeedX: 0.02,
    waveSpeedY: 0.01,
    waveAmpX: 30,
    waveAmpY: 20,
    xGap: 12,
    yGap: 36,
    friction: 0.9,
    tension: 0.01,
    maxCursorMove: 100
  };

  // ── State Refs ───────────────────────────────────────────────────────────────
  const mouse = { x:-10,y:0,lx:0,ly:0,sx:0,sy:0,v:0,vs:0,a:0,set:false };
  const noise = new Noise(Math.random());
  let lines = [], bbox={width:0,height:0,left:0,top:0};

  // ── DOM Elements ─────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded',()=>{
    const container = document.getElementById('waves-container');
    const canvas = document.getElementById('waves-canvas');
    const cursor = document.getElementById('cursor-indicator');
    const ctx = canvas.getContext('2d');

    // Size & grid setup
    function setSize(){
      bbox = container.getBoundingClientRect();
      canvas.width = bbox.width;
      canvas.height = bbox.height;
    }
    function setLines(){
      lines = [];
      const oW = bbox.width+200, oH = bbox.height+30;
      const cols = Math.ceil(oW/cfg.xGap), rows = Math.ceil(oH/cfg.yGap);
      const x0 = (bbox.width - cols*cfg.xGap)/2;
      const y0 = (bbox.height - rows*cfg.yGap)/2;
      for(let i=0;i<=cols;i++){
        const pts = [];
        for(let j=0;j<=rows;j++){
          pts.push({
            x: x0 + i*cfg.xGap,
            y: y0 + j*cfg.yGap,
            wave:{x:0,y:0}, cursor:{x:0,y:0,vx:0,vy:0}
          });
        }
        lines.push(pts);
      }
    }

    // Animation logic
    function movePoints(time){
      lines.forEach(pts=>{
        pts.forEach(p=>{
          const move = noise.perlin2(
            (p.x + time*cfg.waveSpeedX)*0.002,
            (p.y + time*cfg.waveSpeedY)*0.0015
          ) * 12;
          p.wave.x = Math.cos(move)*cfg.waveAmpX;
          p.wave.y = Math.sin(move)*cfg.waveAmpY;

          const dx = p.x - mouse.sx, dy = p.y - mouse.sy;
          const dist = Math.hypot(dx,dy), l = Math.max(175, mouse.vs);
          if(dist<l){
            const s = 1 - dist/l, f = Math.cos(dist*0.001)*s;
            p.cursor.vx += Math.cos(mouse.a)*f*l*mouse.vs*0.00065;
            p.cursor.vy += Math.sin(mouse.a)*f*l*mouse.vs*0.00065;
          }

          // spring + friction
          p.cursor.vx += -p.cursor.x*cfg.tension;
          p.cursor.vy += -p.cursor.y*cfg.tension;
          p.cursor.vx *= cfg.friction;
          p.cursor.vy *= cfg.friction;
          p.cursor.x += p.cursor.vx*2;
          p.cursor.y += p.cursor.vy*2;

          p.cursor.x = Math.max(-cfg.maxCursorMove,Math.min(cfg.maxCursorMove,p.cursor.x));
          p.cursor.y = Math.max(-cfg.maxCursorMove,Math.min(cfg.maxCursorMove,p.cursor.y));
        });
      });
    }
    function moved(pt, useCursor=true){
      const x = pt.x + pt.wave.x + (useCursor?pt.cursor.x:0);
      const y = pt.y + pt.wave.y + (useCursor?pt.cursor.y:0);
      return { x: Math.round(x*10)/10, y:Math.round(y*10)/10 };
    }
    function drawLines(){
      ctx.clearRect(0,0,bbox.width,bbox.height);
      ctx.beginPath();
      ctx.strokeStyle = cfg.lineColor;
      lines.forEach(pts=>{
        let p1 = moved(pts[0], false);
        ctx.moveTo(p1.x,p1.y);
        pts.forEach((p,i)=>{
          const last = i===pts.length-1;
          p1 = moved(p, !last);
          const p2 = moved( pts[i+1]||pts[pts.length-1], !last );
          ctx.lineTo(p1.x,p1.y);
          if(last) ctx.moveTo(p2.x,p2.y);
        });
      });
      ctx.stroke();
    }

    // Main tick
    function tick(time){
      // smooth mouse
      mouse.sx += (mouse.x - mouse.sx)*0.1;
      mouse.sy += (mouse.y - mouse.sy)*0.1;
      const dx = mouse.x - mouse.lx, dy = mouse.y - mouse.ly;
      const d = Math.hypot(dx,dy);
      mouse.v = d;
      mouse.vs += (d - mouse.vs)*0.1;
      mouse.vs = Math.min(100,mouse.vs);
      mouse.lx = mouse.x; mouse.ly = mouse.y;
      mouse.a = Math.atan2(dy,dx);

      // move the small dot
      cursor.style.transform = 
        `translate3d(${mouse.sx}px, ${mouse.sy}px, 0)`;

      movePoints(time);
      drawLines();
      requestAnimationFrame(tick);
    }

    // Input handling
    function updateMouse(x,y){
      mouse.x = x - bbox.left;
      mouse.y = y - bbox.top + window.scrollY;
      if(!mouse.set){
        mouse.lx = mouse.sx = mouse.x;
        mouse.ly = mouse.sy = mouse.y;
        mouse.set = true;
      }
    }
    window.addEventListener('mousemove', e => updateMouse(e.pageX, e.pageY));
    window.addEventListener('touchmove', e => {
      e.preventDefault();
      updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive:false });

    window.addEventListener('resize', () => {
      setSize();
      setLines();
    });

    // Initialize
    setSize();
    setLines();
    requestAnimationFrame(tick);
  });
})();
