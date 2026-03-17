(function(){
'use strict';
var cv=document.getElementById('dado-canvas');
if(!cv)return;

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
var W=800,H=600,DURATION=9000;
var AA='ACDEFGHIKLMNPQRSTVWY';
var MAX_P=20;
var COL=W/2;
var ROW=190;

// Design-space circles
var DST ={cx:195,cy:400,r:150,bg:'#f0f0f0',border:'#999'};
var DSYL={cx:570,cy:315,r:60, bg:'#fffbe6',border:'#c8a800'};
var DSBL={cx:570,cy:505,r:72, bg:'#e8f0ff',border:'#4060a0'};// scaffold is bigger

// Stars (targets)
var STRT={x:285,y:305};   // dist from DST  ≈ 131 < 150 ✓
var STYL={x:609,y:276};   // dist from DSYL ≈  55 < 60  ✓
var STBL={x:617,y:458};   // dist from DSBL ≈  67 < 72  ✓

// Blob initial positions — all start r=22
var BIYT={x:110,y:488,r:22};
var BIYL={x:537,y:348,r:22};
var BIBL={x:530,y:545,r:22};  // inside larger DSBL ✓

var CONV_SHOW=0.93;

// ─── SEEDED RNG ───────────────────────────────────────────────────────────────
var seed=12345;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function rseq(n){var s='';for(var i=0;i<n;i++)s+=AA[Math.floor(rnd()*20)];return s;}

// ─── PARTICLE POOL ────────────────────────────────────────────────────────────
function Pool(n,slen,col){
  this.col=col;this.slen=slen;this.timer=0;this.iv=380;
  this.ps=[];
  for(var i=0;i<n;i++)this.ps.push({x:0,y:0,vx:0,vy:0,op:0,age:0,ma:0,txt:'',live:false});
}
Pool.prototype.emit=function(bx,by,mdx,mdy,dt){
  this.timer+=dt;if(this.timer<this.iv)return;this.timer=0;
  var p=null,mx=0,mi=0;
  for(var i=0;i<this.ps.length;i++){
    if(!this.ps[i].live){p=this.ps[i];break;}
    if(this.ps[i].age>mx){mx=this.ps[i].age;mi=i;}
  }
  if(!p)p=this.ps[mi];
  var base=Math.atan2(mdy||0.001,mdx||0.001);
  var ang=base+(rnd()-0.5)*2.2;
  var spd=16+rnd()*22;
  p.x=bx+(rnd()-0.5)*14;p.y=by+(rnd()-0.5)*14;
  p.vx=Math.cos(ang)*spd;p.vy=Math.sin(ang)*spd;
  p.op=0.8;p.age=0;p.ma=1100+rnd()*900;
  p.txt=rseq(this.slen);p.live=true;
};
Pool.prototype.update=function(dt){
  for(var i=0;i<this.ps.length;i++){
    var p=this.ps[i];if(!p.live)continue;
    p.age+=dt;if(p.age>=p.ma){p.live=false;continue;}
    p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;
    p.op=0.8*(1-p.age/p.ma);
  }
};
Pool.prototype.draw=function(ctx){
  ctx.save();
  ctx.beginPath();ctx.rect(0,ROW+1,W,H-ROW-1);ctx.clip();
  ctx.font='14px monospace';ctx.textBaseline='middle';
  for(var i=0;i<this.ps.length;i++){
    var p=this.ps[i];if(!p.live||p.op<0.02)continue;
    ctx.globalAlpha=p.op;ctx.fillStyle=this.col;
    ctx.fillText(p.txt,p.x,p.y);
  }
  ctx.restore();
};

// ─── MATH TEXT HELPERS ───────────────────────────────────────────────────────
// Draw p_θ(x) with θ as a subscript, centered at (cx,cy)
function drawPtheta(ctx,cx,cy,sz,col){
  ctx.save();
  ctx.fillStyle=col;ctx.textBaseline='middle';ctx.textAlign='left';
  var subSz=Math.round(sz*0.72);
  ctx.font='italic '+sz+'px sans-serif';
  var pw=ctx.measureText('p').width;
  ctx.font='italic '+subSz+'px sans-serif';
  var tw=ctx.measureText('\u03B8').width;
  ctx.font='italic '+sz+'px sans-serif';
  var rxw=ctx.measureText('(x)').width;
  var totalW=pw+tw+rxw;
  var x0=cx-totalW/2;
  ctx.fillText('p',x0,cy);
  ctx.font='italic '+subSz+'px sans-serif';
  ctx.fillText('\u03B8',x0+pw,cy+sz*0.28);
  ctx.font='italic '+sz+'px sans-serif';
  ctx.fillText('(x)',x0+pw+tw,cy);
  ctx.restore();
}

// Draw "20^{exp} sequences" left-anchored at (x,y)
function drawPow20seq(ctx,x,y,exp,sz,col){
  ctx.save();
  ctx.fillStyle=col;ctx.textBaseline='middle';ctx.textAlign='left';
  var supSz=Math.round(sz*0.72);
  ctx.font=sz+'px sans-serif';
  var baseW=ctx.measureText('20').width;
  ctx.fillText('20',x,y);
  ctx.font=supSz+'px sans-serif';
  var expW=ctx.measureText(exp).width;
  ctx.fillText(exp,x+baseW,y-sz*0.35);
  ctx.font=sz+'px sans-serif';
  ctx.fillText(' sequences',x+baseW+expW,y);
  ctx.restore();
}

// Measure total width of "20^{exp} sequences" at given size
function measurePow20seq(ctx,exp,sz){
  var supSz=Math.round(sz*0.72);
  ctx.font=sz+'px sans-serif';
  var baseW=ctx.measureText('20').width;
  ctx.font=supSz+'px sans-serif';
  var expW=ctx.measureText(exp).width;
  ctx.font=sz+'px sans-serif';
  return baseW+expW+ctx.measureText(' sequences').width;
}

// ─── DRAWING UTILITIES ────────────────────────────────────────────────────────
function drawStar(ctx,x,y,r,c){
  ctx.save();ctx.fillStyle=c;ctx.beginPath();
  for(var i=0;i<5;i++){
    var a=(i*4*Math.PI/5)-Math.PI/2;
    i?ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a)):ctx.moveTo(x+r*Math.cos(a),y+r*Math.sin(a));
  }
  ctx.closePath();ctx.fill();ctx.restore();
}
function drawBlob(ctx,x,y,r,c,a){
  ctx.save();ctx.globalAlpha=a;
  ctx.beginPath();ctx.arc(x,y,Math.max(1,r),0,Math.PI*2);
  ctx.fillStyle=c;ctx.fill();ctx.restore();
}
function drawCircle(ctx,ds){
  ctx.save();ctx.shadowColor='rgba(0,0,0,0.07)';ctx.shadowBlur=10;
  ctx.beginPath();ctx.arc(ds.cx,ds.cy,ds.r,0,Math.PI*2);ctx.fillStyle=ds.bg;ctx.fill();
  ctx.restore();
  ctx.beginPath();ctx.arc(ds.cx,ds.cy,ds.r,0,Math.PI*2);
  ctx.strokeStyle=ds.border;ctx.lineWidth=1.5;ctx.stroke();
}

