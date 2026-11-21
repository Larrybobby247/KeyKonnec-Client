import {KeyMark} from '../brand/Logo';
const Dots=({side})=><span aria-hidden="true" className={`kk-dots ${side}`}><i/><i/><i/></span>;
// Full-screen loading screen: the logo scales gently in the centre, with a soft ring behind it and small dots drifting at its sides.
export default function AppLoader({label='Loading',full=true}){
 return <div role="status" aria-live="polite" aria-label={label} className={`${full?'fixed inset-0 z-[100]':'min-h-[60vh] w-full'} grid place-items-center bg-mist`}>
  <div className="flex items-center gap-4 sm:gap-8">
   <Dots side="left"/>
   <div className="kk-logo-wrap">
    <span className="kk-ring" aria-hidden="true"/><span className="kk-ring kk-ring2" aria-hidden="true"/>
    <KeyMark size={96} className="kk-logo"/>
   </div>
   <Dots side="right"/>
  </div>
  <div className="kk-bar" aria-hidden="true"><i/></div>
  <span className="sr-only">{label}</span>
 </div>}
