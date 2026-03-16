---
layout: page
title: "DADO: Leveraging Discrete Function Decomposability for Scientific Design"
permalink: /dado/
nav_exclude: true
nav_enabled: false
hide_search: true
image: /assets/img/research/dado/schematic_lowres.png
description: "We introduce DADO, a method that leverages discrete function decomposability to efficiently search combinatorial design spaces."
---

<div id="dado-anim-wrapper" style="margin:2em 0;">
<canvas id="dado-canvas" width="900" height="480" style="width:100%;height:auto;display:block;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.08);"></canvas>
</div>

<script>
(function(){
'use strict';
// ─── CONSTANTS ───────────────────────────────────────────────────────────────
var W=900,H=480,DURATION=9000;
var AA='ACDEFGHIKLMNPQRSTVWY';
var MAX_P=20,COL=300,ROW=240;
// Design-space circle descriptors
var DST={cx:618,cy:118,r:88,bg:'#fff0f0',border:'#d08080'};
var DSYL={cx:468,cy:362,r:68,bg:'#fffbe6',border:'#c8a800'};
var DSBL={cx:672,cy:362,r:68,bg:'#e8f0ff',border:'#4060a0'};
// Star (target) positions — inside each circle
var STRT={x:682,y:74};
var STYL={x:518,y:322};
var STBL={x:720,y:322};
// Blob initial state
var BIYT={x:DST.cx-30, y:DST.cy+25,r:32};
var BIYL={x:DSYL.cx-35,y:DSYL.cy+28,r:22};
var BIBL={x:DSBL.cx-30,y:DSBL.cy+25,r:22};

// ─── SEEDED RNG (LCG) ────────────────────────────────────────────────────────
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
  // Panel title
  ctx.font='bold 10px sans-serif';ctx.fillStyle='#555';
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillText(hi?'Protein (decomposed)':'Protein sequence',px+6,py+16);
  // Residue boxes
  ctx.font='7px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  for(var i=0;i<n;i++){
    var bx=sx+i*(bw+gap),ii=isIface(i);
    ctx.fillStyle=!hi?'#e0e0e0':ii?'#ffe566':'#b8d4f0';
    ctx.strokeStyle=!hi?'#aaa':ii?'#b89000':'#3060a0';
    ctx.lineWidth=0.8;
    ctx.beginPath();ctx.rect(bx,sy,bw,bh);ctx.fill();ctx.stroke();
    ctx.fillStyle='#222';ctx.fillText(SEQ[i],bx+bw/2,sy+bh/2);
  }
  // Backbone points
  var bky=sy+bh+28;
  var pts=[];
  for(var i=0;i<n;i++)pts.push([sx+i*(bw+gap)+bw/2,bky+Math.sin(i*0.65)*11]);
  // Connector lines seq→backbone
  ctx.strokeStyle='#d8d8d8';ctx.lineWidth=0.5;
  for(var i=0;i<n;i++){
    ctx.beginPath();ctx.moveTo(sx+i*(bw+gap)+bw/2,sy+bh);ctx.lineTo(pts[i][0],pts[i][1]-3.5);ctx.stroke();
  }
  // Backbone curve
  ctx.beginPath();ctx.strokeStyle='#888';ctx.lineWidth=1.8;
  ctx.moveTo(pts[0][0],pts[0][1]);
  for(var i=1;i<n-2;i++){
    var mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;
    ctx.quadraticCurveTo(pts[i][0],pts[i][1],mx,my);
  }
  ctx.quadraticCurveTo(pts[n-2][0],pts[n-2][1],pts[n-1][0],pts[n-1][1]);
  ctx.stroke();
  // Cα dots
  for(var i=0;i<n;i++){
    var ii=isIface(i);
    ctx.beginPath();ctx.arc(pts[i][0],pts[i][1],3.5,0,Math.PI*2);
    ctx.fillStyle=!hi?'#999':ii?'#e0a800':'#4a90d9';ctx.fill();
  }
  // Ligand dashed bonds
  var lx=pts[7][0]+2,ly=pts[7][1]+30;
  ctx.setLineDash([2.5,2]);ctx.strokeStyle=hi?'#b89000':'#cca060';ctx.lineWidth=0.9;
  for(var k=1;k<=3;k++){
    ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(pts[IFACE[k]][0],pts[IFACE[k]][1]);ctx.stroke();
  }
  ctx.setLineDash([]);
  // Ligand circle
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
  // Top blob: slow orbital wander, never converges
  var ang=2*Math.PI*t;
  var wr=36+16*Math.sin(3.5*ang);
  B.top.x=DST.cx-8+wr*Math.cos(ang);
  B.top.y=DST.cy+6+wr*Math.sin(ang*1.4);
  B.top.r=32+7*Math.sin(ang*2.2);
  // Bottom blobs: converge toward stars with ease-out
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
  // Grid dividers
  ctx.strokeStyle='#ddd';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(15,ROW);ctx.lineTo(W-15,ROW);ctx.stroke();
  ctx.beginPath();ctx.moveTo(COL,10);ctx.lineTo(COL,H-10);ctx.stroke();

  // ── TOP ROW ──────────────────────────────────────────────────────────────
  drawProtein(ctx,5,5,COL-10,ROW-10,false);
  drawCircle(ctx,DST);
  // Labels
  ctx.font='9px sans-serif';ctx.fillStyle='#aaa';ctx.textAlign='center';
  ctx.fillText('20\u00B9\u2075 sequences',DST.cx,DST.cy+DST.r+14);
  ctx.font='8px sans-serif';ctx.fillStyle='#cc2222';ctx.textAlign='left';
  ctx.fillText('\u2605 target',STRT.x+9,STRT.y+3);
  drawStar(ctx,STRT.x,STRT.y,7,'#cc2222');
  // Blob clipped to circle
  ctx.save();ctx.beginPath();ctx.arc(DST.cx,DST.cy,DST.r,0,Math.PI*2);ctx.clip();
  drawBlob(ctx,B.top.x,B.top.y,B.top.r,'#dd3333',0.32);ctx.restore();
  // p_theta label near blob
  ctx.save();ctx.font='italic 9px sans-serif';ctx.fillStyle='#cc3333';
  ctx.textAlign='center';ctx.globalAlpha=0.85;
  ctx.fillText('p\u03B8(x)',B.top.x,Math.max(DST.cy-DST.r+14,B.top.y-B.top.r-5));
  ctx.restore();
  // Row label
  ctx.font='bold 11px sans-serif';ctx.fillStyle='#b03030';ctx.textAlign='left';
  ctx.fillText('Naive EDA',COL+10,ROW-10);

  // ── BOTTOM ROW ───────────────────────────────────────────────────────────
  drawProtein(ctx,5,ROW+5,COL-10,H-ROW-10,true);
  // Legend swatches
  ctx.fillStyle='#ffe566';ctx.beginPath();ctx.rect(COL+10,ROW+8,8,8);ctx.fill();
  ctx.strokeStyle='#b89000';ctx.lineWidth=0.7;ctx.stroke();
  ctx.font='8px sans-serif';ctx.fillStyle='#555';ctx.textAlign='left';
  ctx.fillText('interface',COL+21,ROW+16);
  ctx.fillStyle='#b8d4f0';ctx.beginPath();ctx.rect(COL+85,ROW+8,8,8);ctx.fill();
  ctx.strokeStyle='#3060a0';ctx.lineWidth=0.7;ctx.stroke();
  ctx.fillStyle='#555';ctx.fillText('scaffold',COL+96,ROW+16);
  // Yellow (interface) space
  drawCircle(ctx,DSYL);
  ctx.font='9px sans-serif';ctx.fillStyle='#aaa';ctx.textAlign='center';
  ctx.fillText('Interface  (20\u2076)',DSYL.cx,DSYL.cy+DSYL.r+14);
  drawStar(ctx,STYL.x,STYL.y,7,'#cc2222');
  ctx.save();ctx.beginPath();ctx.arc(DSYL.cx,DSYL.cy,DSYL.r,0,Math.PI*2);ctx.clip();
  drawBlob(ctx,B.yl.x,B.yl.y,B.yl.r,'#c8a000',0.42);ctx.restore();
  // Blue (scaffold) space
  drawCircle(ctx,DSBL);
  ctx.font='9px sans-serif';ctx.fillStyle='#aaa';ctx.textAlign='center';
  ctx.fillText('Scaffold  (20\u2079)',DSBL.cx,DSBL.cy+DSBL.r+14);
  drawStar(ctx,STBL.x,STBL.y,7,'#cc2222');
  ctx.save();ctx.beginPath();ctx.arc(DSBL.cx,DSBL.cy,DSBL.r,0,Math.PI*2);ctx.clip();
  drawBlob(ctx,B.bl.x,B.bl.y,B.bl.r,'#3060a0',0.42);ctx.restore();
  // "+" separator
  ctx.font='bold 18px sans-serif';ctx.fillStyle='#999';ctx.textAlign='center';
  ctx.fillText('+',Math.floor((DSYL.cx+DSBL.cx)/2),DSYL.cy+6);
  // Convergence labels (fade in once blobs are near stars)
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
  // Row label
  ctx.font='bold 11px sans-serif';ctx.fillStyle='#205090';ctx.textAlign='left';
  ctx.fillText('DADO (decomposed)',COL+10,H-8);
  // Particles (drawn last so they float over circles)
  PT.draw(ctx);PYL.draw(ctx);PBL.draw(ctx);
  // Footer caption with background strip
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
  var cv=document.getElementById('dado-canvas');
  if(cv)render(cv.getContext('2d'),t);
  raf=requestAnimationFrame(tick);
}
function startA(){if(active)return;active=true;lts=null;raf=requestAnimationFrame(tick);}
function stopA(){active=false;if(raf){cancelAnimationFrame(raf);raf=null;}}