// ─── PROTEIN SCHEMATIC ────────────────────────────────────────────────────────
var SEQ='MKLVIHGSDACWTPF';
var IFACE=[5,6,7,8,9,10];
function isIface(i){for(var j=0;j<IFACE.length;j++)if(IFACE[j]===i)return true;return false;}

function drawProtein(ctx,px,py,pw,hi){
  var bw=18,bh=15,gap=2,n=SEQ.length;
  var tw=n*(bw+gap)-gap;
  var sy=py+8;
  var sx=px+(pw-tw)/2;
  ctx.font='9px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  for(var i=0;i<n;i++){
    var bx=sx+i*(bw+gap),ii=isIface(i);
    ctx.fillStyle=!hi?'#e0e0e0':ii?'#ffe566':'#b8d4f0';
    ctx.strokeStyle=!hi?'#aaa':ii?'#b89000':'#3060a0';
    ctx.lineWidth=0.8;
    ctx.beginPath();ctx.rect(bx,sy,bw,bh);ctx.fill();ctx.stroke();
    ctx.fillStyle='#222';ctx.fillText(SEQ[i],bx+bw/2,sy+bh/2);
  }
  var bky=sy+bh+28;
  var pts=[];
  for(var i=0;i<n;i++)pts.push([sx+i*(bw+gap)+bw/2,bky+Math.sin(i*0.65)*11]);
  ctx.strokeStyle='#d8d8d8';ctx.lineWidth=0.5;
  for(var i=0;i<n;i++){
    ctx.beginPath();ctx.moveTo(sx+i*(bw+gap)+bw/2,sy+bh);ctx.lineTo(pts[i][0],pts[i][1]-4.5);ctx.stroke();
  }
  ctx.beginPath();ctx.strokeStyle='#888';ctx.lineWidth=2;
  ctx.moveTo(pts[0][0],pts[0][1]);
  for(var i=1;i<n-2;i++){
    var mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;
    ctx.quadraticCurveTo(pts[i][0],pts[i][1],mx,my);
  }
  ctx.quadraticCurveTo(pts[n-2][0],pts[n-2][1],pts[n-1][0],pts[n-1][1]);
  ctx.stroke();
  for(var i=0;i<n;i++){
    var ii=isIface(i);
    ctx.beginPath();ctx.arc(pts[i][0],pts[i][1],4.5,0,Math.PI*2);
    ctx.fillStyle=!hi?'#999':ii?'#e0a800':'#4a90d9';ctx.fill();
  }
  var lx=pts[7][0]+2,ly=pts[7][1]+32;
  ctx.setLineDash([3,2]);ctx.strokeStyle=hi?'#b89000':'#cca060';ctx.lineWidth=1.2;
  for(var k=0;k<IFACE.length;k++){
    ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(pts[IFACE[k]][0],pts[IFACE[k]][1]);ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(lx,ly,10,0,Math.PI*2);ctx.fillStyle='#ff9944';ctx.fill();
  ctx.strokeStyle='#c05010';ctx.lineWidth=1.5;ctx.stroke();
  ctx.font='12px sans-serif';ctx.fillStyle='#c05010';
  ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('binding target',lx,ly+13);
  ctx.textBaseline='alphabetic';
}

