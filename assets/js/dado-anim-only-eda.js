(function(){
'use strict';
var cv=document.getElementById('dado-canvas');
if(!cv)return;

// ─── HiDPI / RETINA SCALING ──────────────────────────────────────────────────
var DPR=window.DADO_DPR||Math.min(window.devicePixelRatio||1,2);// override via window.DADO_DPR for recording
cv.width=600*DPR;cv.height=530*DPR;
// CSS display size is controlled by the existing inline styles (width:100%;height:auto)

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
var W=600,H=530,DURATION=11000,LEAD=1500,TRAIL=1000;// LEAD: static hold at start; TRAIL: hold at end
var AA='ACDEFGHIKLMNPQRSTVWY';
var MAX_P=20;
var COL=W/2;
var ROW=100;

// Design-space circles
var DST ={cx:60,cy:632,r:500,bg:'#f0f0f0',border:'#999'};

// Stars (targets)
var STRT={x:200,y:165};   // dist from DST  ≈ 488 < 500 ✓

// Blob initial positions
var BIYT={x:90,y:420,r:22};

var CONV_SHOW=0.93;

// ─── PROTEIN IMAGE ────────────────────────────────────────────────────────────
var protImg=new Image();
protImg.src='/assets/img/research/dado/prot_for_anim.png';

// ─── SEEDED RNG ───────────────────────────────────────────────────────────────
var seed=12345;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function rseq(n){var s='';for(var i=0;i<n;i++)s+=AA[Math.floor(rnd()*20)];return s;}

// ─── PARTICLE POOL ────────────────────────────────────────────────────────────
function Pool(n,slen,col){
  this.col=col;this.slen=slen;this.timer=0;this.iv=475;
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
  p.x=bx+(rnd()-0.5)*14;p.y=by+(rnd()-0.5)*14;
  p.vx=0;p.vy=0;
  p.op=0.8;p.age=0;p.ma=1100+rnd()*900;
  var h=Math.floor(this.slen/2);p.txt=rseq(h)+'...'+rseq(this.slen-h);p.live=true;
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
function drawPow20seq(ctx,x,y,exp,sz,col,bold){
  ctx.save();
  ctx.fillStyle=col;ctx.textBaseline='middle';ctx.textAlign='left';
  var supSz=Math.round(sz*0.72);
  var w=bold?'bold ':'';
  ctx.font=w+sz+'px sans-serif';
  var baseW=ctx.measureText('20').width;
  ctx.fillText('20',x,y);
  ctx.font=w+supSz+'px sans-serif';
  var expW=ctx.measureText(exp).width;
  ctx.fillText(exp,x+baseW,y-sz*0.35);
  ctx.font=sz+'px sans-serif';
  ctx.fillText(' sequences',x+baseW+expW,y);
  ctx.restore();
}

// Measure total width of "20^{exp} sequences" at given size
function measurePow20seq(ctx,exp,sz,bold){
  var supSz=Math.round(sz*0.72);
  var w=bold?'bold ':'';
  ctx.font=w+sz+'px sans-serif';
  var baseW=ctx.measureText('20').width;
  ctx.font=w+supSz+'px sans-serif';
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

// ─── SEQUENCE ROW ────────────────────────────────────────────────────────────
// Draw M E L L M ... G G K P A Q centered at (panelCx, cy)
// hi=false: all gray; hi=true: scaffold=blue, interface=orange
var SEQ_SCAF_PRE=['M','E','L','L','M'];
var SEQ_IFACE   =['G','G','K'];
var SEQ_SCAF_PST=['P','A','Q'];
function drawSeq(ctx,panelCx,cy,hi){
  var bw=18,bh=15,gap=2;
  ctx.font='11px monospace';
  var dotW=ctx.measureText('...').width;
  var nBoxes=SEQ_SCAF_PRE.length+SEQ_IFACE.length+SEQ_SCAF_PST.length;
  var totalW=nBoxes*(bw+gap)-gap + 8+dotW+8;
  var x=panelCx-totalW/2;
  var y=cy-bh/2;

  function box(lbl,isIface){
    ctx.fillStyle=!hi?'#e0e0e0':isIface?'rgba(235,115,0,0.50)':'rgba(25,95,210,0.42)';
    ctx.strokeStyle=!hi?'#aaa':isIface?'#cc5800':'#1850c0';
    ctx.lineWidth=0.8;
    ctx.beginPath();ctx.rect(x,y,bw,bh);ctx.fill();ctx.stroke();
    ctx.fillStyle='#222';ctx.font='12px monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(lbl,x+bw/2,y+bh/2+1);
    x+=bw+gap;
  }
  SEQ_SCAF_PRE.forEach(function(c){box(c,false);});
  // ellipsis
  x+=4;
  ctx.fillStyle='#888';ctx.font='11px monospace';
  ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.fillText('...',x,y+bh/2);
  x+=dotW+8;
  SEQ_IFACE.forEach(function(c){box(c,true);});
  SEQ_SCAF_PST.forEach(function(c){box(c,false);});
  return x-gap;// right edge of last box
}

// ─── BLOB STATE ───────────────────────────────────────────────────────────────
var B={
  top:{x:BIYT.x,y:BIYT.y,r:BIYT.r,px:BIYT.x,py:BIYT.y}
};

function updateBlobs(t){
  B.top.px=B.top.x;B.top.py=B.top.y;

  // Naive: 150%*1.3=195% of original speed (0.256*1.95≈0.499)
  var slowConv=0.499*t;
  var noiseX=Math.sin(t*12.1+0.5)*11;
  var noiseY=Math.cos(t*8.3+1.1)*8.5;
  B.top.x=BIYT.x+(STRT.x-BIYT.x)*slowConv+noiseX;
  B.top.y=BIYT.y+(STRT.y-BIYT.y)*slowConv+noiseY;
  B.top.r=22+4*Math.sin(t*5.3);
}

// ─── PARTICLE POOLS ───────────────────────────────────────────────────────────
var PT=new Pool(MAX_P,15,'#666666');

// ─── MATH LABEL HELPERS ───────────────────────────────────────────────────────
// Draw "~ p_θ(x)" left-anchored at (x, y baseline)
function drawMathStd(ctx,x,y,sz){
  var sub=Math.round(sz*0.72);
  ctx.textBaseline='alphabetic';ctx.textAlign='left';
  ctx.fillStyle='#555';ctx.font=sz+'px sans-serif';
  ctx.fillText('~\u2009',x,y);x+=ctx.measureText('~\u2009').width;
  ctx.font='italic '+sz+'px sans-serif';
  ctx.fillText('p',x,y);x+=ctx.measureText('p').width;
  ctx.font='italic '+sub+'px sans-serif';
  ctx.fillText('\u03B8',x,y+sz*0.28);x+=ctx.measureText('\u03B8').width;
  ctx.font='italic '+sz+'px sans-serif';
  ctx.fillText('(x)',x,y);
}
// Draw "~ p_θ(x_I, x_S)" left-anchored at (x, y baseline); x_I colored colI, x_S colored colS
function drawMathJoint(ctx,x,y,sz,colI,colS){
  var sub=Math.round(sz*0.72);
  ctx.textBaseline='alphabetic';ctx.textAlign='left';
  ctx.fillStyle='#555';ctx.font=sz+'px sans-serif';
  ctx.fillText('~\u2009',x,y);x+=ctx.measureText('~\u2009').width;
  ctx.fillStyle='#555';ctx.font='italic '+sz+'px sans-serif';
  ctx.fillText('p',x,y);x+=ctx.measureText('p').width;
  ctx.font='italic '+sub+'px sans-serif';
  ctx.fillText('\u03B8',x,y+sz*0.28);x+=ctx.measureText('\u03B8').width;
  ctx.fillStyle='#555';ctx.font='italic '+sz+'px sans-serif';
  ctx.fillText('(',x,y);x+=ctx.measureText('(').width;
  ctx.fillStyle=colI;ctx.font='italic '+sz+'px sans-serif';
  ctx.fillText('x',x,y);x+=ctx.measureText('x').width;
  ctx.font='italic '+sub+'px sans-serif';
  ctx.fillText('I',x,y+sz*0.28);x+=ctx.measureText('I').width;
  ctx.fillStyle='#555';ctx.font=sz+'px sans-serif';
  ctx.fillText(',\u2009',x,y);x+=ctx.measureText(',\u2009').width;
  ctx.fillStyle=colS;ctx.font='italic '+sz+'px sans-serif';
  ctx.fillText('x',x,y);x+=ctx.measureText('x').width;
  ctx.font='italic '+sub+'px sans-serif';
  ctx.fillText('S',x,y+sz*0.28);x+=ctx.measureText('S').width;
  ctx.fillStyle='#555';ctx.font='italic '+sz+'px sans-serif';
  ctx.fillText(')',x,y);
}
// Draw "p^L_θ(x_L)" centered at (cx, y baseline)
function drawMathSingle(ctx,cx,y,sz,lbl,col){
  var sup=Math.round(sz*0.65),sub=Math.round(sz*0.72);
  // Measure first
  ctx.font='italic '+sz+'px sans-serif';
  var pw=ctx.measureText('p').width;
  ctx.font='italic '+sup+'px sans-serif';
  var supW=ctx.measureText(lbl).width;
  ctx.font='italic '+sub+'px sans-serif';
  var subW=ctx.measureText('\u03B8').width;
  ctx.font='italic '+sz+'px sans-serif';
  var xw=ctx.measureText('(x').width;
  ctx.font='italic '+sub+'px sans-serif';
  var lw2=ctx.measureText(lbl).width;
  ctx.font='italic '+sz+'px sans-serif';
  var rw=ctx.measureText(')').width;
  var totalW=pw+Math.max(supW,subW)+xw+lw2+rw;
  var x=cx-totalW/2;
  ctx.textBaseline='alphabetic';ctx.textAlign='left';
  ctx.font='italic '+sz+'px sans-serif';ctx.fillStyle=col;
  ctx.fillText('p',x,y);
  ctx.font='italic '+sup+'px sans-serif';ctx.fillStyle=col;
  ctx.fillText(lbl,x+pw,y-sz*0.38);
  ctx.font='italic '+sub+'px sans-serif';ctx.fillStyle=col;
  ctx.fillText('\u03B8',x+pw,y+sz*0.28);
  x+=pw+Math.max(supW,subW);
  ctx.font='italic '+sz+'px sans-serif';ctx.fillStyle=col;
  ctx.fillText('(x',x,y);x+=xw;
  ctx.font='italic '+sub+'px sans-serif';ctx.fillStyle=col;
  ctx.fillText(lbl,x,y+sz*0.28);x+=lw2;
  ctx.font='italic '+sz+'px sans-serif';ctx.fillStyle=col;
  ctx.fillText(')',x,y);
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function render(ctx,t){
  ctx.setTransform(DPR,0,0,DPR,0,-92*DPR);// crop top 92px (40px above circle tops)
  ctx.clearRect(0,92,W,530);
  ctx.fillStyle='#f8f9fa';ctx.fillRect(0,92,W,530);

  // ── GRAY SEARCH SPACE ────────────────────────────────────────────────────
  drawCircle(ctx,DST);

  // ── BOTTOM-LEFT: Standard Distributional Optimization ────────────────────────
  var seqSz=20;
  ctx.font='bold 20px sans-serif';ctx.fillStyle='#555';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillText('Full protein',195,581);
  var seqW=measurePow20seq(ctx,'67',seqSz,true);
  drawPow20seq(ctx,195-seqW/2,605,'67',seqSz,'#555',true);
  drawStar(ctx,STRT.x,STRT.y,9,'#cc2222');
  ctx.save();ctx.beginPath();ctx.arc(DST.cx,DST.cy,DST.r,0,Math.PI*2);ctx.clip();
  drawBlob(ctx,B.top.x,B.top.y,B.top.r,'#888888',0.40);ctx.restore();
  ctx.save();ctx.globalAlpha=0.9;
  drawPtheta(ctx,B.top.x,Math.max(DST.cy-DST.r+28,B.top.y-B.top.r-9),15,'#777');
  ctx.restore();

  PT.draw(ctx);
}

// ─── ANIMATION LOOP ───────────────────────────────────────────────────────────
var atime=0,lts=null,raf=null,active=false;
function tick(ts){
  if(!active)return;
  if(lts===null)lts=ts;
  var dt=Math.min(50,ts-lts);lts=ts;
  atime+=dt;
  var phase=atime%(DURATION+LEAD+TRAIL);
  var t=phase<LEAD?0:phase>LEAD+DURATION?1:(phase-LEAD)/DURATION;
  var moving=phase>=LEAD&&phase<LEAD+DURATION;
  updateBlobs(t);
  if(moving){
    PT.emit(B.top.x,B.top.y,B.top.x-B.top.px,B.top.y-B.top.py,dt);
  }
  PT.update(dt);
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
