import {Link} from 'react-router-dom';import {BedDouble,Images} from 'lucide-react';import {naira} from '../../services/api';import {Media,Pill,Info} from './RoomParts';
// The hotel dashboard version of the room card. Same look as the public card; the footer shows room count and the Edit button.
export default function RoomTypeCard({t,roomCount=0,edit}){return <article className="group card overflow-hidden flex flex-col lift">
 <Media t={t}><Pill tone={t.active?'green':'gray'} className="right-2.5">{t.active?'Available':'Hidden'}</Pill>{t.featured&&<Pill tone="accent" className="left-2.5">Featured</Pill>}</Media>
 <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1"><Info t={t}/>
  <div className="mt-auto pt-3 border-t border-ink/10 flex items-end justify-between gap-3"><div className="font-display text-2xl text-primary leading-none">{naira(t.price)}<span className="font-sans text-xs font-normal text-muted"> /night</span></div></div>
  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-sm"><span className="text-muted flex items-center gap-1.5"><BedDouble size={14}/>{roomCount} room{roomCount===1?'':'s'}<Images size={14} className="ml-1.5"/>{t.images?.length||0}</span>{edit&&<Link className="btn btn-ghost !py-1.5 !px-4" to={'/dashboard/rooms/'+t._id}>Edit</Link>}</div></div></article>}