// ─── BLOB STATE ───────────────────────────────────────────────────────────────
var B={
  top:{x:BIYT.x,y:BIYT.y,r:BIYT.r,px:BIYT.x,py:BIYT.y},
  yl: {x:BIYL.x,y:BIYL.y,r:BIYL.r,px:BIYL.x,py:BIYL.y},
  bl: {x:BIBL.x,y:BIBL.y,r:BIBL.r,px:BIBL.x,py:BIBL.y}
};

// Ease helpers — separate rates for yl and bl
// 0.78 was original; 0.78/0.8=0.975 → 80% speed for yl
// bl 0.8x current speed: 1.11/0.8=1.39
function easeYL(t){return 1-Math.pow(1-Math.min(1,t/0.975),3);}
function easeBL(t){return 1-Math.pow(1-Math.min(1,t/1.39),3);}

function updateBlobs(t){
  B.top.px=B.top.x;B.top.py=B.top.y;
  B.yl.px=B.yl.x; B.yl.py=B.yl.y;
  B.bl.px=B.bl.x; B.bl.py=B.bl.y;

  // Naive: 150%*1.3=195% of original speed (0.256*1.95≈0.499)
  var slowConv=0.499*t;
  var noiseX=Math.sin(t*12.1+0.5)*11;
  var noiseY=Math.cos(t*8.3+1.1)*8.5;
  B.top.x=BIYT.x+(STRT.x-BIYT.x)*slowConv+noiseX;
  B.top.y=BIYT.y+(STRT.y-BIYT.y)*slowConv+noiseY;
  B.top.r=22+4*Math.sin(t*5.3);

  // DADO blobs — cubic ease-out at individual rates
  var ey=easeYL(t);
  B.yl.x=BIYL.x+(STYL.x-BIYL.x)*ey;
  B.yl.y=BIYL.y+(STYL.y-BIYL.y)*ey;
  B.yl.r=BIYL.r*(1-0.78*ey);

  var eb=easeBL(t);
  B.bl.x=BIBL.x+(STBL.x-BIBL.x)*eb;
  B.bl.y=BIBL.y+(STBL.y-BIBL.y)*eb;
  B.bl.r=BIBL.r*(1-0.78*eb);
}

