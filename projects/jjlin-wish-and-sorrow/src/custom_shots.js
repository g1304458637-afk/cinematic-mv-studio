/* custom_shots.js — close-ups and inserts that cannot be expressed as a set+actor spec. */
function finishFrame(ctx,t,frame,opts={}){
  pigmentPass(ctx,opts.paper??.16);
  vignette(ctx,opts.vig??.52); filmGrain(ctx,frame,.028);
}
function pigmentPass(ctx,paperA=.16){
  if(TEX&&TEX.washPat){
    ctx.save(); ctx.globalCompositeOperation='multiply'; ctx.globalAlpha=.14; ctx.fillStyle=TEX.washPat; ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='screen'; ctx.globalAlpha=.055; ctx.fillStyle=TEX.dryPat; ctx.fillRect(0,0,W,H); ctx.restore();
  }
  ctx.save(); ctx.globalCompositeOperation='overlay'; ctx.globalAlpha=.55;
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(100,140,145,.10)'); g.addColorStop(.55,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(180,120,70,.12)');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.restore();
  paperOverlay(ctx,0,paperA);
}
function handPath(x,y,s,side=1,pose={}){
  // local hand: wrist at 0,0; fingers toward -y; side mirrors x
  const p=new Path2D(); const sp=pose.spread??.8, curl=pose.curl??.2;
  p.ellipse(0,-20*s,34*s,42*s,0,0,TAU);
  for(let i=0;i<4;i++){
    const bx=(-24+i*16)*s*side, by=-52*s;
    const len=(52-Math.abs(i-1.4)*7)*s;
    const a=(-.22+i*.15)*sp*side;
    const ex=bx+Math.cos(a)*len*.35, ey=by-len*(1-curl*.25);
    p.addPath(capsulePath(bx,by,ex,ey,6.5*s,4.5*s,8));
  }
  p.addPath(capsulePath(-30*s*side,-10*s,(-52-curl*10)*s*side,18*s,7*s,5*s,8));
  return p;
}
function drawHandSil(ctx,x,y,s,side,pose={},opts={}){
  const p=handPath(x,y,s,side,pose);
  ctx.save(); ctx.translate(x,y);
  if(opts.rim!==false){
    ctx.strokeStyle=withAlpha(opts.rim||'#f0c98e',Math.min(1,(opts.rimAlpha??.5)+.2)); ctx.lineWidth=4.5*s; ctx.filter='blur(2px)';
    ctx.save(); ctx.translate(-2*s,-2*s); ctx.stroke(p); ctx.restore();
  }
  if(opts.lit){
    ctx.fillStyle='#a06a4e'; ctx.fill(p);
    ctx.strokeStyle='#2a1a12'; ctx.lineWidth=2.2*s; ctx.stroke(p);
    ctx.save(); ctx.globalAlpha=.25; ctx.fillStyle='#e8b877'; ctx.fill(p); ctx.restore();
  } else { ctx.fillStyle=opts.dark||'#3d2b20'; ctx.fill(p); }
  ctx.restore();
}
function bgMacro(ctx,c1='#3a2c22',c2='#12100d'){
  const g=ctx.createRadialGradient(540,860,80,540,1000,1100); g.addColorStop(0,c1); g.addColorStop(1,c2);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  for(let i=0;i<160;i++){ ctx.save(); ctx.globalAlpha=.03+hash2(1100,i)*.06; ctx.fillStyle=i%2?'#e8dcc4':'#000'; ctx.beginPath(); ctx.arc(hash2(1101,i)*W,hash2(1102,i)*H,1+hash2(1103,i)*8,0,TAU); ctx.fill(); ctx.restore(); }
}
function eyeCloseup(ctx,t,u,opts={}){
  const { tear=0, scar=0, red=0, blink=0 } = opts;
  const ex=540, ey=900, ew=360, eh=150;
  // face planes in shadow
  const g=ctx.createRadialGradient(ex-100,ey-80,40,ex,ey,700); g.addColorStop(0,'#5a3a2a'); g.addColorStop(1,'#120d0b');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  for(let i=0;i<9;i++){ ctx.save(); ctx.globalAlpha=.12; ctx.strokeStyle='#d39a72'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(200+i*30,ey-260); ctx.quadraticCurveTo(260+i*40,ey-100,220+i*45,ey+220); ctx.stroke(); ctx.restore(); }
  // brow
  const bp=new Path2D(); bp.moveTo(ex-190,ey-120); bp.quadraticCurveTo(ex-60,ey-180,ex+140,ey-110); bp.quadraticCurveTo(ex-40,ey-150,ex-180,ey-100);
  ctx.fillStyle='#1a1210'; ctx.fill(bp);
  // eye shape
  const open=1-blink;
  const ep=new Path2D();
  ep.moveTo(ex-ew*.55,ey+10);
  ep.quadraticCurveTo(ex-ew*.2,ey-eh*.8*open,ex+ew*.12,ey-eh*.72*open);
  ep.quadraticCurveTo(ex+ew*.45,ey-eh*.55*open,ex+ew*.52,ey+4);
  ep.quadraticCurveTo(ex+ew*.2,ey+eh*.62,ex-ew*.2,ey+eh*.55);
  ep.quadraticCurveTo(ex-ew*.45,ey+eh*.4,ex-ew*.55,ey+10);
  ctx.save(); ctx.fillStyle='#e8d7bd'; ctx.fill(ep); ctx.clip(ep);
  // iris
  const ig=ctx.createRadialGradient(ex+30,ey+10,10,ex+30,ey+10,84);
  ig.addColorStop(0,'#8a5c32'); ig.addColorStop(.55,'#4a2d1d'); ig.addColorStop(1,'#160e0c');
  ctx.fillStyle=ig; ctx.beginPath(); ctx.arc(ex+30,ey+6,88,0,TAU); ctx.fill();
  ctx.fillStyle='#0d0908'; ctx.beginPath(); ctx.arc(ex+30,ey+6,42,0,TAU); ctx.fill();
  ctx.fillStyle='rgba(255,246,220,.9)'; ctx.beginPath(); ctx.arc(ex-2,ey-30,13,0,TAU); ctx.fill();
  ctx.fillStyle='rgba(255,246,220,.35)'; ctx.beginPath(); ctx.arc(ex+58,ey+34,6,0,TAU); ctx.fill();
  // red reflection
  if(red>0){ ctx.fillStyle=withAlpha('#d5482f',.35*red); ctx.beginPath(); ctx.arc(ex-50,ey+18,16,0,TAU); ctx.fill(); }
  ctx.restore();
  // lash + folds
  inkStroke(ctx,[[ex-ew*.55,ey+8],[ex-ew*.1,ey-eh*.78*open],[ex+ew*.3,ey-eh*.6*open],[ex+ew*.52,ey+2]],{w:10,color:'#1a1210',seed:1201,taper:.2,alpha:.95,jitter:.6});
  inkStroke(ctx,[[ex-ew*.5,ey+20],[ex-ew*.1,ey+eh*.5],[ex+ew*.35,ey+eh*.45],[ex+ew*.5,ey+12]],{w:3,color:'#3a241c',seed:1202,alpha:.5,jitter:.4});
  // scar
  if(scar>0) inkStroke(ctx,[[ex+120,ey-200],[ex+170,ey-60],[ex+145,ey+80]],{w:5,color:'#8b5444',seed:1203,alpha:.6,taper:.4});
  // tear
  if(tear>0){ ctx.save(); ctx.globalAlpha=tear*.8; const tg=ctx.createLinearGradient(ex-100,ey+30,ex-100,ey+260); tg.addColorStop(0,'rgba(220,240,238,.8)'); tg.addColorStop(1,'rgba(150,200,205,0)'); ctx.fillStyle=tg; ctx.beginPath(); ctx.ellipse(ex-100,ey+150,7,120,0,0,TAU); ctx.fill(); ctx.restore(); }
  // foreground blur
  ctx.save(); ctx.globalAlpha=.5; ctx.filter='blur(10px)'; ctx.fillStyle='#0a0a09'; ctx.fillRect(0,0,W,260); ctx.fillRect(0,H-200,W,200); ctx.filter='none'; ctx.restore();
  finishFrame(ctx,t,0,{paper:.12,vig:.62});
}
const CUSTOM_SHOTS = {
  S03(ctx,t,u,frame){
    bgMacro(ctx,'#2b2118','#080a09');
    glow(ctx,540,900,620,'#e8cf9e',.22);
    // dust grain
    const gx=540,gy=900,s=1+u*.4;
    ctx.save(); ctx.translate(gx,gy); ctx.scale(s,s);
    for(let i=0;i<7;i++) paintShape(ctx,blobPath((hash2(1300,i)-.5)*260,(hash2(1301,i)-.5)*260,20+hash2(1302,i)*70,14+hash2(1303,i)*40,1304+i,.35,12),{color:i%2?'#8a7458':'#6b5a44',gy0:-200,gy1:200,edgeW:4,ink:'#3a2e22',inkW:1.5,seed:1310+i});
    // crack / green spore
    const crack=clamp((u-.25)/.5);
    inkStroke(ctx,[[0,-120],[crack*20,-20+crack*30],[-8,120]],{w:4+crack*8,color:'#d9e8b0',seed:1320,alpha:.4+crack*.5,jitter:1.2});
    glow(ctx,0,0,80+120*crack,'#b9d98a',.25+ .45*crack);
    if(crack>.2){ ctx.fillStyle=withAlpha('#d8f0a6',crack); ctx.beginPath(); ctx.ellipse(0,0,10+12*crack,6+8*crack,0,0,TAU); ctx.fill(); }
    ctx.restore();
    // hand entering from below
    const hy=1500-u*260;
    glow(ctx,620,hy-40,300,'#e8b877',.22);
    drawHandSil(ctx,620,hy,1.9,-1,{spread:.9,curl:.35},{rim:'#ffd9a0',rimAlpha:.8,lit:true});
    // dust motes
    ashMotes(ctx,t,null,160,1330,{color:'#d8c8aa',alpha:.35,size:2});
    finishFrame(ctx,t,frame,{paper:.18,vig:.6});
  },
  S05(ctx,t,u,frame){
    // plaster wall, tally marks, hand adding one
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#5a5245'); g.addColorStop(1,'#2b2721'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    for(let i=0;i<60;i++){ ctx.save(); ctx.globalAlpha=.05+hash2(1400,i)*.08; ctx.strokeStyle=i%2?'#d8c9ad':'#17140f'; ctx.lineWidth=1+hash2(1401,i)*3; ctx.beginPath(); ctx.moveTo(0,hash2(1402,i)*H); ctx.lineTo(W,hash2(1403,i)*H); ctx.stroke(); ctx.restore(); }
    // tally rows
    const rows=9, cols=18;
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const x=90+c*52, y=260+r*150;
      ctx.save(); ctx.globalAlpha=.35+hash2(1410+r*20+c,1)*.4; ctx.strokeStyle='#d9cbb2'; ctx.lineWidth=2.2;
      for(let k=0;k<4;k++){ ctx.beginPath(); ctx.moveTo(x+k*9,y); ctx.lineTo(x+k*9-3,y+38); ctx.stroke(); }
      if(hash2(1420+r*20+c,2)>.25){ ctx.beginPath(); ctx.moveTo(x-8,y+30); ctx.lineTo(x+38,y+4); ctx.stroke(); }
      ctx.restore();
    }
    // fresh mark
    const mark=clamp((u-.4)/.3);
    if(mark>0){ ctx.save(); ctx.globalAlpha=.9; ctx.strokeStyle='#f2e7d3'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(990,1300); ctx.lineTo(986,1300+46*mark); ctx.stroke(); ctx.restore(); }
    // hand
    drawHandSil(ctx,1000,1560-u*80,1.4,1,{spread:.6,curl:.5},{rim:'#e8c28c',rimAlpha:.45});
    glow(ctx,700,900,500,'#c9a878',.08);
    finishFrame(ctx,t,frame,{paper:.2,vig:.58});
  },
  S14(ctx,t,u,frame){
    // recognition: eye + crane
    eyeCloseup(ctx,t,u,{scar:1,tear:clamp((u-.4)/.3)*.8,blink:(u>.2&&u<.26)?.9:0});
    paperCrane(ctx,790,1350-u*40,1.35,-.2,{alpha:.9,flap:u*2});
    finishFrame(ctx,t,frame,{paper:.12,vig:.6});
  },
  S16(ctx,t,u,frame){
    // triptych: wound / two cranes / wrist signal
    ctx.fillStyle='#2b241d'; ctx.fillRect(0,0,W,H);
    const panels=[[0,0,W,H/3],[0,H/3,W,H/3],[0,2*H/3,W,H/3]];
    for(let i=0;i<3;i++){ const [x,y,w,h]=panels[i]; ctx.save(); ctx.beginPath(); ctx.rect(x+30,y+28,w-60,h-56); ctx.clip();
      const local=clamp(u*3-i,0,1);
      if(i===0){ const g=ctx.createRadialGradient(540,y+180,20,540,y+180,420); g.addColorStop(0,'#9a6a48'); g.addColorStop(1,'#2a1c16'); ctx.fillStyle=g; ctx.fillRect(x,y,w,h);
        ctx.strokeStyle='#d8c9ad'; ctx.lineWidth=14; ctx.beginPath(); ctx.moveTo(320,y+180); ctx.quadraticCurveTo(500,y+70,720,y+190); ctx.stroke();
        drawHandSil(ctx,700,y+230,1.1,-1,{spread:.6,curl:.3},{rim:'#e8c28c',rimAlpha:.35}); }
      if(i===1){ ctx.fillStyle='#473c2e'; ctx.fillRect(x,y,w,h); paperCrane(ctx,430,y+180,1.2,-.2,{alpha:.9,flap:local*2}); paperCrane(ctx,650,y+200,1.05,.2,{alpha:.7,flap:1+local*2,color:'#cbbfa6'}); }
      if(i===2){ ctx.fillStyle='#26302f'; ctx.fillRect(x,y,w,h); deviceProp(ctx,540,y+180,2.6,t,'red'); glow(ctx,540,y+180,150,'#d5482f',.25); }
      ctx.restore();
      ctx.strokeStyle='#3b342b'; ctx.lineWidth=2; ctx.strokeRect(x+30,y+28,w-60,h-56);
    }
    // panel dividers animate in
    ctx.save(); ctx.globalAlpha=.8; ctx.fillStyle='#0b0a09'; ctx.fillRect(0,0,W,H*.06); ctx.fillRect(0,H*.94,W,H*.06); ctx.restore();
    finishFrame(ctx,t,frame,{paper:.1,vig:.55});
  },
  S20(ctx,t,u,frame){
    // device showing dead gardens + vial of ashes
    bgMacro(ctx,'#241d16','#0a0b09');
    ctx.save(); ctx.translate(540,900);
    paintShape(ctx,roundRectPath(-340,-250,680,500,18),{color:'#15191a',gy0:-210,gy1:210,edgeW:6,ink:'#0a0d0e',inkW:3,seed:1500});
    ctx.save(); ctx.beginPath(); ctx.roundRect(-310,-220,620,440,10); ctx.clip();
    const g=ctx.createLinearGradient(0,-180,0,180); g.addColorStop(0,'#3d5550'); g.addColorStop(1,'#a08a62'); ctx.fillStyle=g; ctx.fillRect(-310,-220,620,440);
    for(let r=0;r<6;r++) for(let c=0;c<9;c++){ ctx.fillStyle=withAlpha('#b9a888',.18); ctx.beginPath(); ctx.ellipse(-230+c*58,40+r*22,18,4,0,0,TAU); ctx.fill(); }
    ctx.globalAlpha=.6; ctx.fillStyle='#d5482f'; ctx.beginPath(); ctx.arc(230,-150,6,0,TAU); ctx.fill(); ctx.restore();
    ctx.restore();
    // vial + ash
    drawHandSil(ctx,900,1450,1.2,1,{spread:.5,curl:.5},{rim:'#e8c28c',rimAlpha:.3});
    ctx.save(); ctx.translate(800,1300); ctx.rotate(-.5);
    ctx.fillStyle='rgba(210,230,220,.25)'; ctx.strokeStyle='#d9e6d8'; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(-18,-80,36,120,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#8b8171'; ctx.beginPath(); ctx.roundRect(-14,-60,28,30,5); ctx.fill(); ctx.restore();
    for(let i=0;i<40;i++){ const a=u*1.4; const x=800+Math.sin(i)*30*a, y=1300+40+i*4+u*180; ctx.fillStyle=withAlpha('#b9ae98',.5); ctx.beginPath(); ctx.arc(x,y,1.5,0,TAU); ctx.fill(); }
    finishFrame(ctx,t,frame,{paper:.14,vig:.55});
  },
  S24(ctx,t,u,frame){
    // hands on the seed pod, root curls
    bgMacro(ctx,'#241f17','#080a08');
    glow(ctx,540,1000,650,'#e8cf9e',.24);
    const open=.3+u*.5;
    seedPod(ctx,540,980,1.25,{open,glowOn:true,t});
    glow(ctx,300,1010,300,'#e8b877',.24);
    drawHandSil(ctx,300,1010,1.55,1,{spread:.55,curl:.65},{rim:'#ffd9a0',rimAlpha:.85,lit:true});
    glow(ctx,780,1010,300,'#e8b877',.24);
    drawHandSil(ctx,780,1010,1.55,-1,{spread:.55,curl:.65},{rim:'#e8f0ff',rimAlpha:.8,lit:true});
    for(let i=0;i<7;i++){ const a=-.6+i*.2; inkStroke(ctx,[[540,980],[540+Math.cos(a)*(90+u*160),980+Math.sin(a)*(50+u*90)]],{w:2.5,color:'#cfe0a6',seed:1600+i,alpha:.5+u*.3,jitter:1}); }
    glow(ctx,540,980,120+u*160,'#d8f0a6',.3+u*.3);
    ashMotes(ctx,t,null,90,1610,{color:'#e0d2b2',alpha:.25,size:1.5});
    finishFrame(ctx,t,frame,{paper:.13,vig:.58});
  },
  S36(ctx,t,u,frame){
    // seed cracks; four hands; light
    bgMacro(ctx,'#2a241a','#0a0b09');
    glow(ctx,540,1000,680,'#e8cf9e',.24);
    const crack=clamp(u*1.6);
    seedPod(ctx,540,1000,1.05,{open:.4+crack*.6,glowOn:true,t});
    glow(ctx,290,1030,320,'#e8b877',.26);
    drawHandSil(ctx,290,1030,1.6,1,{spread:.5,curl:.7},{rim:'#ffd9a0',rimAlpha:.9,lit:true});
    glow(ctx,790,1030,320,'#e8b877',.26);
    drawHandSil(ctx,790,1030,1.6,-1,{spread:.5,curl:.7},{rim:'#e8f0ff',rimAlpha:.85,lit:true});
    // roots / light burst
    for(let i=0;i<14;i++){ const a=-1.2+i*.17; inkStroke(ctx,[[540,1000],[540+Math.cos(a)*(120+crack*260),1000+Math.sin(a)*(80+crack*220)]],{w:3,color:i%2?'#cfe0a6':'#f0e0a0',seed:1700+i,alpha:.4+crack*.4,jitter:1.5}); }
    glow(ctx,540,1000,120+crack*300,'#eaf5c0',.25+crack*.4);
    ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=.15*crack; ctx.fillStyle='#fff6d8'; ctx.fillRect(0,0,W,H); ctx.restore();
    finishFrame(ctx,t,frame,{paper:.1,vig:.55});
  },
  S40(ctx,t,u,frame){
    // clasped hands, pod, rain drop, whiteout
    bgMacro(ctx,'#2a231a','#0a0b09');
    glow(ctx,540,1040,660,'#e8cf9e',.26);
    glow(ctx,360,1050,330,'#e8b877',.26);
    drawHandSil(ctx,360,1050,1.65,1,{spread:.45,curl:.8},{rim:'#ffd9a0',rimAlpha:.9,lit:true});
    glow(ctx,720,1050,330,'#e8b877',.26);
    drawHandSil(ctx,720,1050,1.65,-1,{spread:.45,curl:.8},{rim:'#e8f0ff',rimAlpha:.85,lit:true});
    seedPod(ctx,540,1030,.75,{open:.2,glowOn:true,t});
    // rain drop
    const dy=300+u*900;
    ctx.save(); ctx.globalAlpha=.7; const g=ctx.createLinearGradient(540,dy-40,540,dy+40); g.addColorStop(0,'rgba(220,240,238,0)'); g.addColorStop(.5,'rgba(220,240,238,.8)'); g.addColorStop(1,'rgba(220,240,238,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(540,dy,5,34,0,0,TAU); ctx.fill(); ctx.restore();
    // whiteout
    const wo=clamp((u-.65)/.35);
    if(wo>0){ ctx.save(); ctx.globalAlpha=wo; ctx.fillStyle='#f7f0de'; ctx.fillRect(0,0,W,H); ctx.restore(); }
    finishFrame(ctx,t,frame,{paper:.12,vig:.55});
  }
};
