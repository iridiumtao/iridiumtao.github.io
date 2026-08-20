// design/palette-tuner/color.js
// OKLCH <-> sRGB conversion, WCAG contrast, a contrast solver, and an OKLab
// deltaE. Shared by the browser bundle and by build.mjs.
/* OKLCH <-> sRGB, WCAG contrast, and a contrast solver.
   Slider space is OKLCH (perceptually uniform, so a lightness slider feels
   like lightness); output is hex, because that is what the repo consumes. */
function oklch2rgb(L,C,H){
  const h=H*Math.PI/180, a=C*Math.cos(h), b=C*Math.sin(h);
  const l_=L+0.3963377774*a+0.2158037573*b;
  const m_=L-0.1055613458*a-0.0638541728*b;
  const s_=L-0.0894841775*a-1.2914855480*b;
  const l=l_**3, m=m_**3, s=s_**3;
  const lin=[
    +4.0767416621*l -3.3077115913*m +0.2309699292*s,
    -1.2684380046*l +2.6097574011*m -0.3413193965*s,
    -0.0041960863*l -0.7034186147*m +1.7076147010*s];
  return lin.map(v=>v<=0.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-0.055);
}
const inGamut=rgb=>rgb.every(v=>v>=-0.0005&&v<=1.0005);
// Reduce chroma until the colour fits sRGB, then clamp the last epsilon.
function oklch2hex(L,C,H){
  let lo=0,hi=C;
  if(!inGamut(oklch2rgb(L,C,H))){
    for(let i=0;i<24;i++){const mid=(lo+hi)/2; if(inGamut(oklch2rgb(L,mid,H)))lo=mid;else hi=mid;}
    C=lo;
  }
  return "#"+oklch2rgb(L,C,H).map(v=>Math.round(Math.min(1,Math.max(0,v))*255).toString(16).padStart(2,"0")).join("");
}
const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const relLum=h=>{const c=hex2rgb(h).map(v=>v/255).map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));
  return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};
const contrast=(a,b)=>{const x=relLum(a),y=relLum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
/* Solve for the OKLCH lightness that hits `target` contrast against `ground`,
   holding hue and chroma. Darker direction only (text on a light ground). */
function solveL(target,C,H,ground){
  let lo=0,hi=0.98;
  for(let i=0;i<40;i++){
    const mid=(lo+hi)/2;
    if(contrast(oklch2hex(mid,C,H),ground)>target) lo=mid; else hi=mid;
  }
  return oklch2hex(lo,C,H);
}

/* sRGB -> OKLab (inverse of the transform above), and a perceptual distance.
   Euclidean distance in OKLab is a usable dE metric; thresholds are calibrated
   in calib.js against pairs whose similarity is already known. */
function hex2oklab(h){
  const lin=hex2rgb(h).map(v=>v/255).map(v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4));
  const [r,g,b]=lin;
  const l=Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b);
  const m=Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b);
  const s=Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);
  return [0.2104542553*l+0.7936177850*m-0.0040720468*s,
          1.9779984951*l-2.4285922050*m+0.4505937099*s,
          0.0259040371*l+0.7827717662*m-0.8086757660*s];
}
function hex2oklch(h){const[L,a,b]=hex2oklab(h);let H=Math.atan2(b,a)*180/Math.PI;
  if(H<0)H+=360;return{L,C:Math.hypot(a,b),H}}
function deltaE(h1,h2){const A=hex2oklab(h1),B=hex2oklab(h2);
  return Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2])}
if(typeof module!=="undefined")module.exports={oklch2hex,contrast,solveL,hex2rgb,relLum,hex2oklab,hex2oklch,deltaE};