// ─── PARTICLE POOLS ───────────────────────────────────────────────────────────
var PT =new Pool(MAX_P,15,'#666666');
var PYL=new Pool(MAX_P,6, '#806000');
var PBL=new Pool(MAX_P,9, '#1a4080');

// ─── RENDER ───────────────────────────────────────────────────────────────────
function render(ctx,t){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#f8f9fa';ctx.fillRect(0,0,W,H);

  // Grid dividers
  ctx.strokeStyle='#ddd';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(15,ROW);ctx.lineTo(W-15,ROW);ctx.stroke();
  ctx.beginPath();ctx.moveTo(COL,10);ctx.lineTo(COL,H-10);ctx.stroke();

  var ey=easeYL(t);
  var eb=easeBL(t);

  // ── COLUMN TITLES (top row) ──────────────────────────────────────────────────
  ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#444';
  ctx.fillText('Standard protein design',   COL/2,     22);
  ctx.fillText('Decomposed protein design', COL+COL/2, 22);

  // ── TOP ROW: protein schematics ──────────────────────────────────────────────
  drawProtein(ctx,  5,     44, COL-10, false);
  drawProtein(ctx,  COL+5, 44, COL-10, true);

  // Interface/scaffold legend — bottom of top-right panel, centered, moved down slightly
  var legY=ROW-18;
  var legCx=COL+COL/2;
  ctx.font='12px sans-serif';
  var iW=ctx.measureText('interface').width;
  var sW=ctx.measureText('scaffold').width;
  var sqSz=10,sqGap=5,blockGap=18;
  var totalLegW=sqSz+sqGap+iW+blockGap+sqSz+sqGap+sW;
  var legX=legCx-totalLegW/2;
  ctx.fillStyle='#ffe566';ctx.fillRect(legX,legY-sqSz+1,sqSz,sqSz);
  ctx.strokeStyle='#b89000';ctx.lineWidth=0.8;ctx.strokeRect(legX,legY-sqSz+1,sqSz,sqSz);
  ctx.fillStyle='#555';ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillText('interface',legX+sqSz+sqGap,legY);
  var sx2=legX+sqSz+sqGap+iW+blockGap;
  ctx.fillStyle='#b8d4f0';ctx.fillRect(sx2,legY-sqSz+1,sqSz,sqSz);
  ctx.strokeStyle='#3060a0';ctx.lineWidth=0.8;ctx.strokeRect(sx2,legY-sqSz+1,sqSz,sqSz);
  ctx.fillStyle='#555';ctx.fillText('scaffold',sx2+sqSz+sqGap,legY);

  // ── BOTTOM-LEFT: Standard Distributional Optimization ────────────────────────
  ctx.font='bold 16px sans-serif';ctx.fillStyle='#333';
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillText('Standard Distributional Optimization',COL/2,ROW+24);

  drawCircle(ctx,DST);
  var seqSz=15;
  var seqW=measurePow20seq(ctx,'15',seqSz);
  drawPow20seq(ctx,DST.cx-seqW/2,DST.cy+DST.r+20,'15',seqSz,'#aaa');
  drawStar(ctx,STRT.x,STRT.y,9,'#cc2222');
  ctx.save();ctx.beginPath();ctx.arc(DST.cx,DST.cy,DST.r,0,Math.PI*2);ctx.clip();
  drawBlob(ctx,B.top.x,B.top.y,B.top.r,'#888888',0.40);ctx.restore();
  ctx.save();ctx.globalAlpha=0.9;
  drawPtheta(ctx,B.top.x,Math.max(DST.cy-DST.r+28,B.top.y-B.top.r-9),15,'#777');
  ctx.restore();

  // ── BOTTOM-RIGHT: DADO ───────────────────────────────────────────────────────
  // Two-line title, same size as column titles, centered, in black
  ctx.font='bold 16px sans-serif';ctx.fillStyle='#333';
  ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillText('Decomposition-Aware Distributional Optimization',COL+COL/2,ROW+22);
  ctx.fillText('(DADO)',COL+COL/2,ROW+41);

  // Interface circle
  drawCircle(ctx,DSYL);
  drawStar(ctx,STYL.x,STYL.y,9,'#cc2222');
  ctx.save();ctx.beginPath();ctx.arc(DSYL.cx,DSYL.cy,DSYL.r,0,Math.PI*2);ctx.clip();
  drawBlob(ctx,B.yl.x,B.yl.y,B.yl.r,'#c8a000',0.45);ctx.restore();
  var lbxYL=DSYL.cx+DSYL.r+10;
  ctx.font='13px sans-serif';ctx.fillStyle='#666';ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillText('Interface',lbxYL,DSYL.cy-5);
  drawPow20seq(ctx,lbxYL,DSYL.cy+12,'6',13,'#888');

  // Scaffold circle (larger)
  drawCircle(ctx,DSBL);
  drawStar(ctx,STBL.x,STBL.y,9,'#cc2222');
  ctx.save();ctx.beginPath();ctx.arc(DSBL.cx,DSBL.cy,DSBL.r,0,Math.PI*2);ctx.clip();
  drawBlob(ctx,B.bl.x,B.bl.y,B.bl.r,'#3060a0',0.45);ctx.restore();
  var lbxBL=DSBL.cx+DSBL.r+10;
  ctx.font='13px sans-serif';ctx.fillStyle='#666';ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillText('Scaffold',lbxBL,DSBL.cy-5);
  drawPow20seq(ctx,lbxBL,DSBL.cy+12,'9',13,'#888');

  // "+" between stacked circles
  var plusY=Math.round((DSYL.cy+DSYL.r+DSBL.cy-DSBL.r)/2);
  ctx.font='bold 26px sans-serif';ctx.fillStyle='#aaa';ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText('+',DSYL.cx,plusY);

  // "converged" fades in only when both blobs are at star
  var allEase=Math.min(ey,eb);
  if(allEase>CONV_SHOW){
    var fa=Math.min(1,(allEase-CONV_SHOW)/0.05);
    ctx.save();ctx.globalAlpha=fa;ctx.font='bold 14px sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#2a7a2a';
    ctx.fillText('\u2713 converged',DSYL.cx,DSYL.cy+6);
    ctx.fillText('\u2713 converged',DSBL.cx,DSBL.cy+6);
    ctx.restore();
  }

  PT.draw(ctx);PYL.draw(ctx);PBL.draw(ctx);
}

