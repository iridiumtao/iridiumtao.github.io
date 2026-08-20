/* Injected by gentuner.js */
const DATA=__DATA__, IMG_DIAGRAM=__IMG_DIAGRAM__, IMG_PHOTO=__IMG_PHOTO__;

/* The palette currently live on chun-ju.irilia.app, read out of
   styles/globals.css. Tailwind's built-in stone steps are spelled out because
   the stylesheet only redeclares 100/200/400/500; 600/700/900 come from v4's
   own scale. --color-stone-100 is the resolved color-mix. Held-button preview
   renders THESE instead of the tuned tokens, so the comparison is against the
   real thing rather than an approximation. */
const ORIGINAL={
  paper:"#fbf7f2", raised:"#f5f0eb", chip:"#f0e4d8", rule:"#dabea7", dot:"#b8a491",
  idx:"#a98b73", meta:"#876d5a", body:"#57534d", prose:"#44403b", val:"#292524",
  head:"#1c1917", at:"#6b5b4e", accent:"#9a6852", link:"#876d5a", mark:"#9d7553"};
let HOLD=false;

const S={gl:0.992,gc:0.004,gh:70,sc:0.030,fr:1,ah:55,ac:0.075};
const $=id=>document.getElementById(id);

/* Every text token is SOLVED for its required contrast against the current
   ground, so no slider position can produce an inaccessible palette. */
const TEXT=[
  ["idx","index 12px",4.6,"n"],["meta","meta 11-13px",5.2,"n"],
  ["body","body 13-14px",7.2,"n"],["prose","prose 16-17px",9.4,"n"],
  ["val","meta value",11,"n"],["head","headline / CTA",15,"d"],
  ["at",".at 20px",4.8,"a55"],["accent","emphasis 17px",4.6,"a"],
  ["link","link 16px",7,"a90"],["mark","dot (non-text)",3.2,"a"]];

/* ---------- AI-colour proximity ----------
   Bands are the measured OKLCH envelope of the banned sets, not estimates.
   Membership in a band is the primary verdict: the AI tell is about sitting
   in a REGION, not about matching one hex. dE to the nearest member is the
   supporting detail (calibrated: 0.003 = the pairs I called "identical",
   0.25 = indigo vs clay). */
const AI={
  bg:{list:["#f5f1ea","#f7f5f1","#fbf8f1","#efeae0","#ece6db","#faf7f1","#e8dfcb"],
      L:[.905,.980],C:[.0057,.0285],H:[82,87],label:"底色 cream"},
  ac:{list:["#b08947","#b6553a","#9a2436","#9c6e2a","#bc7c3a","#7d5621"],
      L:[.457,.654],C:[.0856,.1530],H:[18,79],label:"accent 陶土/黃銅"},
  tx:{list:["#1a1714","#1a1814","#1b1814","#1c1917"],
      L:[.207,.216],C:[.0061,.0090],H:[56,85],label:"文字 espresso"}};

function nearest(hex,list){
  let best={hex:list[0],dE:1e9};
  for(const c of list){const d=deltaE(hex,c); if(d<best.dE)best={hex:c,dE:d}}
  return best;
}
/* Returns which axes fall outside the band. Naming the escaping axis is the
   actionable part: it tells you which knob is keeping you clear. */
