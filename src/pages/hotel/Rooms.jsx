import {useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {Plus,BedDouble,Users,ImageOff,Search,Ruler,Images,SearchX} from 'lucide-react';
import {useDash} from '../../components/dashboard/DashContext';
import {useGet,Box,Msg,run,form,Btn,Badge,Spinner,Empty,Tabs} from '../../components/ui';
import {api,naira,cld} from '../../services/api';
import {patchRoom} from '../../services/rooms';
import RoomTypeCard from '../../components/rooms/RoomTypeCard';
import RoomActions from '../../components/rooms/RoomActions';import {BookingCell} from '../../components/rooms/RoomParts';

const STAT=['vacant','occupied','cleaning','maintenance','out_of_service'],HK=['clean','dirty','inspection'],
 label=s=>s.replace(/_/g,' '),
 SORTS=[['name','Name A to Z'],['low','Price: low to high'],['high','Price: high to low'],['capacity','Most guests']];
const has=(txt,q)=>String(txt||'').toLowerCase().includes(q);

export default function Rooms(){
 const {branch,role,access}=useDash(),[tab,setTab]=useState('types'),[d,load]=useGet('/inventory',{branch:branch||undefined}),[m,setM]=useState(''),
  hk=access.plan.features.includes('housekeeping'),[tk,loadT]=useGet(hk?'/tasks':'/health'),edit=['owner','manager'].includes(role),
  [tf,setTf]=useState({q:'',category:'',active:'',sort:'name'}),[rf,setRf]=useState({q:'',type:'',status:'',hk:''});
 const set=(id,b)=>run(setM,()=>patchRoom(id,b),load),
  task=form((v,f)=>run(setM,()=>api.post('/tasks',v),()=>{f.reset();load();loadT()})),
  done=(id,status)=>run(setM,()=>api.patch('/tasks/'+id,{status}),()=>{load();loadT()});
 const cats=useMemo(()=>[...new Set((d?.types||[]).map(t=>t.category).filter(Boolean))],[d]),
  types=useMemo(()=>{if(!d)return [];const q=tf.q.trim().toLowerCase();
   const l=d.types.filter(t=>(!q||has(t.name,q)||has(t.category,q)||has(t.bedType,q)||has(t.description,q)||(t.amenities||[]).some(a=>has(a,q)))&&(!tf.category||t.category===tf.category)&&(!tf.active||(tf.active==='yes')===!!t.active));
   return l.sort((a,b)=>tf.sort==='low'?a.price-b.price:tf.sort==='high'?b.price-a.price:tf.sort==='capacity'?b.capacity-a.capacity:String(a.name).localeCompare(b.name))},[d,tf]),
  rooms=useMemo(()=>{if(!d)return [];const q=rf.q.trim().toLowerCase();
   return d.rooms.filter(r=>(!q||has(r.number,q)||has(r.maintenanceNote,q))&&(!rf.type||r.roomType===rf.type)&&(!rf.status||r.status===rf.status)&&(!rf.hk||(r.housekeeping||'clean')===rf.hk))},[d,rf]),
  typeName=id=>d?.types.find(t=>t._id===id)?.name,
  filtered=tf.q||tf.category||tf.active,rFiltered=rf.q||rf.type||rf.status||rf.hk;
 return <>
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
   <div><h1 className="font-display text-3xl">Rooms</h1><p className="text-sm text-muted">Room types are what guests book. Rooms are the physical rooms you assign.</p></div>
   {edit&&<Link to="/dashboard/rooms/new" className="btn w-full sm:w-auto"><Plus size={16}/>Add Room Type</Link>}
  </div>
  <Msg m={m}/>
  <Tabs value={tab} onChange={setTab} tabs={[['types','Room types'],['rooms','Rooms and status'],...(hk?[['hk','Housekeeping tasks']]:[])]}/>
  {!d?<Spinner/>:tab==='types'?<>
   <div className="card p-3 grid grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto] gap-2">
    <label className="relative col-span-2 lg:col-span-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/><input className="inp !pl-9" type="search" placeholder="Search by name, bed type or amenity" aria-label="Search room types" value={tf.q} onChange={e=>setTf({...tf,q:e.target.value})}/></label>
    <select className="inp" aria-label="Category" value={tf.category} onChange={e=>setTf({...tf,category:e.target.value})}><option value="">All categories</option>{cats.map(c=><option key={c}>{c}</option>)}</select>
    <select className="inp" aria-label="Visibility" value={tf.active} onChange={e=>setTf({...tf,active:e.target.value})}><option value="">Available and hidden</option><option value="yes">Available only</option><option value="no">Hidden only</option></select>
    <select className="inp col-span-2 lg:col-span-1" aria-label="Sort" value={tf.sort} onChange={e=>setTf({...tf,sort:e.target.value})}>{SORTS.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
   </div>
   {filtered&&<div className="flex items-center justify-between gap-3 text-sm text-muted -mt-1"><span>{types.length} of {d.types.length} room types</span><Btn onClick={()=>setTf({...tf,q:'',category:'',active:''})}>Clear filters</Btn></div>}
   {types.length?<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{types.map(t=><RoomTypeCard key={t._id} t={t} roomCount={d.rooms.filter(r=>r.roomType===t._id).length} edit={edit}/>)}</div>
   :d.types.length?<Empty icon={SearchX}>No room types match your search. <Btn onClick={()=>setTf({...tf,q:'',category:'',active:''})}>Clear filters</Btn></Empty>
   :<Empty icon={BedDouble}>No room types yet. {edit&&<Link className="text-secondary font-semibold" to="/dashboard/rooms/new">Add your first room type</Link>}</Empty>}</>
  :tab==='rooms'?<Box title="Physical rooms">
   <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
    <label className="relative col-span-2 lg:col-span-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"/><input className="inp !pl-9" type="search" placeholder="Room number or note" aria-label="Search rooms" value={rf.q} onChange={e=>setRf({...rf,q:e.target.value})}/></label>
    <select className="inp" aria-label="Room type" value={rf.type} onChange={e=>setRf({...rf,type:e.target.value})}><option value="">All types</option>{d.types.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select>
    <select className="inp" aria-label="Occupancy" value={rf.status} onChange={e=>setRf({...rf,status:e.target.value})}><option value="">Any occupancy</option>{STAT.map(s=><option key={s} value={s}>{label(s)}</option>)}</select>
    <select className="inp col-span-2 lg:col-span-1" aria-label="Housekeeping" value={rf.hk} onChange={e=>setRf({...rf,hk:e.target.value})}><option value="">Any housekeeping</option>{HK.map(s=><option key={s}>{s}</option>)}</select>
   </div>
   {rooms.length?<>
    <div className="hidden md:block overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted"><th className="py-2">Room</th><th>Type</th><th>Occupancy</th><th>Housekeeping</th><th>Booking</th><th>Maintenance note</th>{edit&&<th className="text-right">Actions</th>}</tr></thead><tbody>{rooms.map(r=><tr key={r._id} className="border-t border-ink/10">
     <td className="py-2 font-semibold">{r.number}{!r.active&&<span className="text-xs text-muted"> (inactive)</span>}</td><td>{typeName(r.roomType)}</td>
     <td><select aria-label={`Status of room ${r.number}`} className="inp !py-1.5" value={r.status} onChange={e=>set(r._id,{status:e.target.value})}>{STAT.map(s=><option key={s} value={s}>{label(s)}</option>)}</select></td>
     <td><select aria-label={`Housekeeping of room ${r.number}`} className="inp !py-1.5" value={r.housekeeping||'clean'} onChange={e=>set(r._id,{housekeeping:e.target.value})}>{HK.map(s=><option key={s}>{s}</option>)}</select></td>
     <td><BookingCell assignments={d.assignments} roomId={r._id}/></td>
     <td>{edit?<input className="inp !py-1.5" defaultValue={r.maintenanceNote} placeholder="Note" onBlur={e=>e.target.value!==(r.maintenanceNote||'')&&set(r._id,{maintenanceNote:e.target.value})}/>:r.maintenanceNote}</td>{edit&&<td className="text-right whitespace-nowrap"><RoomActions room={r} onDone={load}/></td>}</tr>)}</tbody></table></div>
    <div className="md:hidden grid gap-3">{rooms.map(r=><div key={r._id} className="border border-ink/10 rounded-xl p-3 grid gap-2 text-sm">
     <div className="flex justify-between gap-2"><b className="text-base">Room {r.number}{!r.active&&<span className="text-xs text-muted font-normal"> (inactive)</span>}</b><span className="text-muted text-right">{typeName(r.roomType)}</span></div>
     <div className="grid grid-cols-2 gap-2"><select aria-label={`Status of room ${r.number}`} className="inp !py-2" value={r.status} onChange={e=>set(r._id,{status:e.target.value})}>{STAT.map(s=><option key={s} value={s}>{label(s)}</option>)}</select>
      <select aria-label={`Housekeeping of room ${r.number}`} className="inp !py-2" value={r.housekeeping||'clean'} onChange={e=>set(r._id,{housekeeping:e.target.value})}>{HK.map(s=><option key={s}>{s}</option>)}</select></div>
     <BookingCell assignments={d.assignments} roomId={r._id}/>{edit?<input className="inp !py-2" defaultValue={r.maintenanceNote} placeholder="Maintenance note" onBlur={e=>e.target.value!==(r.maintenanceNote||'')&&set(r._id,{maintenanceNote:e.target.value})}/>:r.maintenanceNote&&<p className="text-muted">{r.maintenanceNote}</p>}{edit&&<div className="flex justify-end border-t border-ink/10 pt-2"><RoomActions room={r} onDone={load}/></div>}</div>)}</div></>
   :d.rooms.length?<Empty icon={SearchX}>No rooms match. {rFiltered&&<Btn onClick={()=>setRf({q:'',type:'',status:'',hk:''})}>Clear filters</Btn>}</Empty>:<Empty>No rooms yet. Open a room type and add room numbers.</Empty>}
   <p className="text-xs text-muted mt-3">Rooms marked maintenance or out of service are removed from bookable inventory.</p></Box>
  :<Box title="Housekeeping and maintenance tasks"><form onSubmit={task} className="grid sm:flex gap-2 flex-wrap mb-3"><select name="room" className="inp sm:!w-auto" aria-label="Room">{d.rooms.map(r=><option key={r._id} value={r._id}>Room {r.number}</option>)}</select><select name="type" className="inp sm:!w-auto" aria-label="Task type"><option>cleaning</option><option>maintenance</option></select><input name="note" placeholder="Note" className="inp sm:!w-auto sm:flex-1"/><button className="btn">Create task</button></form>
   {Array.isArray(tk)&&tk.map(t=><div key={t._id} className="flex flex-wrap gap-2 justify-between items-center border-t border-ink/10 py-2 text-sm"><span className="min-w-0 break-words">Room {t.room?.number} · {t.type} · {label(t.status)} {t.note}</span><span className="space-x-3 shrink-0">{t.status==='open'&&<Btn onClick={()=>done(t._id,'in_progress')}>Start</Btn>}<Btn onClick={()=>done(t._id,'done')}>Done</Btn></span></div>)}
   {Array.isArray(tk)&&!tk.length&&<Empty>No open tasks. Tasks you add also appear on the Booking Calendar.</Empty>}</Box>}
 </>}