// ─── ANIMATION LOOP ───────────────────────────────────────────────────────────
var atime=0,lts=null,raf=null,active=false;
function tick(ts){
  if(!active)return;
  if(lts===null)lts=ts;
  var dt=Math.min(50,ts-lts);lts=ts;
  atime+=dt;
  var t=(atime%DURATION)/DURATION;
  updateBlobs(t);
  var ey=easeYL(t);
  var eb=easeBL(t);
  PT.emit(B.top.x,B.top.y,B.top.x-B.top.px,B.top.y-B.top.py,dt);
  if(ey<CONV_SHOW) PYL.emit(B.yl.x,B.yl.y,B.yl.x-B.yl.px,B.yl.y-B.yl.py,dt);
  if(eb<CONV_SHOW) PBL.emit(B.bl.x,B.bl.y,B.bl.x-B.bl.px,B.bl.y-B.bl.py,dt);
  PT.update(dt);PYL.update(dt);PBL.update(dt);
  render(cv.getContext('2d'),t);
  raf=requestAnimationFrame(tick);
}
function startA(){if(active)return;active=true;lts=null;raf=requestAnimationFrame(tick);}
function stopA(){active=false;if(raf){cancelAnimationFrame(raf);raf=null;}}

// ─── VISIBILITY (pause when off-screen) ───────────────────────────────────────
if(window.IntersectionObserver){
  new IntersectionObserver(function(es){
    es[0].isIntersecting?startA():stopA();
  },{threshold:0.1}).observe(cv);
}

// ─── ALT TEXT ─────────────────────────────────────────────────────────────────
cv.setAttribute('aria-label',
  'Animation comparing standard distributional optimization (gray blob slowly drifting toward target '+
  'in full 20^15 sequence space) with DADO decomposed search (blobs rapidly converging in separate '+
  'interface and scaffold spaces). DADO exploits decomposability to converge far faster.'
);

// ─── START ────────────────────────────────────────────────────────────────────
updateBlobs(0);
render(cv.getContext('2d'),0);
startA();
})();
