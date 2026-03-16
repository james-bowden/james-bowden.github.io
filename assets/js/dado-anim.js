(function(){
'use strict';
var cv=document.getElementById('dado-canvas');
if(!cv)return; // only run on the DADO page

var W=900,H=480,DURATION=9000;
var AA='ACDEFGHIKLMNPQRSTVWY';
var MAX_P=20,COL=300,ROW=240;
var DST={cx:618,cy:118,r:88,bg:'#fff0f0',border:'#d08080'};
var DSYL={cx:468,cy:362,r:68,bg:'#fffbe6',border:'#c8a800'};
var DSBL={cx:672,cy:362,r:68,bg:'#e8f0ff',border:'#4060a0'};
var STRT={x:682,y:74};
var STYL={x:518,y:322};
var STBL={x:720,y:322};
var BIYT={x:DST.cx-30, y:DST.cy+25,r:32};
var BIYL={x:DSYL.cx-35,y:DSYL.cy+28,r:22};
var BIBL={x:DSBL.cx-30,y:DSBL.cy+25,r:22};

// ─── SEEDED RNG ──────────────────────────────────────────────────────────────
var seed=12345;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function rseq(n){var s='';for(var i=0;i<n;i++)s+=AA[Math.floor(rnd()*20)];return s;}

// ─── PARTICLE POOL ───────────────────────────────────────────────────────────
function Pool(n,slen,col){
  this.col=col;this.slen=slen;this.timer=0;this.iv=210;
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
  ctx.beginPath();ctx.rect(COL+1,0,W-COL,H);ctx.clip();
  ctx.font='7px monospace';ctx.textBaseline='middle';
  for(var i=0;i<this.ps.length;i++){
    var p=this.ps[i];if(!p.live||p.op<0.02)continue;
    ctx.globalAlpha=p.op;ctx.fillStyle=this.col;
    ctx.fillText(p.txt,p.x,p.y);
  }
  ctx.restore();
};

// ─── DRAWING UTILITIES ───────────────────────────────────────────────────────
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

// ─── PROTEIN SCHEMATIC ───────────────────────────────────────────────────────
var SEQ='MKLVIHGSDACWTPF';
var IFACE=[5,6,7,8,9,10];
function isIface(i){for(var j=0;j<IFACE.length;j++)if(IFACE[j]===i)return true;return false;}
function drawProtein(ctx,px,py,pw,ph,hi){
  var bw=15,bh=13,gap=2,n=SEQ.length;
  var tw=n*(bw+gap)-gap;
  var sx=px+(pw-tw)/2,sy=py+30;
  ctx.font='bold 10px sans-serif';ctx.fillStyle='#555';
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillText(hi?'Protein (decomposed)':'Protein sequence',px+6,py+16);
  ctx.font='7px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
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
    ctx.beginPath();ctx.moveTo(sx+i*(bw+gap)+bw/2,sy+bh);ctx.lineTo(pts[i][0],pts[i][1]-3.5);ctx.stroke();
  }
  ctx.beginPath();ctx.strokeStyle='#888';ctx.lineWidth=1.8;
  ctx.moveTo(pts[0][0],pts[0][1]);
  for(var i=1;i<n-2;i++){
    var mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;
    ctx.quadraticCurveTo(pts[i][0],pts[i][1],mx,my);
  }
  ctx.quadraticCurveTo(pts[n-2][0],pts[n-2][1],pts[n-1][0],pts[n-1][1]);
  ctx.stroke();
  for(var i=0;i<n;i++){
    var ii=isIface(i);
    ctx.beginPath();ctx.arc(pts[i][0],pts[i][1],3.5,0,Math.PI*2);
    ctx.fillStyle=!hi?'#999':ii?'#e0a800':'#4a90d9';ctx.fill();
  }
  var lx=pts[7][0]+2,ly=pts[7][1]+30;
  ctx.setLineDash([2.5,2]);ctx.strokeStyle=hi?'#b89000':'#cca060';ctx.lineWidth=0.9;
  for(var k=1;k<=3;k++){
    ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(pts[IFACE[k]][0],pts[IFACE[k]][1]);ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(lx,ly,8,0,Math.PI*2);ctx.fillStyle='#ff9944';ctx.fill();
  ctx.strokeStyle='#c05010';ctx.lineWidth=1.5;ctx.stroke();
  ctx.font='7px sans-serif';ctx.fillStyle='#c05010';
  ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('lig',lx,ly+10);
  ctx.textBaseline='alphabetic';
}

// ─── BLOB STATE ──────────────────────────────────────────────────────────────
var B={
  top:{x:BIYT.x,y:BIYT.y,r:BIYT.r,px:BIYT.x,py:BIYT.y},
  yl: {x:BIYL.x,y:BIYL.y,r:BIYL.r,px:BIYL.x,py:BIYL.y},
  bl: {x:BIBL.x,y:BIBL.y,r:BIBL.r,px:BIBL.x,py:BIBL.y}
};
function updateBlobs(t){
  B.top.px=B.top.x;B.top.py=B.top.y;
  B.yl.px=B.yl.x;B.yl.py=B.yl.y;
  B.bl.px=B.bl.x;B.bl.py=B.bl.y;
  var ang=2*Math.PI*t;
  var wr=36+16*Math.sin(3.5*ang);
  B.top.x=DST.cx-8+wr*Math.cos(ang);
  B.top.y=DST.cy+6+wr*Math.sin(ang*1.4);
  B.top.r=32+7*Math.sin(ang*2.2);
  var conv=Math.min(1,t/0.78);
  var ease=1-Math.pow(1-conv,3);
  B.yl.x=BIYL.x+(STYL.x-BIYL.x)*ease;
  B.yl.y=BIYL.y+(STYL.y-BIYL.y)*ease;
  B.yl.r=BIYL.r*(1-0.78*ease);
  B.bl.x=BIBL.x+(STBL.x-BIBL.x)*ease;
  B.bl.y=BIBL.y+(STBL.y-BIBL.y)*ease;
  B.bl.r=BIBL.r*(1-0.78*ease);
}

// ─── PARTICLE POOLS ──────────────────────────────────────────────────────────
var PT =new Pool(MAX_P,15,'#8b2020');
var PYL=new Pool(MAX_P,6, '#806000');
var PBL=new Pool(MAX_P,9, '#1a4080');

// ─── RENDER ──────────────────────────────────────────────────────────────────
function render(ctx,t){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#f8f9fa';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#ddd';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(15,ROW);ctx.lineTo(W-15,ROW);ctx.stroke();
  ctx.beginPath();ctx.moveTo(COL,10);ctx.lineTo(COL,H-10);ctx.stroke();
  drawProtein(ctx,5,5,COL-10,ROW-10,false);
  drawCircle(ctx,DST);
  ctx.font='9px sans-serif';ctx.fillStyle='#aaa';ctx.textAlign='center';
  ctx.fillText('20\u00B9\u2075 sequences',DST.cx,DST.cy+DST.r+14);
  ctx.font='8px sans-serif';ctx.fillStyle='#cc2222';ctx.textAlign='left';
  ctx.fillText('\u2605 target',STRT.x+9,STRT.y+3);
  drawStar(ctx,STRT.x,STRT.y,7,'#cc2222');
  ctx.save();ctx.beginPath();ctx.arc(DST.cx,DST.cy,DST.r,0,Math.PI*2);ctx.clip();
  drawBlob(ctx,B.top.x,B.top.y,B.top.r,'#dd3333',0.32);ctx.restore();
  ctx.save();ctx.font='italic 9px sans-serif';ctx.fillStyle='#cc3333';
  ctx.textAlign='center';ctx.globalAlpha=0.85;
  ctx.fillText('p\u03B8(x)',B.top.x,Math.max(DST.cy-DST.r+14,B.top.y-B.top.r-5));
  ctx.restore();
  ctx.font='bold 11px sans-serif';ctx.fillStyle='#b03030';ctx.textAlign='left';
  ctx.fillText('Naive EDA',COL+10,ROW-10);
  drawProtein(ctx,5,ROW+5,COL-10,H-ROW-10,true);
  ctx.fillStyle='#ffe566';ctx.beginPath();ctx.rect(COL+10,ROW+8,8,8);ctx.fill();
  ctx.strokeStyle='#b89000';ctx.lineWidth=0.7;ctx.stroke();
  ctx.font='8px sans-serif';ctx.fillStyle='#555';ctx.textAlign='left';
  ctx.fillText('interface',COL+21,ROW+16);
  ctx.fillStyle='#b8d4f0';ctx.beginPath();ctx.rect(COL+85,ROW+8,8,8);ctx.fill();
  ctx.strokeStyle='#3060a0';ctx.lineWidth=0.7;ctx.stroke();
  ctx.fillStyle='#555';ctx.fillText('scaffold',COL+96,ROW+16);
  drawCircle(ctx,DSYL);
  ctx.font='9px sans-serif';ctx.fillStyle='#aaa';ctx.textAlign='center';
  ctx.fillText('Interface  (20\u2076)',DSYL.cx,DSYL.cy+DSYL.r+14);
  drawStar(ctx,STYL.x,STYL.y,7,'#cc2222');
  ctx.save();ctx.beginPath();ctx.arc(DSYL.cx,DSYL.cy,DSYL.r,0,Math.PI*2);ctx.clip();
  drawBlob(ctx,B.yl.x,B.yl.y,B.yl.r,'#c8a000',0.42);ctx.restore();
  drawCircle(ctx,DSBL);
  ctx.font='9px sans-serif';ctx.fillStyle='#aaa';ctx.textAlign='center';
  ctx.fillText('Scaffold  (20\u2079)',DSBL.cx,DSBL.cy+DSBL.r+14);
  drawStar(ctx,STBL.x,STBL.y,7,'#cc2222');
  ctx.save();ctx.beginPath();ctx.arc(DSBL.cx,DSBL.cy,DSBL.r,0,Math.PI*2);ctx.clip();
  drawBlob(ctx,B.bl.x,B.bl.y,B.bl.r,'#3060a0',0.42);ctx.restore();
  ctx.font='bold 18px sans-serif';ctx.fillStyle='#999';ctx.textAlign='center';
  ctx.fillText('+',Math.floor((DSYL.cx+DSBL.cx)/2),DSYL.cy+6);
  var conv=Math.min(1,t/0.78);
  var ease=1-Math.pow(1-conv,3);
  if(ease>0.6){
    var fa=(ease-0.6)/0.4;
    ctx.save();ctx.globalAlpha=fa;ctx.font='bold 9px sans-serif';
    ctx.textAlign='center';ctx.fillStyle='#2a7a2a';
    ctx.fillText('\u2713 converged',DSYL.cx,DSYL.cy+7);
    ctx.fillText('\u2713 converged',DSBL.cx,DSBL.cy+7);
    ctx.restore();
  }
  ctx.font='bold 11px sans-serif';ctx.fillStyle='#205090';ctx.textAlign='left';
  ctx.fillText('DADO (decomposed)',COL+10,H-8);
  PT.draw(ctx);PYL.draw(ctx);PBL.draw(ctx);
  ctx.fillStyle='rgba(248,249,250,0.88)';ctx.fillRect(0,H-28,W,28);
  ctx.font='8.5px sans-serif';ctx.fillStyle='#aaa';ctx.textAlign='center';
  ctx.fillText(
    'Naive EDA searches the full 20\u00B9\u2075 space; DADO exploits decomposability to search 20\u2076 + 20\u2079 \u2014 converging faster.',
    W/2,H-10
  );
}

// ─── ANIMATION LOOP ──────────────────────────────────────────────────────────
var atime=0,lts=null,raf=null,active=false;
function tick(ts){
  if(!active)return;
  if(lts===null)lts=ts;
  var dt=Math.min(50,ts-lts);lts=ts;
  atime+=dt;
  var t=(atime%DURATION)/DURATION;
  updateBlobs(t);
  PT.emit( B.top.x,B.top.y,B.top.x-B.top.px,B.top.y-B.top.py,dt);
  PYL.emit(B.yl.x, B.yl.y, B.yl.x-B.yl.px, B.yl.y-B.yl.py, dt);
  PBL.emit(B.bl.x, B.bl.y, B.bl.x-B.bl.px, B.bl.y-B.bl.py, dt);
  PT.update(dt);PYL.update(dt);PBL.update(dt);
  render(cv.getContext('2d'),t);
  raf=requestAnimationFrame(tick);
}
function startA(){if(active)return;active=true;lts=null;raf=requestAnimationFrame(tick);}
function stopA(){active=false;if(raf){cancelAnimationFrame(raf);raf=null;}}

// ─── VISIBILITY (pause when scrolled off-screen) ─────────────────────────────
if(window.IntersectionObserver){
  new IntersectionObserver(function(es){
    es[0].isIntersecting?startA():stopA();
  },{threshold:0.1}).observe(cv);
}

// ─── START ───────────────────────────────────────────────────────────────────
// Script loaded with defer, so DOM is ready. Draw first frame then start loop.
updateBlobs(0);
render(cv.getContext('2d'),0);
startA();
})();
