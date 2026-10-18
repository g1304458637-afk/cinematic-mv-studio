/* shots.js — 45 data-driven shot specs. All time in seconds; u is 0..1 within the shot. */
const FPS_SHOTS = 24;
const SHOT_SPECS = [
{id:'S01',a:0,b:6.4167,set:{type:'ash',dawn:0,domeOn:1,arkOn:1},cam:[[0,560,980,1.02],[1,520,950,1.10]],fx:{ash:1},trans:{in:'fade'}},
{id:'S02',a:6.4167,b:10.0833,set:{type:'ash',dawn:0,domeOn:.7,arkOn:1},cam:[[0,700,860,1.05],[1,640,780,1.18]],fx:{ash:.8},overlay:'podtrail'},
{id:'S03',a:10.0833,b:12.7083,custom:'S03'},
{id:'S04',a:12.7083,b:17.5833,set:{type:'int',night:0,storm:.05,tree:.05},cam:[[0,520,1120,1.10],[1,470,1080,1.24]],chars:[{who:'mu',x:430,y:1540,h:740,turn:.28,a:{lean:.04,handL:[-.10,-.34],handR:[.14,-.30]},b:{lean:.10,handL:[-.09,-.36],handR:[.20,-.34]},rim:.5}],props:[{kind:'seed',x:700,y:1470,s:.55,open:0}],fx:{ash:.2}},
{id:'S05',a:17.5833,b:22.2083,custom:'S05'},
{id:'S06',a:22.2083,b:27.0417,set:{type:'int',night:0,storm:.1,tree:.15},cam:[[0,540,1050,1.25],[1,580,1000,1.42]],chars:[{who:'mu',x:430,y:1540,h:760,turn:.42,a:{lean:.02,handL:[-.08,-.34],handR:[.16,-.31]},b:{lean:.06,handL:[-.06,-.36],handR:[.20,-.33]},rim:.55}],props:[{kind:'photo',x:660,y:1160,s:.9,rot:-.12},{kind:'crane',x:760,y:1080,s:.5,rot:.2}],fx:{ash:.15}},
{id:'S07',a:27.0417,b:32.9167,set:{type:'int',night:0,storm:.1,tree:.2,lowangle:1},cam:[[0,540,1200,1.0],[1,560,980,1.08]],chars:[{who:'mu',x:470,y:1580,h:620,turn:.2,a:{lean:-.05,handL:[-.1,-.3],handR:[.1,-.3]},b:{lean:-.1,handL:[-.1,-.3],handR:[.1,-.3]},rim:.6}],fx:{ash:.2,rays:.5}},
{id:'S08',a:32.9167,b:39.1667,set:{type:'int',night:0,storm:.15,tree:.25},cam:[[0,540,1180,1.18],[1,520,1140,1.34]],chars:[{who:'mu',x:460,y:1540,h:780,turn:.35,a:{lean:.12,handL:[-.06,-.34],handR:[.12,-.32]},b:{lean:.18,handL:[-.04,-.30],handR:[.15,-.29]},rim:.5}],props:[{kind:'wish',x:620,y:1390,s:.8,rot:.15}],fx:{ash:.15}},
{id:'S09',a:39.1667,b:45.6667,set:{type:'ext',storm:.2,launch:0},cam:[[0,620,1000,1.0],[1,560,950,1.12]],chars:[{who:'mu',x:430,y:1580,h:560,turn:.3,a:{lean:.15,handL:[-.12,-.28],handR:[.12,-.28]},b:{lean:.22,handL:[-.14,-.26],handR:[.14,-.26]},rim:.6}],fx:{ash:.4},overlay:'podtrail'},
{id:'S10',a:45.6667,b:52.4167,set:{type:'ext',storm:.35,launch:.35},cam:[[0,620,1040,1.0],[1,650,980,1.1]],chars:[{who:'mu',x:470,y:1580,h:600,turn:.5,a:{lean:.05,handL:[-.1,-.3],handR:[.14,-.34]},b:{lean:.1,handL:[-.1,-.3],handR:[.18,-.38]},rim:.6}],fx:{ash:.5},overlay:'podfall'},
{id:'S11',a:52.4167,b:57.0417,set:{type:'ext',storm:.6,launch:.5},cam:[[0,650,1020,1.05],[1,600,950,1.18]],fx:{ash:1.2,shake:1},overlay:'impact'},
{id:'S12',a:57.0417,b:61.4583,set:{type:'ext',storm:.45,launch:.5},cam:[[0,560,1040,1.15],[1,520,1000,1.28]],chars:[{who:'mu',x:420,y:1580,h:620,turn:.35,a:{lean:.05,handL:[-.12,-.3],handR:[.18,-.24]},b:{lean:.1,handL:[-.12,-.3],handR:[.2,-.28]},rim:.55},{who:'chen',x:720,y:1620,h:320,turn:-.5,a:{pelvisY:-.46,lean:-.5,handL:[-.08,-.1],handR:[.02,-.02]},b:{pelvisY:-.46,lean:-.6,handL:[-.06,-.08],handR:[.04,0]},dark:'#0e0d0b',rimAlpha:.4}],fx:{ash:.4}},
{id:'S13',a:61.4583,b:64.875,set:{type:'int',night:.2,storm:.5,tree:.1},cam:[[0,540,1120,1.15],[1,500,1080,1.3]],chars:[{who:'mu',x:430,y:1570,h:640,turn:.2,a:{lean:.25,handL:[-.14,-.24],handR:[.18,-.26]},b:{lean:.35,handL:[-.12,-.22],handR:[.2,-.24]},rim:.6},{who:'chen',x:650,y:1620,h:300,turn:.4,a:{pelvisY:-.44,lean:.8,handL:[-.1,-.12],handR:[.1,-.1]},b:{pelvisY:-.44,lean:.9,handL:[-.08,-.1],handR:[.12,-.08]},rimAlpha:.4}],fx:{ash:.3}},
{id:'S14',a:64.875,b:68.0,custom:'S14'},
{id:'S15',a:68.0,b:74.0,set:{type:'int',night:.3,storm:.3,tree:.15},cam:[[0,540,1250,1.1],[1,540,1150,1.0]],chars:[{who:'mu',x:470,y:1580,h:520,turn:.2,a:{lean:.3,handL:[-.1,-.28],handR:[.1,-.3]},b:{lean:.35,handL:[-.1,-.28],handR:[.1,-.3]},rim:.5},{who:'chen',x:610,y:1620,h:520,turn:-.2,a:{pelvisY:-.30,lean:1.15,handL:[-.12,-.05],handR:[.12,-.05]},b:{pelvisY:-.30,lean:1.2,handL:[-.12,-.05],handR:[.12,-.05]},rimAlpha:.35}],props:[{kind:'seed',x:540,y:1460,s:.5}],fx:{ash:.25}},
{id:'S16',a:74.0,b:80.0,custom:'S16'},
{id:'S17',a:80.0,b:86.0417,set:{type:'ext',storm:.05,dawn:1},cam:[[0,540,1120,1.0],[1,540,960,.9]],fx:{ash:.2},overlay:'domeglow'},
{id:'S18',a:86.0417,b:92.5417,set:{type:'int',night:.5,storm:.15,tree:.2},cam:[[0,520,1120,1.22],[1,570,1060,1.35]],chars:[{who:'chen',x:640,y:1620,h:620,turn:-.3,a:{pelvisY:-.46,lean:.4,handL:[-.1,-.24],handR:[.16,-.28]},b:{pelvisY:-.46,lean:.55,handL:[-.08,-.22],handR:[.22,-.24]},rim:.6},{who:'mu',x:420,y:1640,h:560,turn:.6,a:{pelvisY:-.30,lean:1.2,handL:[-.1,-.08],handR:[.1,-.08]},b:{pelvisY:-.30,lean:1.2,handL:[-.1,-.08],handR:[.1,-.08]},rimAlpha:.25}],props:[{kind:'seed',x:520,y:1440,s:.5},{kind:'device',x:760,y:1180,s:.7}],fx:{ash:.2}},
{id:'S19',a:92.5417,b:99.9583,set:{type:'int',night:.2,storm:.2,tree:.25},cam:[[0,540,1120,1.15],[1,500,1080,1.3]],chars:[{who:'mu',x:410,y:1570,h:660,turn:.3,a:{lean:.1,handL:[-.16,-.28],handR:[.18,-.3]},b:{lean:.2,handL:[-.18,-.32],handR:[.22,-.34]},rim:.55},{who:'chen',x:660,y:1590,h:680,turn:-.3,a:{lean:-.1,handL:[-.14,-.3],handR:[.16,-.28]},b:{lean:-.2,handL:[-.16,-.34],handR:[.2,-.32]},rim:.5}],props:[{kind:'seed',x:540,y:1440,s:.45}],fx:{ash:.15}},
{id:'S20',a:99.9583,b:106.875,custom:'S20'},
{id:'S21',a:106.875,b:112.5,set:{type:'int',night:.85,storm:.2,tree:.2},cam:[[0,540,1180,1.05],[1,540,1120,1.0]],chars:[{who:'mu',x:350,y:1580,h:500,turn:.2,a:{pelvisY:-.44,lean:.5,handL:[-.1,-.12],handR:[.1,-.14]},b:{pelvisY:-.44,lean:.5,handL:[-.1,-.12],handR:[.1,-.14]},rim:.4},{who:'chen',x:730,y:1600,h:520,turn:-.2,a:{pelvisY:-.44,lean:-.4,handL:[-.1,-.14],handR:[.1,-.12]},b:{pelvisY:-.44,lean:-.4,handL:[-.1,-.14],handR:[.1,-.12]},rimAlpha:.3}],props:[{kind:'seed',x:540,y:1430,s:.5}],fx:{ash:.3}},
{id:'S22',a:112.5,b:119.2083,set:{type:'ext',storm:.85,launch:0},cam:[[0,540,1080,1.05],[1,560,980,1.18]],chars:[{who:'mu',x:430,y:1580,h:560,turn:.3,a:{lean:.2,handL:[-.14,-.3],handR:[.14,-.34]},b:{lean:.3,handL:[-.16,-.34],handR:[.16,-.38]},rim:.6},{who:'chen',x:650,y:1590,h:580,turn:-.3,a:{lean:-.1,handL:[-.14,-.32],handR:[.14,-.3]},b:{lean:-.2,handL:[-.16,-.36],handR:[.16,-.34]},rim:.55}],fx:{rain:.8,shake:.5}},
{id:'S23',a:119.2083,b:125.75,set:{type:'int',night:.6,storm:.9,tree:.3},cam:[[0,540,1150,1.2],[.5,520,1080,1.35],[1,560,1120,1.25]],chars:[{who:'mu',x:450,y:1580,h:620,turn:.2,a:{pelvisY:-.44,lean:.7,handL:[-.12,-.16],handR:[.12,-.14]},b:{pelvisY:-.40,lean:.9,handL:[-.1,-.1],handR:[.1,-.08]},rim:.65},{who:'chen',x:600,y:1600,h:640,turn:-.2,a:{lean:-.2,handL:[-.16,-.26],handR:[.16,-.24]},b:{lean:-.4,handL:[-.18,-.2],handR:[.18,-.18]},rim:.55}],fx:{rain:.6,shake:1},overlay:'beam'},
{id:'S24',a:125.75,b:130.125,custom:'S24'},
{id:'S25',a:130.125,b:134.7083,set:{type:'int',night:.4,storm:.2,tree:.55},cam:[[0,540,1120,1.25],[1,560,1080,1.4]],chars:[{who:'mu',x:450,y:1570,h:720,turn:.45,a:{lean:.1,handL:[-.1,-.28],handR:[.1,-.3]},b:{lean:.05,handL:[-.1,-.3],handR:[.1,-.32]},rim:.6,eyeLight:1},{who:'chen',x:620,y:1580,h:740,turn:-.3,a:{lean:-.1,handL:[-.1,-.3],handR:[.1,-.28]},b:{lean:-.05,handL:[-.1,-.32],handR:[.1,-.3]},rim:.55,eyeLight:1}],fx:{ash:.1}},
{id:'S26',a:134.7083,b:138.25,set:{type:'int',night:.1,storm:0,tree:.85},cam:[[0,540,1180,1.0],[1,540,1040,.95]],chars:[{who:'mu',x:420,y:1580,h:520,turn:.2,a:{lean:.1,handL:[-.14,-.28],handR:[.14,-.3]},b:{lean:.2,handL:[-.16,-.3],handR:[.16,-.34]},rim:.6},{who:'chen',x:660,y:1590,h:540,turn:-.2,a:{lean:-.1,handL:[-.14,-.3],handR:[.14,-.28]},b:{lean:-.2,handL:[-.16,-.34],handR:[.16,-.3]},rim:.55}],fx:{ash:.1,rays:.6}},
{id:'S27',a:138.25,b:141.3333,set:{type:'int',night:.05,storm:0,tree:.95},cam:[[0,540,1130,1.3],[1,540,1080,1.45]],chars:[{who:'mu',x:430,y:1580,h:700,turn:.5,a:{lean:.1,handL:[-.06,-.3],handR:[.16,-.34]},b:{lean:.05,handL:[-.06,-.3],handR:[.18,-.36]},rim:.65},{who:'chen',x:650,y:1580,h:720,turn:-.4,a:{lean:-.1,handL:[-.16,-.34],handR:[.06,-.3]},b:{lean:-.05,handL:[-.18,-.36],handR:[.06,-.3]},rim:.6}],fx:{rays:.7}},
{id:'S28',a:141.3333,b:146.0833,set:{type:'int',night:.15,storm:.1,tree:.95},cam:[[0,540,1120,1.35],[1,560,1080,1.5]],chars:[{who:'chen',x:620,y:1580,h:760,turn:-.3,a:{lean:-.1,handL:[-.1,-.3],handR:[.1,-.28]},b:{lean:-.05,handL:[-.1,-.28],handR:[.1,-.26]},rim:.6},{who:'mu',x:420,y:1590,h:680,turn:.5,a:{lean:.1,handL:[-.1,-.3],handR:[.1,-.3]},b:{lean:.1,handL:[-.1,-.3],handR:[.1,-.3]},rimAlpha:.45}],props:[{kind:'device',x:700,y:1180,s:.8,mode:'red'}],fx:{ash:.1}},
{id:'S29',a:146.0833,b:152.5417,set:{type:'int',night:.95,storm:.35,tree:.8},cam:[[0,540,1120,1.0],[1,540,1060,1.1]],chars:[{who:'chen',x:700,y:1600,h:640,turn:-.6,a:{lean:-.1,handL:[-.1,-.3],handR:[.12,-.28]},b:{lean:-.1,handL:[-.1,-.3],handR:[.12,-.28]},rim:.55},{who:'mu',x:400,y:1610,h:520,turn:.3,a:{pelvisY:-.44,lean:.5,handL:[-.1,-.12],handR:[.1,-.14]},b:{pelvisY:-.44,lean:.5,handL:[-.1,-.12],handR:[.1,-.14]},rimAlpha:.35}],props:[{kind:'seed',x:690,y:1400,s:.45}],fx:{ash:.2}},
{id:'S30',a:152.5417,b:159.3333,set:{type:'ext',storm:.7,launch:.3},cam:[[0,600,1080,1.0],[1,560,980,1.15]],chars:[{who:'mu',x:400,y:1600,h:520,turn:.2,a:{lean:.15,handL:[-.12,-.28],handR:[.12,-.28]},b:{lean:.2,handL:[-.12,-.28],handR:[.12,-.28]},rim:.5},{who:'chen',x:700,y:1590,h:560,turn:-.4,a:{lean:-.1,handL:[-.14,-.3],handR:[.14,-.28]},b:{lean:-.15,handL:[-.16,-.32],handR:[.16,-.3]},rim:.55}],fx:{rain:.6,ash:.4}},
{id:'S31',a:159.3333,b:163.375,set:{type:'ext',storm:.85,launch:.8},cam:[[0,540,1080,1.0],[1,520,980,1.15]],chars:[{who:'mu',x:470,y:1600,h:520,turn:.2,a:{pelvisY:-.42,lean:.3,handL:[-.1,-.14],handR:[.1,-.16]},b:{pelvisY:-.32,lean:.85,handL:[-.1,-.04],handR:[.1,-.06]},rim:.55}],fx:{rain:.8,ash:.5,shake:.4},overlay:'launch'},
{id:'S32',a:163.375,b:168.0,set:{type:'pod',red:1},cam:[[0,540,1000,1.0],[1,560,940,1.1]],chars:[{who:'chen',x:520,y:1520,h:620,turn:.2,a:{pelvisY:-.44,lean:.5,handL:[-.12,-.24],handR:[.12,-.26]},b:{pelvisY:-.44,lean:.7,handL:[-.14,-.3],handR:[.14,-.3]},rim:.55,eyeLight:1}],props:[{kind:'seed',x:560,y:1320,s:.5,open:1},{kind:'leaf',x:590,y:1300,s:.6}],fx:{}},
{id:'S33',a:168.0,b:171.5,set:{type:'int',night:.8,storm:1,broken:6,tree:.8},cam:[[0,540,1120,1.15],[.4,500,1050,1.3],[1,560,1100,1.2]],chars:[{who:'mu',x:500,y:1590,h:620,turn:.3,a:{pelvisY:-.40,lean:.8,handL:[-.14,-.1],handR:[.14,-.12]},b:{pelvisY:-.34,lean:1.0,handL:[-.12,-.04],handR:[.12,-.06]},rim:.6}],fx:{rain:1,shake:1,shards:1},overlay:'lightning'},
{id:'S34',a:171.5,b:174.5417,set:{type:'valley',stage:.9,storm:1,rainOn:1,inkTree:1,treeH:700},cam:[[0,540,1000,1.0],[1,560,1100,1.15]],fx:{rain:1,shake:.3},overlay:'falling'},
{id:'S35',a:174.5417,b:179.5417,set:{type:'int',night:.7,storm:1,broken:8,tree:.9},cam:[[0,540,1120,1.2],[.5,520,1080,1.35],[1,540,1100,1.25]],chars:[{who:'mu',x:470,y:1590,h:600,turn:.3,a:{pelvisY:-.42,lean:.6,handL:[-.12,-.24],handR:[.12,-.26]},b:{pelvisY:-.42,lean:.4,handL:[-.06,-.3],handR:[.2,-.3]},rim:.65},{who:'chen',x:610,y:1600,h:620,turn:-.3,a:{pelvisY:-.44,lean:.5,handL:[-.14,-.26],handR:[.14,-.24]},b:{pelvisY:-.44,lean:.3,handL:[-.2,-.3],handR:[.06,-.3]},rim:.6}],fx:{rain:1,shake:.6},overlay:'embrace'},
{id:'S36',a:179.5417,b:183.6667,custom:'S36'},
{id:'S37',a:183.6667,b:187.7917,set:{type:'valley',stage:1,storm:.65,rainOn:1,inkTree:1,treeH:720},cam:[[0,540,1100,1.0],[1,540,950,1.08]],chars:[{who:'mu',x:450,y:1610,h:360,turn:.4,a:{lean:.15,handL:[-.12,-.26],handR:[.12,-.28]},b:{lean:.1,handL:[-.1,-.3],handR:[.1,-.32]},rim:.6},{who:'chen',x:620,y:1615,h:380,turn:-.4,a:{lean:-.15,handL:[-.12,-.28],handR:[.12,-.26]},b:{lean:-.1,handL:[-.1,-.32],handR:[.1,-.3]},rim:.55}],fx:{rain:.9,rays:.8,shards:.6}},
{id:'S38',a:187.7917,b:191.2917,set:{type:'valley',stage:1,storm:.25,rainOn:1,inkTree:1,treeH:760,wide:1},cam:[[0,620,1050,1.0],[1,580,950,1.1]],fx:{rain:.7,rays:.5}},
{id:'S39',a:191.2917,b:194.5417,set:{type:'valley',stage:1,storm:.15,rainOn:1,inkTree:1,treeH:760},cam:[[0,540,1120,1.2],[1,560,1060,1.35]],chars:[{who:'mu',x:470,y:1600,h:560,turn:.5,a:{lean:.2,handL:[-.1,-.3],handR:[.16,-.26]},b:{lean:.15,handL:[-.08,-.32],handR:[.18,-.28]},rim:.6},{who:'chen',x:610,y:1600,h:580,turn:-.4,a:{lean:-.1,handL:[-.16,-.26],handR:[.1,-.3]},b:{lean:-.05,handL:[-.18,-.28],handR:[.08,-.32]},rim:.55}],props:[{kind:'crane',x:540,y:1240,s:.5,rot:-.2},{kind:'crane2',x:590,y:1220,s:.45,rot:.3}],fx:{rain:.5}},
{id:'S40',a:194.5417,b:198.5,custom:'S40'},
{id:'S41',a:198.5,b:204.5,set:{type:'valley',stage:1,storm:0,inkTree:1,treeH:800,arkDown:1,wide:1},cam:[[0,540,1050,1.0],[1,540,900,.9]],fx:{ash:.1,rays:.5}},
{id:'S42',a:204.5,b:211.0,set:{type:'valley',stage:1,storm:0,inkTree:1,treeH:800,arkDown:1},cam:[[0,560,1100,1.1],[1,540,1040,1.2]],chars:[{who:'chen',x:520,y:1600,h:580,turn:-.3,a:{lean:-.1,handL:[-.12,-.3],handR:[.12,-.3]},b:{lean:-.05,handL:[-.1,-.32],handR:[.14,-.3]},rim:.6},{who:'mu',x:650,y:1600,h:560,turn:.4,a:{lean:.1,handL:[-.12,-.3],handR:[.12,-.3]},b:{lean:.05,handL:[-.14,-.32],handR:[.1,-.3]},rim:.55}],fx:{ash:.2}},
{id:'S43',a:211.0,b:218.0,set:{type:'valley',stage:1,storm:0,inkTree:1,treeH:820,arkDown:1,wide:1,time:.5},cam:[[0,540,1050,1.0],[1,540,1000,1.04]],fx:{ash:.1,rays:.4}},
{id:'S44',a:218.0,b:226.5833,set:{type:'valley',stage:1,storm:0,inkTree:1,treeH:820,arkDown:1},cam:[[0,540,1080,1.15],[1,540,1040,1.22]],chars:[{who:'mu',x:490,y:1600,h:520,turn:.3,a:{pelvisY:-.42,lean:.4,handL:[-.1,-.2],handR:[.1,-.2]},b:{pelvisY:-.42,lean:.4,handL:[-.1,-.2],handR:[.1,-.2]},rim:.5},{who:'chen',x:610,y:1600,h:540,turn:-.3,a:{pelvisY:-.42,lean:.3,handL:[-.1,-.22],handR:[.1,-.22]},b:{pelvisY:-.42,lean:.3,handL:[-.1,-.22],handR:[.1,-.22]},rim:.45}],fx:{ash:.2}},
{id:'S45',a:226.5833,b:232.625,set:{type:'pool'},cam:[[0,540,960,1.0],[1,540,900,1.12]],fx:{ash:.15},trans:{out:'fade'}}
];