function bandCheck(hex,b,dE){
  const o=hex2oklch(hex);
  const out=[];
  if(o.L<b.L[0]||o.L>b.L[1]) out.push("L "+o.L.toFixed(3));
  if(o.C<b.C[0]||o.C>b.C[1]) out.push("C "+o.C.toFixed(4));
  /* Hue is numerically unstable below C ~0.02 and carries no perceptual
     weight there, so it is not allowed to be the escaping axis for a
     near-neutral. Without this, #fbf7f2 (dE 0.003 from a banned cream, i.e.
     the same colour) reported "safe" purely on a 13-degree hue wobble. */
  if(o.C>=0.02 && !(o.H>=b.H[0]&&o.H<=b.H[1])) out.push("H "+Math.round(o.H)+"°");
  /* A tiny dE overrides the band outright: if you have effectively reproduced
     one of the listed colours, you are in the region whatever the envelope says. */
  if(dE<0.012) return {inside:true,out:[],o,why:"dE "+dE.toFixed(3)+" — 等同其中一色"};
  return {inside:out.length===0,out,o,why:null};
}
function dELabel(d){
  return d<.010?["幾乎同色","bad"]:d<.030?["很接近","warn"]
       : d<.080?["同家族可分辨","warn"]:["明確不同","good"];
}
function aiPanel(t){
  const rows=[["bg",t.paper,AI.bg],["ac",t.accent,AI.ac],["tx",t.head,AI.tx]];
  let hits=0, html="";
  for(const[,hex,b]of rows){
    const n=nearest(hex,b.list), chk=bandCheck(hex,b,n.dE), [dl,dc]=dELabel(n.dE);
    if(chk.inside)hits++;
    html+="<div class='airow "+(chk.inside?"in":"out")+"'>"+
      "<div class='pair'><i style='background:"+hex+"'></i><i style='background:"+n.hex+"'></i></div>"+
      "<div class='ai-t'><b>"+b.label+"</b>"+
      "<span>"+hex+" vs "+n.hex+"  ·  dE "+n.dE.toFixed(3)+" <em class='"+dc+"'>"+dl+"</em></span>"+
      "<span class='verdict'>"+(chk.inside
        ? "⚠ 落在區間內"+(chk.why?"（"+chk.why+"）":"（三軸都中）")
        : "✓ 區間外，靠 "+chk.out.join(" / ")+" 脫離")+"</span></div></div>";
  }
  const verdict=["✓ 三軸全清，不是那套配色","✓ 只中 1 項，可接受",
                 "⚠ 中 2 項，AI 味明顯","⚠ 三元組全中 — 就是那套庫存配色"][hits];
  html+="<div class='triad h"+hits+"'>三元組 "+hits+"/3 · "+verdict+"</div>";
  html+="<div class='strip'>"+AI.bg.list.map(c=>"<i style='background:"+c+"' title='"+c+"'></i>").join("")+
        "<i class='you' style='background:"+t.paper+"'></i></div>"+
        "<div class='hint' style='margin-top:4px'>上排 7 個是被點名的 cream，最右邊有框的是你的底色</div>";
  return html;
}

function tokens(){
  const paper=oklch2hex(S.gl,S.gc,S.gh);
  /* Surfaces sit below the ground in lightness and ABOVE it in chroma. Once
     the page goes white this is where the actual milk-tea colour lives. */
  const t={paper,
    raised:oklch2hex(Math.max(.55,S.gl-.055),S.sc,S.gh),
    chip:  oklch2hex(Math.max(.55,S.gl-.075),S.sc*1.05,S.gh),
    rule:  oklch2hex(Math.max(.45,S.gl-.185),S.sc*1.15,S.gh),
    dot:   oklch2hex(Math.max(.40,S.gl-.255),S.sc*1.2,S.gh)};
  for(const[k,,ratio,kind]of TEXT){
    const C = kind==="n"?.012 : kind==="d"?.017 : kind==="a55"?S.ac*.55 : kind==="a90"?S.ac*.9 : S.ac;
    const H = kind[0]==="a"?S.ah:S.gh;
    t[k]=solveL(ratio,C,H,paper);
  }
  return t;
}