// ─── INTERSECTION OBSERVER (pause when off-screen) ───────────────────────────
function initVis(){
  var el=document.getElementById('dado-anim-wrapper');
  if(!el||!window.IntersectionObserver)return;
  new IntersectionObserver(function(es){
    es[0].isIntersecting?startA():stopA();
  },{threshold:0.1}).observe(el);
}

// ─── VIDEO RECORDING ─────────────────────────────────────────────────────────
function record(){
  var cv=document.getElementById('dado-canvas');
  var btn=document.getElementById('dado-rec-btn');
  var dl=document.getElementById('dado-dl');
  if(!cv||!cv.captureStream){alert('captureStream not supported. Try Chrome or Edge.');return;}
  btn.disabled=true;btn.textContent='Recording\u2026';
  // Reset to start of loop for a clean recording
  atime=0;lts=null;
  var mime=MediaRecorder.isTypeSupported('video/mp4')?'video/mp4':'video/webm;codecs=vp9';
  var chunks=[];
  var mr=new MediaRecorder(cv.captureStream(30),{mimeType:mime,videoBitsPerSecond:3000000});
  mr.ondataavailable=function(e){if(e.data.size)chunks.push(e.data);};
  mr.onstop=function(){
    var ext=mime.indexOf('mp4')>-1?'mp4':'webm';
    var url=URL.createObjectURL(new Blob(chunks,{type:mime}));
    dl.href=url;dl.download='dado_animation.'+ext;
    dl.style.display='inline';dl.textContent='\u2b07 dado_animation.'+ext;
    btn.disabled=false;btn.textContent='Record animation';
  };
  mr.start();
  setTimeout(function(){mr.stop();},DURATION+400);
}

