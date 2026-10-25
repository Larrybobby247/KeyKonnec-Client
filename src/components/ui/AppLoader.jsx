import {KeyRound} from 'lucide-react';
// Your logo: save it as src/assets/logo.png (or .svg, .webp, .jpg). Until you add it, a simple keykonnec mark is shown instead.
const found=import.meta.glob('../../assets/logo.{png,svg,webp,jpg,jpeg,avif}',{eager:true,import:'default'}),LOGO=Object.values(found)[0];
const Dots=({side})=><span aria-hidden="true" className={`kk-dots ${side}`}><i/><i/><i/></span>;
// Full-screen loading screen: the logo scales gently in the centre, with a soft ring behind it and small dots drifting at its sides.
export default function AppLoader({label='Loading',full=true}){
 return <div role="status" aria-live="polite" aria-label={label} className={`${full?'fixed inset-0 z-[100]':'min-h-[60vh] w-full'} grid place-items-center bg-mist`}>
  <div className="flex items-center gap-4 sm:gap-8">
   <Dots side="left"/>
   <div className="kk-logo-wrap">
    <span className="kk-ring" aria-hidden="true"/><span className="kk-ring kk-ring2" aria-hidden="true"/>
    {LOGO?<img src={LOGO} alt="" className="kk-logo"/>:<span className="kk-logo kk-fallback"><KeyRound size={44} strokeWidth={1.75}/></span>}
   </div>
   <Dots side="right"/>
  </div>
  <div className="kk-bar" aria-hidden="true"><i/></div>
  <span className="sr-only">{label}</span>
 </div>}
