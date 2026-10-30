import {Link} from 'react-router-dom';import {naira} from '../../services/api';import {useSite} from '../../app/providers/SiteProvider';import {Media,Pill,Info,RoomImage} from '../rooms/RoomParts';
export {RoomImage};
// Public room card: photo on top, details below, price and button at the bottom. Used on the home page and the Rooms and Suites page.
export default function RoomCard({t,info,q={}}){const {to}=useSite(),out=info&&(!info.available||info.restriction),href=to('/rooms/'+t._id,q),left=info&&!out&&info.available;
 return <article className={`group card overflow-hidden flex flex-col lift ${out?'opacity-80':''}`}>
  <Link to={href} className="block" aria-label={`View ${t.name}`}><Media t={t}>{t.featured&&<Pill tone="accent" className="left-2.5">Featured</Pill>}{info&&<Pill tone={out?'red':left<=2?'accent':'green'} className="right-2.5">{info.restriction?'Not available':info.available?(left<=2?`Only ${left} left`:`${left} available`):'Sold out'}</Pill>}</Media></Link>
  <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1"><Info t={t}/>
   {info?.restriction&&<p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">{info.restriction}</p>}
   <div className="mt-auto pt-3 border-t border-ink/10 flex items-end justify-between gap-3"><div>{info&&info.unitTotal?<><div className="font-display text-2xl text-primary leading-none">{naira(info.unitTotal)}</div><div className="text-xs text-muted mt-1">for {info.nights} night{info.nights>1?'s':''}</div></>:<><div className="font-display text-2xl text-primary leading-none">{naira(t.price)}</div><div className="text-xs text-muted mt-1">per night</div></>}</div>
    <Link to={href} className={`btn !py-2.5 ${out?'btn-ghost':'btn-accent'}`}>{out?'Details':'Book now'}</Link></div></div></article>}