// ─── INIT ────────────────────────────────────────────────────────────────────
function init(){
  updateBlobs(0);
  var cv=document.getElementById('dado-canvas');
  if(cv)render(cv.getContext('2d'),0);
  startA();   // start immediately — don't rely solely on IntersectionObserver
  initVis();  // IO will still pause/resume when scrolled off-screen
}
// Guard against DOMContentLoaded already having fired (common with inline scripts)
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
}else{
  init();
}
})();
</script>

This is a short (est. 5-10 min) blog post introducing our paper:

> **[Leveraging Discrete Function Decomposability for Scientific Design](https://arxiv.org/abs/2511.03032)**<br/>
> [JC Bowden](https://james-bowden.github.io){:.author-link}, [S Levine](https://people.eecs.berkeley.edu/~svlevine/){:.author-link}, [J Listgarten](http://www.jennifer.listgarten.com/){:.author-link}<br/>
> International Conference on Learning Representations (ICLR), 2026

---

<details style="margin-top: 1.5em;">
<summary><h3 style="display: inline;">Problem setup: protein sequence design</h3></summary>

Though our method can be used for any optimization problem over a discrete design space, in this blog, for concreteness, let's consider only the problem of designing a protein sequence.
We can set this up as follows:
<ol>
<li>The kind of discrete object that we'd like to design, $x$, is a protein sequence of length $L$ in which each design variable (or "position"), $x_i$, is an amino acid from an alphabet, $A_i$. For simplicity, we'll assume that every position uses the same standard amino acid alphabet of size 20, $A$.</li>
<li>Given $L$ and $A$, we can write the design space as $X := A^L$, i.e., all amino acid sequences of length $L$. It follows that there are $\lvert A\rvert^L=20^L$ possible proteins to choose from.</li>
<li>Specify a property function to design toward, $f(x)$, such as binding affinity to a target, or gene editing efficiency. In practice, this may be a predictive model fit on limited assay-labeled data.</li>
<li>Putting this all together, our design problem is to find a sequence that maximizes our specification: $x^{\ast}=\arg\max_{x\in X} f(x)$.</li>
</ol>

</details>

<details style="margin-top: 1.5em;">
<summary><h3 style="display: inline;">Primer: distributional optimization and EDAs</h3></summary>

Distributional optimization is a way of solving such design problems; estimation of distribution algorithms (EDAs) and policy optimization in reinforcement learning are two common instantiations.
Compared to naively evaluating one protein, then the next, until all of $X$ has been considered, distributional optimization algorithms navigate the design space using a probability distribution, $p_\theta(x)$, often referred to as a "search distribution" or a "policy".
Intuitively, the search distribution is like a spotlight that moves through the design space toward regions where $f(x)$ is larger.
In modern times, $p_\theta(x)$ is typically parameterized as a highly expressive neural network generative model, like an autoregressive model or diffusion model, allowing for pretty arbitrarily shaped spotlights.
$p_\theta(x)$ might also be initialized as some pre-trained model, in which case we would in effect be implementing a kind of RL fine-tuning (with $f$ as the reward signal). Alternatively, one might initialize $p_\theta(x)$ to be a uniform distribution on a certain set of designs, e.g., those tested in an initial experiment, or initialize it completely at random.
In pseudocode, a standard distributional optimization workflow looks like this:

<figure id="eda-pseudocode" style="border: 1px solid #ccc; border-radius: 4px; padding: 0.75em 1em; margin: 1.5em 0;">
<figcaption style="font-weight: bold; margin-bottom: 0.5em;">Standard EDA pseudocode</figcaption>
<ol style="font-family: monospace; margin: 0; padding-left: 3em;">
<li>Initialize $p_\theta(x)$</li>
<li>for $N$ training iterations do</li>
<li>{{ site.indent }}Sample $K$ designs, $\{x^1, \ldots, x^K\} \sim p_\theta(x)$</li>
<li>{{ site.indent }}Compute a weight for each sample, $w^k=f(x^k)$</li>
<li>{{ site.indent }}Update $p_\theta(x)$ via weighted maximum likelihood:</li>
<li>{{ site.indent }}{{ site.indent }}$\theta \leftarrow \arg\max_\theta \mathbb{E}_{\{x^k\}}[w^k \log p_\theta(x^k)]$</li>
<li style="list-style-type: none;">&nbsp;</li>
<li>Sample from $p_\theta(x)$ up to your experimental budget and test in the lab!</li>
</ol>
</figure>

There's much more discussion of EDAs, their derivation, relevant hyperparameters, and the important ways they can be extended in our paper.
</details>

### Decomposing the design space

Although the standard EDA is great for solving $$\arg\max_\theta \mathbb{E}_{p_\theta(x)}[f(x)]$$, $$p_\theta(x)$$ still has to search a combinatorially large design space!
Even if we use a lot of samples for the <a href="#eda-pseudocode">weighted maximum likelihood update</a>, it may still take many iterations to find good designs.

In protein design (and other scientific design settings), however, we often have information that can help us <strong>decompose</strong> the design space and thereby search a much smaller space.
For example, many protein design workflows assume, roughly, that the active site of a protein and the scaffold can be designed separately (sometimes called a [scaffolding problem](https://www.nature.com/articles/s41586-023-06415-8#Sec4)).
More formally, if we denote active site positions as $$x_a$$ and scaffold positions as $$x_s$$ (with no overlapping positions; $$L=L_a+L_s$$), this assumption[^scaffold] amounts to asserting that $$f(x_a, x_s) = f_a(x_a) + f_s(x_s)$$.
We can exploit the linear additive structure in $f$ to instead solve two separate, smaller optimization problems, $$[x_a^{\ast}, x_s^{\ast}] = \arg\max_{x_a,x_s} f(x_a, x_s) = [\arg\max_{x_a} f_a(x_a), \arg\max_{x_s} f_p(x_s)]$$,
yielding a massive reduction in the size of the effective search space from $20^L$ to $$20^{L_a} + 20^{L_s}$$. Completely separate EDAs can be used for each. 
Even for a tiny protein composed of two length-$5$ parts, this is a huge gain: $20^{10} \gg 20^5 + 20^5$ (7 orders of magnitude).

We don't expect such clean-cut decomposability in most problems.
**Our core contribution is to generalize the EDA to be able to leverage *any* linear additive structure in $f(x)$.** 
This means, in particular, accommodating design variables that participate in multiple linear additive components, such that we can't just solve completely separate optimization problems.
To do this, we formalize a decomposition of $f(x)$ as an undirected graph in which nodes represent design variables and edges denote coupling. The above example corresponds to a graph with two disconnected components, each of which is fully connected internally.
Let's now look at some graph decompositions derived from real protein design problems.

<div id="dado-composite" style="line-height: 0; cursor: zoom-in;">
<img src="/assets/img/research/dado/titles.webp" style="width: 100%; display: block;" alt="titles"/>
<div style="position: relative;">
  <img src="/assets/img/research/dado/aav.webp" style="width: 100%; display: block;" alt="AAV"/>
  <span style="position: absolute; top: 0.4em; left: 0.5em; line-height: 1;"><strong>a,</strong> AAV</span>
</div>
<div style="position: relative;">
  <img src="/assets/img/research/dado/phot.webp" style="width: 100%; display: block;" alt="CreiLOV"/>
  <span style="position: absolute; top: 0.4em; left: 0.5em; line-height: 1;"><strong>b,</strong> CreiLOV</span>
</div>
</div>

In the figure above, we show one way to obtain a decomposition graph for a protein design problem.
For two proteins, AAV VP1 (which co-assembles into a virus capsid) and CreiLOV (an oxygen-independent fluorophore), we first obtain a 3D structure from AlphaFold3 (column 1 from left).
To extract a decomposition graph from the 3D structure, we compute distances between all pairs of designable positions and create an edge if they're within 4.5Å of each other (column 2).
Briefly, we can (easily) convert any undirected graph into a directed *junction tree* (column 5; also columns 3--4), which we'll need in the next section.

Notice that the decomposition graph for AAV (column 2) has few edges and is relatively chain-like. This suggests that we will be able to realize a large efficiency gain by operating in its decomposed design space.
On the other hand, CreiLOV looks a lot more like a fully-connected graph. In this case, we can't expect to improve over a naive optimization method which considers all variables jointly.
Of course, one could choose (e.g., based on domain-knowledge) to lower the contact distance, resulting in a more sparsely-connected decomposition with a larger potential efficiency gain.
This hints at a key tradeoff in practice: the more decomposed the problem, the more efficiently it can be optimized, but if the chosen decomposition is too aggressive, it might preclude performant designs from being found.


### Leveraging decomposability for efficient distributional optimization

Now that we have a sense of the decomposition graphs we're working with, we can build intuition for how a distributional optimization algorithm that's aware of them will be more efficient.
We call our method Decomposition-Aware Distributional Optimization, or DADO, and it has two important components. 

First, we use a search distribution factorized according to the decomposition graph such that search is performed entirely within the decomposed space.
Each junction tree node (columns 4--5 above) gets its own search distribution, $$p_\theta(\tilde{x}_i\mid \tilde{x}_p)$$, conditioned on its parent.
Compared to the standard EDA, which searches all dimensions of $$x$$ together, we have multiple separate search distributions, each searching only the dimensions of $$x$$ specified by its junction tree node.
This factorization makes it so that DADO only "sees" the smaller decomposed space[^fda].

Second, we globally coordinate these separate search distribution factors by passing messages between them.
Messages called **value functions** are passed from the leaves of the junction tree to the root, communicating to each parent node the status of its children.
These value functions, $$Q_i(\tilde{x}_i, \tilde{x}_p)$$, describe the partial value of $f$ on the subtree from a particular node, in expectation over its descendants' search distributions.
Each node aggregates all of its children's value functions into its own and then uses it to shift its search distribution optimally with respect to its children.
Specifically, each search distribution factor gets its own, separate weighted maximum likelihood update, using its value function as the weight instead of $f(x)$ directly.
This separate update step makes DADO more statistically efficient than the standard EDA: each lower-dimensional distribution is updated using the full sample budget (panel b, below).
Decentralized updates are possible because the value functions provide explicit coordination across all design variables (most importantly, those out of scope).
The conditional dependence of each search distribution factor and value function closes the loop: each node responds to whichever partial designs are sampled from its parent's search distribution.
As a consequence, all coordination flows through the root node, which indirectly aggregates value functions from all other nodes in the junction tree and upon whose samples all other nodes are indirectly conditioned.
Sequential conditional sampling from the root to the leaves produces high-$f$ designs once DADO has been trained.

<img src="/assets/img/research/dado/schematic.webp" style="width: 100%; display: block;" alt="DADO schematic"/>

Given some tree-decomposition of $f$ (panel a), <a href="#eda-pseudocode">standard EDAs</a> ignore this information and simply weight samples from a joint search distribution over all design variables, $p_\theta(x)$, with $f(x)$ (panel b, top).
In contrast, DADO is infused with the decomposition---its search distribution is factorized accordingly, and value functions are used to weight dimensions of each sample corresponding to each node (panel b, bottom).
DADO can be much more statistically efficient than a standard EDA for a fixed sample budget because it gets to use all $K$ samples to update each lower-dimensional search distribution factor.
This can lead to finding the same good designs as a standard EDA in fewer iterations, or simply better designs, which may have required a much larger sample budget for a standard EDA to find (example results on a synthetic problem in panel c).

In summary, DADO both operates in a smaller, decomposed design space compared to the standard EDA, and uses a more statistically efficient sample-based update to its search distribution.
For definitions and derivations of the value functions and optimization objectives, see the paper.


### Outtakes

Finding an accurate decomposition for a design problem is not always straightforward. The real world is often structured though, and even very approximate decompositions can be useful.
One might try to infer decomposability from labeled data, use auxiliary information, run a bi-level optimization, or some other creative scheme.
This is an exciting research direction both for proteins and scientific design in general.

We also expect that there are more clever ways to estimate the value functions, which could improve optimization efficiency further and make DADO practical for problems with even larger junction tree nodes.
That is, the more accurate the value functions, the more one can squeeze out of densely connected (not very tree-like!) decomposition graphs.
The RL literature is likely a good place to look for inspiration.


We hope you'll read (and enjoy) our paper!
Feel free to [email me](mailto:jcbowden@berkeley.edu) with any questions or comments.
I'd also be excited to discuss applying our method to your problem, or potential collaboration.

---

<script>
document.addEventListener('DOMContentLoaded', function () {
  function makeOverlay(inner) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out';
    ov.appendChild(inner);
    ov.addEventListener('click', function () { document.body.removeChild(ov); });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') { document.body.removeChild(ov); document.removeEventListener('keydown', onKey); }
    });
    document.body.appendChild(ov);
  }

  var composite = document.getElementById('dado-composite');
  composite.addEventListener('click', function () {
    var rect = composite.getBoundingClientRect();
    var scale = Math.min(window.innerWidth * 0.92 / rect.width, window.innerHeight * 0.92 / rect.height);
    var clone = composite.cloneNode(true);
    clone.removeAttribute('id');
    clone.style.cssText += ';transform:scale('+scale+');transform-origin:center;width:'+rect.width+'px;cursor:default;pointer-events:none';
    makeOverlay(clone);
  });

  var schematic = document.querySelector('img[src$="schematic.webp"]');
  schematic.style.cursor = 'zoom-in';
  schematic.addEventListener('click', function () {
    var img = document.createElement('img');
    img.src = schematic.src;
    img.style.cssText = 'max-width:92vw;max-height:92vh;object-fit:contain;cursor:default';
    makeOverlay(img);
  });
});
</script>

[^scaffold]: At its strongest. People know that this assumption doesn't hold everywhere; e.g., if the scaffold is modified such that the protein no longer folds properly, then the active site probably won't be able to contribute to overall function in any way. Emphasis is more on the fact that people often break their protein design problems down into these two smaller problems, which are then much easier to tackle, even if the decomposition isn't perfect. We use the crudest version of this assumption as a didactic example.

[^fda]: In our paper, we include a baseline---a modernized version of the factorized distribution algorithm, or FDA---that *only* uses a factorization of the search distribution without the message-passing coordination. In FDA, the factorized search distribution is updated the same way as the standard EDA, with a per-sample weight, $f(x)$, instead of a per-node weight. It's interesting that for a few problems, FDA performs as well as or better than DADO, despite its search distribution update being less statistically efficient. We suspect this is due to an additional source of variance---the sample-based approximation of DADO's value functions---which can outweigh the benefit of a per-node update. We only observed this when the junction tree nodes were relatively large, which is exactly when estimating a value function from finite samples is most difficult. It would be interesting to more carefully characterize this behavior, and one might adapt variance-reduction techniques from RL (like learned value functions) here.