function render(){
  const t=HOLD?ORIGINAL:tokens(), rgb=hex2rgb(t.head).join(",");
  const vars={...t,
    hair:"rgba("+rgb+",.15)","hair-soft":"rgba("+rgb+",.10)",
    sh1:"rgba("+rgb+",.10)",sh2:"rgba("+rgb+",.05)",badge:"rgba("+rgb+",.72)"};

  $("phone").innerHTML=view(S.fr>0);
  $("phone").firstElementChild.setAttribute("style",
    Object.entries(vars).map(([k,v])=>"--"+k+":"+v).join(";"));

  $("tok").innerHTML=
    TEXT.map(([k,label])=>{
      const c=contrast(t[k],t.paper), lvl=c>=7?"AAA":c>=4.5?"AA":"FAIL";
      return "<tr><td><i style='background:"+t[k]+"'></i></td><td>"+label+
        "</td><td class='r'>"+t[k]+"</td><td class='r'>"+c.toFixed(2)+
        "</td><td class='lvl "+(c<4.5?"fail":"")+"'>"+lvl+"</td></tr>"}).join("")
    +["paper","raised","chip","rule"].map(k=>
      "<tr><td><i style='background:"+t[k]+"'></i></td><td>"+k+
      "</td><td class='r'>"+t[k]+"</td><td class='r'>-</td><td></td></tr>").join("");

  $("swatch").innerHTML=[["ground",t.paper],["raised 卡片",t.raised],["chip",t.chip],
    ["rule 邊框",t.rule],["accent",t.accent],["head",t.head]].map(([n,c])=>
    "<div style='display:flex;align-items:center;gap:10px;margin-bottom:8px'>"+
    "<div style='width:110px;height:52px;border-radius:8px;background:"+c+
    ";border:1px solid rgba(255,255,255,.15)'></div>"+
    "<div style='font-family:var(--mono);font-size:11px;color:#a0a0a5'>"+n+"<br>"+c+"</div></div>").join("");

  const pad=s=>(s+"        ").slice(0,8);
  $("out").textContent="@theme {\n"+
    ["paper","raised","chip","rule","dot","idx","meta","body","prose","head","at","accent","link","mark"]
    .map(k=>"  --color-"+pad(k+":")+" "+t[k]+";").join("\n")+"\n}";

  $("ai").innerHTML=aiPanel(t);
  zoneCheck(t.paper);
  $("vgl").textContent=S.gl.toFixed(3); $("vgc").textContent=S.gc.toFixed(4);
  $("vgh").textContent=S.gh+"°";        $("vsc").textContent=S.sc.toFixed(3);
  $("vac").textContent=S.ac.toFixed(3); $("vah").textContent=S.ah+"°";
  $("vfr").textContent=S.fr>0?"on":"off";
  document.body.classList.toggle("holding",HOLD);
  $("holdlabel").textContent=HOLD?"放開回到你調的顏色":"按住比較現況配色";
}

/* Live read-out of whether the ground sits inside the banned warm-near-white
   region: HSL L 84-97%, hue 30-45deg, saturation 22-60%. */
function zoneCheck(paper){
  const [R,G,B]=hex2rgb(paper).map(x=>x/255);
  const mx=Math.max(R,G,B),mn=Math.min(R,G,B),d=mx-mn;
  let H=0; if(d){if(mx===R)H=60*(((G-B)/d)%6);else if(mx===G)H=60*((B-R)/d+2);else H=60*((R-G)/d+4)}
  if(H<0)H+=360;
  const L=(mx+mn)/2, Sat=d?d/(1-Math.abs(2*L-1)):0;
  const inZone=L>=.84&&L<=.97&&H>=30&&H<=45&&Sat>=.22&&Sat<=.60;
  const z=$("zone");
  z.className="zone "+(inZone?"in":"out");
  z.textContent=(inZone?"⚠ 落在 banned 區間內":"✓ 在 banned 區間外")+"   "+paper+
    "\nHSL "+Math.round(H)+"° "+Math.round(Sat*100)+"% "+Math.round(L*100)+"%"+
    (inZone?"\n那七個 hex 就是 L 84-97% + hue 30-45° + S 22-60% 這一整塊":"");
}