function mix(a,b,u){ return a + (b-a)*u; }
function lerpPose(a={},b={},u){
  const out={};
  const keys=new Set([...Object.keys(a),...Object.keys(b)]);
  for(const k of keys){
    const va=a[k], vb=b[k];
    if(typeof va==='number'||typeof vb==='number') out[k]=mix(va??0,vb??0,u);
    else if(Array.isArray(va)&&Array.isArray(vb)) out[k]=[mix(va[0],vb[0],u),mix(va[1],vb[1],u)];
    else out[k]=vb??va;
  }
  return out;
}
function specU(s,t){ return clamp((t-s.a)/Math.max(.001,s.b-s.a)); }
function specCam(s,u){
  const keys=s.cam||[[0,540,960,1],[1,540,960,1]];
  if(u<=keys[0][0]) return {x:keys[0][1]+Math.sin((s.a||0)*1.7)*2.0,y:keys[0][2]+Math.cos((s.a||0)*1.3)*1.6,zoom:keys[0][3],rot:0,shake:0,seed:1,frame:0};
  for(let i=0;i<keys.length-1;i++){
    const A=keys[i],B=keys[i+1];
    if(u>=A[0]&&u<=B[0]){
      const v=easeInOutCubic(clamp((u-A[0])/(B[0]-A[0])));
      return {x:mix(A[1],B[1],v)+Math.sin(u*6.1+(s.a||0))*2.2,y:mix(A[2],B[2],v)+Math.cos(u*5.3+(s.a||0))*1.8,zoom:mix(A[3],B[3],v),rot:0,shake:0,seed:1,frame:0};
    }
  }
  const L=keys[keys.length-1];
  return {x:L[1]+Math.sin(u*6.1+(s.a||0))*2.2,y:L[2]+Math.cos(u*5.3+(s.a||0))*1.8,zoom:L[3],rot:0,shake:0,seed:1,frame:0};
}
function moodFace(t){
  if(t<20) return 'sad';
  if(t<39) return 'soft';
  if(t<61) return 'fear';
  if(t<74) return 'wonder';
  if(t<86) return 'soft';
  if(t<95) return 'anger';
  if(t<112) return 'grief';
  if(t<135) return 'soft';
  if(t<146) return 'wonder';
  if(t<160) return 'pain';
  if(t<176) return 'resolve';
  if(t<199) return 'laugh';
  return 'soft';
}
function drawCharSpec(ctx,t,cs,u,frame){
  const pose=lerpPose(cs.a||{},cs.b||{},u);
  const x=mix(cs.x??cs.x0??540,cs.x1??cs.x??540,u);
  const y=mix(cs.y??cs.y0??1600,cs.y1??cs.y??1600,u);
  const h=mix(cs.h??cs.h0??500,cs.h1??cs.h??500,u);
  const rimColor = typeof cs.rim==='string' ? cs.rim : (cs.who==='mu' ? '#f2cf92' : '#cfe0e8');
  const rimA = cs.rimAlpha ?? (typeof cs.rim==='number' ? cs.rim : .5);
  const face=facePreset(cs.face||moodFace(t));
  if(cs.solid) drawPerson(ctx,t,{who:cs.who,x,y,h,turn:cs.turn||0,pose,face,seed:cs.seed||1,light:{x:-.5,y:-.8,color:rimColor,rim:rimA},wind:cs.wind||0});
  else drawSilhouette(ctx,t,{who:cs.who,x,y,h,turn:cs.turn||0,pose,face,dark:cs.dark,rim:rimColor,rimAlpha:rimA,accent:cs.accent,eyeLight:cs.eyeLight,wind:cs.wind||0,seed:cs.seed||(cs.who==='chen'?2:1)});
}
function drawSpecSet(ctx,s,u,t,frame){
  const S=Object.assign({},s.set||{});
  const type=S.type||'ash';
  if(type==='ash') setAshwide(ctx,t,specCam(s,u),{dawn:S.dawn||0,domeOn:S.domeOn??1,arkOn:S.arkOn??1});
  else if(type==='int') setOrchard(ctx,t,specCam(s,u),{night:S.night||0,storm:S.storm||0,broken:S.broken||0,tree:S.tree||0,warm:S.warm??1});
  else if(type==='ext') setCliff(ctx,t,specCam(s,u),{storm:S.storm||0,launch:S.launch||0,dawn:S.dawn||0,night:S.night||0});
  else if(type==='pod') setPod(ctx,t,specCam(s,u),{red:S.red??1,shake:S.shake||0});
  else if(type==='valley') setValley(ctx,t,specCam(s,u),{stage:S.stage??1,storm:S.storm||0,rainOn:S.rainOn||0,inkTree:S.inkTree||0,treeH:S.treeH||700,arkDown:S.arkDown||0,time:S.time||0,wide:S.wide||1});
  else if(type==='pool') setPool(ctx,t,specCam(s,u),{});
}
function drawPropSpec(ctx,p,t,u){
  const x=p.x??540,y=p.y??1400,s=p.s??1;
  if(p.kind==='seed') seedPod(ctx,x,y,s,{open:(p.open??0)*(.3+.7*u),glowOn:true,t});
  else if(p.kind==='crane') paperCrane(ctx,x,y,s,-.15+u*.1,{alpha:.9,flap:u*2});
  else if(p.kind==='crane2') paperCrane(ctx,x,y,s,.25-u*.08,{alpha:.85,flap:1+u*2,color:'#d8ccb2'});
  else if(p.kind==='photo') photoProp(ctx,x,y,s,-.1);
  else if(p.kind==='wish') wishPaper(ctx,x,y,s,.15,t);
  else if(p.kind==='device') deviceProp(ctx,x,y,s,t,p.mode||'red');
  else if(p.kind==='leaf') paintShape(ctx,ellipsePath(x,y,34,9,.4),{color:'#8a9a5a',gy0:y-10,gy1:y+10,edgeW:2,ink:'#4a5436',inkW:1,seed:900});
}
function drawSpecOverlay(ctx,name,u,t){
  if(name==='podtrail'){
    const x=780-u*120,y=420+u*500;
    glow(ctx,x,y,60,'#ffb45e',.6);
    inkStroke(ctx,[[x,y-40],[x+10,y-120],[x-4,y-220]],{w:4,color:'#ffcf8a',seed:910,alpha:.5,jitter:1});
  } else if(name==='podfall'){
    const x=700+u*80,y=500+u*700;
    launchPod(ctx,x,y,.45,t,.3,0);
    glow(ctx,x,y+40,90,'#ffb45e',.5);
    inkStroke(ctx,[[x-10,y-80],[x+40,y-160],[x+20,y-260]],{w:5,color:'#d9c6a4',seed:911,alpha:.3,jitter:2});
  } else if(name==='impact'){
    const r=400*u;
    ctx.save(); ctx.globalAlpha=(1-u)*.55; ctx.fillStyle='#d8c7a8'; ctx.beginPath(); ctx.arc(720,1180,r,0,TAU); ctx.fill(); ctx.restore();
    for(let i=0;i<16;i++){ const a=i/16*TAU; inkStroke(ctx,[[720,1180],[720+Math.cos(a)*(120+u*260),1180+Math.sin(a)*(60+u*120)]],{w:2,color:'#cbb998',seed:920+i,alpha:.3,jitter:2}); }
  } else if(name==='beam'){
    const x=760,y=600;
    paintShape(ctx,roundRectPath(x,y,60,900,20),{color:'#3f3330',gy0:y,gy1:y+900,edgeW:6,ink:'#241c18',inkW:3,seed:930});
  } else if(name==='lightning'){
    const b=Math.max(0,Math.sin(u*Math.PI*6))* (1-u*.3);
    ctx.save(); ctx.globalAlpha=b*.25; ctx.fillStyle='#e8f3ee'; ctx.fillRect(0,0,W,H); ctx.restore();
  } else if(name==='falling'){
    const x=560+Math.sin(u*3)*20,y=300+u*900;
    drawSilhouette(ctx,t,{who:'chen',x,y,h:200,turn:-.2,pose:{lean:-.5,handL:[-.2,-.2],handR:[.2,-.2]},dark:'#0b0e0f',rim:'#cfe0e8',rimAlpha:.5,seed:2});
  } else if(name==='embrace'){
    glow(ctx,540,1450,260,'#d9c78a',.25*(1-u*.4));
  } else if(name==='launch'){
    const x=620+u*160,y=900-u*700;
    launchPod(ctx,x,y,.8,t,1-u*.3,0); glow(ctx,x,y+80,160,'#ffb45e',.4);
  } else if(name==='domeglow'){
    glow(ctx,840,1360,220,'#b9d98a',.22);
  }
}
function drawSpec(ctx,s,t,frame){
  const u=specU(s,t);
  if(s.custom&&CUSTOM_SHOTS[s.custom]){ CUSTOM_SHOTS[s.custom](ctx,t,u,frame); return; }
  drawSpecSet(ctx,s,u,t,frame);
  // characters in the camera space
  ctx.save(); applyCam(ctx,specCam(s,u),1,false);
  if(s.chars) for(const cs of s.chars) drawCharSpec(ctx,t,cs,u,frame);
  if(s.props) for(const p of s.props) drawPropSpec(ctx,p,t,u);
  ctx.restore();
  if(s.overlay) drawSpecOverlay(ctx,s.overlay,u,t);
  const fx=s.fx||{};
  if(fx.rain) rain(ctx,t,Math.round(220*fx.rain),{alpha:.32*(fx.rain||1),seed:700,slant:.2});
  /* shake is expressed through camera keys; never translate overlays */
  if(fx.shards) for(let i=0;i<14;i++){ const x=hash2(940,i)*W,y=hash2(941,i)*1400; shard(ctx,x,y,20+hash2(942,i)*50,40+hash2(943,i)*90,hash2(944,i)*3,.25,'#d6e3dc'); }
  if(fx.rays){
    ctx.save(); ctx.globalCompositeOperation='screen';
    for(let i=0;i<6;i++){ const g=ctx.createLinearGradient(540,200,540+(i-2.5)*220,1700); g.addColorStop(0,`rgba(232,222,184,${.09*fx.rays})`); g.addColorStop(1,'rgba(232,222,184,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(500+i*10,180); ctx.lineTo(570+i*10,180); ctx.lineTo(760+(i-2.5)*260,1750); ctx.lineTo(300+(i-2.5)*260,1750); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  if(fx.ash) ashMotes(ctx,t,null,Math.round(180*fx.ash),600,{color:'#d8c8aa',alpha:.3,size:1.5});
  else if(!s.custom) ashMotes(ctx,t,null,70,600,{color:'#d8c8aa',alpha:.13,size:1.2});
  // global pigment / paper / vignette / grain
  pigmentPass(ctx,.15); vignette(ctx,.52); filmGrain(ctx,frame,.04);
  const flick=0.006+0.006*(.5+.5*Math.sin(t*2.7+(s.a||0))); ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=flick; ctx.fillStyle='#ffe9c4'; ctx.fillRect(0,0,W,H); ctx.restore();
  if(s.trans&&s.trans.in==='fade'&&u<.06) { ctx.save(); ctx.globalAlpha=(1-u/.06)*.8; ctx.fillStyle='#e6dcc6'; ctx.fillRect(0,0,W,H); ctx.restore(); }
  if(s.trans&&s.trans.out==='fade'&&u>.94) { ctx.save(); ctx.globalAlpha=(u-.94)/.06*.9; ctx.fillStyle='#e6dcc6'; ctx.fillRect(0,0,W,H); ctx.restore(); }
  if(s.id==='S45' && u>.42){
    const a=smoothstep(.40,.66,u)*(1-smoothstep(.94,1,u));
    ctx.save(); ctx.globalAlpha=a; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='#1d1915';
    ctx.font='700 150px "Noto Serif CJK SC","Songti SC",serif';
    ctx.fillText('愿与愁',540,830);
    ctx.font='500 26px "Noto Serif CJK SC","Songti SC",serif';
    ctx.globalAlpha=a*.9; ctx.fillText('T H E   L A S T   O R C H A R D',540,940);
    ctx.restore();
  }
  if(s.overlay==='lightning'){ const b=Math.max(0,Math.sin(u*Math.PI*6))*(1-u*.3); if(b>.1){ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=b*.18;ctx.fillStyle='#eaf5ef';ctx.fillRect(0,0,W,H);ctx.restore();} }
}