function view(framed){
  const h=DATA.home;
  return "<div class='we'><div class='wrap'>"+
  "<nav><div class='brand'><span class='mark'>T</span><span class='name'>"+DATA.name+" Tao</span></div>"+
  "<div class='nav-links'><span class='cta'>Resume →</span></div></nav>"+
  "<section class='hero'><div class='greeting'><span class='dot'></span>"+h.greeting+" · "+h.availability+"</div>"+
  "<h1>I build the<br><strong>infrastructure</strong><br>your code<br>runs on.</h1>"+
  "<p class='lede'>I'm Chun-Ju (Iridium) Tao, a Computer Engineering MS from NYU who works on "+
  "<strong>backend and infrastructure</strong>. I've automated CI/CD on AWS and built the first "+
  "Taigi medical-advising LLM.</p>"+
  "<div class='hero-meta'><div><span class='meta-label'>Based</span><span class='meta-value'>"+h.based+"</span></div>"+
  "<div><span class='meta-label'>Stack</span><span class='meta-value'>"+h.stack+"</span></div></div></section>"+
  "<div class='sec-head'><h2><span class='num'>01 ／</span>Selected Projects</h2></div>"+
  "<div class='proj'><div class='proj-img"+(framed?" framed":"")+"'><img src='"+IMG_DIAGRAM+"'>"+
  "<span class='badge'>2025</span></div><h3>Taigi Medical Advising LLM</h3>"+
  "<span class='proj-sub'>MLOPS · LLM</span>"+
  "<p>Fine-tuned Taigi medical advising LLM with a full-stack MLOps pipeline.</p></div>"+
  "<div class='proj'><div class='proj-img'><img src='"+IMG_PHOTO+"'><span class='badge'>2024</span></div>"+
  "<h3>Loud Plants in Your Area</h3><p>An interactive installation that gives houseplants a voice.</p></div>"+
  "<div class='sec-head'><h2><span class='num'>02 ／</span>Experience</h2></div>"+
  "<div class='exp-row'><span class='exp-idx'>/04</span>"+
  "<span class='exp-role'>Software Developer <span class='at'>at CARITY AI</span></span>"+
  "<span class='exp-blurb'>Developed a DevOps workflow with Docker and AWS ECS, reducing costs by 40%.</span>"+
  "<span class='exp-when'>MAY — AUG 2024</span></div>"+
  "<div class='sec-head'><h2><span class='num'>03 ／</span>Résumé</h2></div>"+
  "<div class='tl'><div class='tl-item'><span class='tl-date'>May 2026</span>"+
  "<span class='tl-title'>New York University</span>"+
  "<div class='tl-meta'>New York, NY · GPA 3.73 · M.S. Computer Engineering</div>"+
  "<div class='chip-row'><span class='chip'>Python</span><span class='chip'>Go</span>"+
  "<span class='chip'>Docker</span><span class='chip'>AWS</span><span class='chip'>PyTorch</span></div></div></div>"+
  "<div class='about-pull'>「"+h.aboutPull+"」</div>"+
  "<footer><span class='footer-brand'>"+DATA.name+" Tao</span>"+
  "<div class='footer-links'><a>Github ↗</a><a>LinkedIn ↗</a><a>Email</a></div>"+
  "<span class='footer-copy'>© 2026</span></footer></div></div>";
}

for(const k of ["gl","gc","gh","sc","fr","ac","ah"]){
  const el=$(k); el.value=S[k];
  el.addEventListener("input",e=>{S[k]=+e.target.value;render()});
}
document.querySelectorAll(".presets button").forEach(b=>b.onclick=()=>{
  const p=b.dataset.p.split(",").map(Number);
  S.gl=p[0];S.gc=p[1];S.gh=p[2];
  $("gl").value=p[0];$("gc").value=p[1];$("gh").value=p[2];render()});
document.querySelectorAll(".fam button").forEach(b=>b.onclick=()=>{
  const f=b.dataset.f.split(",").map(Number);
  S.ah=f[0];S.ac=f[1];$("ah").value=f[0];$("ac").value=f[1];
  document.querySelectorAll(".fam button").forEach(x=>x.classList.remove("on"));
  b.classList.add("on");render()});
document.querySelector(".fam button").classList.add("on");
render();

/* Hold-to-compare. pointerdown/up rather than click so the original shows only
   while held; the release listener is on window because the pointer is often
   released outside the button. Keyboard equivalent uses keydown/keyup with
   e.repeat guarded, so holding the key does not re-render every repeat tick. */
const holdBtn=$("hold");
const holdOn =()=>{if(!HOLD){HOLD=true;render()}};
const holdOff=()=>{if(HOLD){HOLD=false;render()}};
holdBtn.addEventListener("pointerdown",e=>{e.preventDefault();holdOn()});
window.addEventListener("pointerup",holdOff);
window.addEventListener("pointercancel",holdOff);
holdBtn.addEventListener("keydown",e=>{
  if((e.key===" "||e.key==="Enter")&&!e.repeat){e.preventDefault();holdOn()}});
holdBtn.addEventListener("keyup",e=>{if(e.key===" "||e.key==="Enter")holdOff()});
holdBtn.addEventListener("blur",holdOff);
