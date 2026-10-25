import {useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {Plus,CalendarDays,Rows3,Trash2,ExternalLink} from 'lucide-react';
import {api,err,naira,fmt,day,today} from '../../services/api';
import {owing,fullyPaid,arrived,RES_TONE} from '../../services/rules';
import {useGet,Box,Msg,Btn,Modal,Badge,Empty,Tabs,form,run} from '../ui';
import EventCalendar,{monthRange,monthOf} from './EventCalendar';

const LEGEND=[['teal','Booked'],['green','Checked in'],['amber','Awaiting confirmation'],['rose','Blocked'],['orange','Maintenance'],['sky','Cleaning'],['violet','Channel booking']];
const addDays=(s,n)=>new Date(+new Date(s)+n*864e5).toISOString().slice(0,10);
const TASK_STATUS={open:'Open',in_progress:'In progress',done:'Done'};
const BLOCK_LABEL={blocked:'Blocked',maintenance:'Maintenance'};

// Turns what the server sends into what the calendar draws.
const toEvent=e=>{const from=day(e.from),to=day(e.to);
 if(e.kind==='reservation')return {id:e.id,from,to,label:e.title,sub:e.roomType,tone:RES_TONE[e.status]||'teal',raw:e};
 if(e.kind==='block'){const ota=e.source==='ota';return {id:e.id,from,to,label:ota?'Channel booking':BLOCK_LABEL[e.blockKind]||'Blocked',sub:ota?e.roomType:(e.reason||e.roomType),tone:ota?'violet':e.blockKind==='maintenance'?'orange':'rose',raw:e}}
 return {id:e.id,from,to,label:e.taskType==='cleaning'?'Cleaning':'Maintenance',sub:e.room?'Room '+e.room:'',tone:e.taskType==='cleaning'?'sky':'orange',raw:e}};
const shortDate=s=>fmt(s);

export default function BookingCalendar({branch,role,hotel}){
 const [tab,setTab]=useState('calendar'),[cursor,setCursor]=useState(monthOf(today())),[ui,setUi]=useState(null),[m,setM]=useState(''),[ok,setOk]=useState(''),
  range=useMemo(()=>monthRange(cursor),[cursor]),mgr=['owner','manager'].includes(role),hk=hotel.plan.features.includes('housekeeping'),
  [d,load,e,loading]=useGet('/calendar/events',{from:range.from,to:range.to,branch:branch||undefined}),
  [inv]=useGet('/inventory',{branch:branch||undefined},{stale:30000}),
  events=useMemo(()=>(d?.events||[]).map(toEvent),[d]),
  close=()=>{setUi(null);setM('')},done=(msg)=>{setOk(msg||'');setUi(null);setM('');load()},
  onDay=date=>setUi({k:'day',date}),onEvent=ev=>{setM('');setUi({k:'event',ev})};
 return <div className="grid gap-4 min-w-0">
  <div className="flex flex-wrap gap-3 items-center justify-between">
   <Tabs value={tab} onChange={setTab} tabs={[['calendar','Calendar'],['availability','Free rooms']]}/>
   {tab==='calendar'&&<button className="btn w-full sm:w-auto -mt-2 sm:mt-0 sm:-translate-y-2" onClick={()=>{setM('');setUi({k:'add',date:today()})}}><Plus size={16}/>Add event</button>}
  </div>
  <Msg m={ok} ok/>
  {tab==='calendar'?<>
   {e&&!d&&<div className="card p-4 text-sm text-red-700">{e} <Btn onClick={load}>Retry</Btn></div>}
   <EventCalendar events={events} cursor={cursor} onCursor={setCursor} onEvent={onEvent} onDay={onDay} legend={LEGEND} busy={loading&&!!d}/>
  </>:<Availability branch={branch}/>}

  <DayModal ui={ui} events={events} onClose={close} onEvent={onEvent} onAdd={date=>{setM('');setUi({k:'add',date})}}/>
  <Modal open={ui?.k==='event'} onClose={close} title={ui?.k==='event'?titleOf(ui.ev.raw):''} wide={ui?.ev?.raw?.kind==='reservation'}>
   {ui?.k==='event'&&(ui.ev.raw.kind==='reservation'?<ReservationEditor r={ui.ev.raw} role={role} m={m} setM={setM} done={done}/>
    :ui.ev.raw.kind==='block'?<BlockEditor b={ui.ev.raw} mgr={mgr} m={m} setM={setM} done={done}/>
    :<TaskEditor t={ui.ev.raw} m={m} setM={setM} done={done}/>)}
  </Modal>
  <Modal open={ui?.k==='add'} onClose={close} title="Add to the calendar">
   {ui?.k==='add'&&<AddEvent date={ui.date} inv={inv} mgr={mgr} hk={hk} m={m} setM={setM} done={done}/>}
  </Modal>
 </div>}

const titleOf=r=>r.kind==='reservation'?`Booking ${r.reference}`:r.kind==='block'?(r.source==='ota'?'Channel booking':BLOCK_LABEL[r.blockKind]||'Blocked'):(r.taskType==='cleaning'?'Cleaning task':'Maintenance task');

function DayModal({ui,events,onClose,onEvent,onAdd}){
 const date=ui?.k==='day'?ui.date:null,list=date?events.filter(x=>x.from<=date&&date<(x.to>x.from?x.to:addDays(x.from,1))):[];
 return <Modal open={!!date} onClose={onClose} title={date?new Date(date+'T00:00:00Z').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}):''}>
  {date&&<div className="grid gap-2 kk-sheet">
   {list.length?list.map(x=><button key={x.id} onClick={()=>onEvent(x)} className="text-left rounded-xl border border-ink/10 p-3 flex gap-3 items-center hover:border-secondary transition">
    <i className={`h-9 w-1.5 rounded-full shrink-0 ${{teal:'bg-secondary',green:'bg-emerald-600',amber:'bg-accent',sky:'bg-sky-500',slate:'bg-slate-400',rose:'bg-rose-500',orange:'bg-orange-500',violet:'bg-violet-500'}[x.tone]}`}/>
    <span className="min-w-0"><b className="block truncate">{x.label}</b><span className="text-xs text-muted block truncate">{x.sub}{x.sub?' · ':''}{shortDate(x.from)} to {shortDate(x.to)}</span></span></button>)
   :<Empty icon={CalendarDays}>Nothing on this day.</Empty>}
   <div className="flex flex-wrap gap-2 mt-2"><button className="btn flex-1" onClick={()=>onAdd(date)}><Plus size={16}/>Add event</button><Link className="btn btn-ghost flex-1" to="/dashboard/reservations?new=1">New reservation</Link></div>
  </div>}
 </Modal>}

function ReservationEditor({r,role,m,setM,done}){
 const money=['owner','manager'].includes(role),can=!['checked_out','no_show'].includes(r.status),
  save=form(v=>run(setM,async()=>{const x=await api.patch('/reservations/'+r.refId,{checkIn:v.checkIn,checkOut:v.checkOut,qty:+v.qty});if(x.status===202){done(x.data.message);return}
   done(`New total ${naira(x.data.total)}`+(x.data.owing>0?`. ${naira(x.data.owing)} still to pay; the guest was emailed a link.`:'')+(x.data.refunded?`. A refund of ${naira(x.data.refunded)} was started.`:''))})),
  act=a=>run(setM,async()=>{const x=await api.post(`/reservations/${r.refId}/${a}`);done(x.status===202?x.data.message:'')}),
  early=!arrived(r);
 return <div className="grid gap-4 text-sm">
  <div className="grid sm:grid-cols-2 gap-3">
   <div><b className="text-base">{r.title}</b><div className="text-muted">{r.roomType}{r.qty>1?` ×${r.qty}`:''}{r.rooms?.length?` · Room ${r.rooms.join(', ')}`:''}</div><div className="mt-1"><Badge tone={{confirmed:'green',checked_in:'green',checked_out:'blue',no_show:'red'}[r.status]||'amber'}>{r.status.replace('_',' ')}</Badge></div></div>
   <div><div>{naira(r.total)} total · paid {naira(r.paid)}</div><div className="mt-1">{fullyPaid(r)?<Badge tone="green">Paid in full</Badge>:<><Badge tone={r.paid>0?'amber':'red'}>{r.paid>0?'Part paid':'Unpaid'}</Badge> <span className="text-muted">{naira(owing(r))} left</span></>}</div></div>
  </div>
  {can&&['confirmed','requested','pending'].includes(r.status)&&<form onSubmit={save} className="grid gap-2 bg-mist rounded-xl p-3"><b>Change dates</b>
   <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs text-muted">Check-in<input required type="date" name="checkIn" defaultValue={day(r.from)} className="inp"/></label><label className="grid gap-1 text-xs text-muted">Check-out<input required type="date" name="checkOut" defaultValue={day(r.to)} className="inp"/></label></div>
   <label className="grid gap-1 text-xs text-muted">Rooms<input type="number" min="1" name="qty" defaultValue={r.qty} className="inp"/></label>
   <button className="btn">Save changes</button></form>}
  <div className="flex flex-wrap gap-2">
   {r.status==='requested'&&<button className="btn" onClick={()=>act('confirm')}>Confirm</button>}
   {r.status==='confirmed'&&<button className="btn" disabled={early} title={early?`Check-in opens on ${fmt(r.from)}`:''} onClick={()=>act('check-in')}>Check in</button>}
   {r.status==='checked_in'&&<button className="btn" onClick={()=>act('check-out')}>Check out</button>}
   {r.status==='confirmed'&&!early&&<button className="btn btn-ghost" onClick={()=>act('no-show')}>No-show</button>}
   {['pending','requested','confirmed'].includes(r.status)&&<button className="btn btn-ghost" onClick={()=>confirm('Cancel this reservation?')&&act('cancel')}>Cancel booking</button>}
  </div>
  {r.status==='confirmed'&&early&&<p className="text-xs text-muted -mt-2">Check-in opens on {fmt(r.from)}. Change the dates above if the guest arrives early.</p>}
  {money&&!fullyPaid(r)&&can&&r.status!=='cancelled'&&<Link className="text-secondary font-semibold inline-flex gap-1 items-center" to={'/dashboard/reservations?q='+r.reference}><ExternalLink size={14}/>Record a payment in Reservations</Link>}
  <Msg m={m}/>
 </div>}

function BlockEditor({b,mgr,m,setM,done}){
 const ota=b.source==='ota',last=addDays(day(b.to),-1),
  save=form(v=>run(setM,()=>api.patch('/blocks/'+b.refId,{kind:v.kind,qty:+v.qty,from:v.from,to:addDays(v.last,1),reason:v.reason}),()=>done('Saved'))),
  del=()=>confirm('Remove this from the calendar? The rooms become available again.')&&run(setM,()=>api.delete('/blocks/'+b.refId),()=>done('Removed'));
 if(ota)return <div className="text-sm grid gap-2"><p><b>{b.roomType}</b> is booked through a connected channel ({b.title}).</p><p className="text-muted">{fmt(b.from)} to {fmt(b.to)}. This is updated automatically from the channel calendar, so it cannot be edited here.</p></div>;
 if(!mgr)return <div className="text-sm grid gap-1"><p><b>{b.roomType}</b> ×{b.qty}</p><p className="text-muted">{fmt(b.from)} to {fmt(b.to)}{b.reason?` · ${b.reason}`:''}</p><p className="text-xs text-muted mt-2">Only the owner or a manager can change this.</p></div>;
 return <form onSubmit={save} className="grid gap-3 text-sm">
  <p className="text-muted">{b.roomType}</p>
  <label className="grid gap-1 text-xs text-muted">Type<select name="kind" defaultValue={b.blockKind} className="inp"><option value="blocked">Blocked</option><option value="maintenance">Maintenance</option></select></label>
  <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs text-muted">From<input required type="date" name="from" defaultValue={day(b.from)} className="inp"/></label><label className="grid gap-1 text-xs text-muted">Last day<input required type="date" name="last" defaultValue={last} className="inp"/></label></div>
  <label className="grid gap-1 text-xs text-muted">Rooms affected<input type="number" min="1" name="qty" defaultValue={b.qty} className="inp"/></label>
  <label className="grid gap-1 text-xs text-muted">Note<input name="reason" defaultValue={b.reason} placeholder="For example: repainting" className="inp"/></label>
  <Msg m={m}/><div className="flex gap-2"><button className="btn flex-1">Save changes</button><button type="button" className="btn btn-ghost" onClick={del} aria-label="Remove"><Trash2 size={16}/></button></div></form>}

function TaskEditor({t,m,setM,done}){
 const last=addDays(day(t.to),-1),
  save=form(v=>run(setM,()=>api.patch('/tasks/'+t.refId,{type:v.type,status:v.status,note:v.note,from:v.from||null,to:v.last||null}),()=>done('Saved'))),
  del=()=>confirm('Delete this task?')&&run(setM,()=>api.delete('/tasks/'+t.refId),()=>done('Deleted'));
 return <form onSubmit={save} className="grid gap-3 text-sm">
  <p className="text-muted">Room {t.room}</p>
  <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs text-muted">Type<select name="type" defaultValue={t.taskType} className="inp"><option value="cleaning">Cleaning</option><option value="maintenance">Maintenance</option></select></label>
   <label className="grid gap-1 text-xs text-muted">Status<select name="status" defaultValue={t.status} className="inp">{Object.entries(TASK_STATUS).map(([k,l])=><option key={k} value={k}>{l}</option>)}</select></label></div>
  <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs text-muted">From<input type="date" name="from" defaultValue={day(t.from)} className="inp"/></label><label className="grid gap-1 text-xs text-muted">Last day<input type="date" name="last" defaultValue={last} className="inp"/></label></div>
  <label className="grid gap-1 text-xs text-muted">Note<input name="note" defaultValue={t.note||''} className="inp"/></label>
  <Msg m={m}/><div className="flex gap-2"><button className="btn flex-1">Save changes</button><button type="button" className="btn btn-ghost" onClick={del} aria-label="Delete"><Trash2 size={16}/></button></div>
  <p className="text-xs text-muted">Setting the status to Done makes the room available again.</p></form>}

function AddEvent({date,inv,mgr,hk,m,setM,done}){
 const [type,setType]=useState(mgr?'blocked':hk?'cleaning':'none'),opts=[...(mgr?[['blocked','Block dates'],['maintenance','Maintenance']]:[]),...(hk?[['cleaning','Cleaning']]:[])],
  block=form(v=>run(setM,()=>api.post('/blocks',{roomTypes:[v.roomType],qty:+v.qty,from:v.from,to:addDays(v.last,1),reason:v.reason,kind:type}),()=>done('Added to the calendar'))),
  task=form(v=>run(setM,()=>api.post('/tasks',{room:v.room,type:'cleaning',note:v.note,from:v.from,to:v.last||undefined}),()=>done('Cleaning added to the calendar')));
 if(!opts.length)return <p className="text-sm text-muted">Only the owner or a manager can add blocked dates or maintenance. Cleaning tasks are part of the Professional plan.</p>;
 return <div className="grid gap-3 text-sm">
  <div className="grid gap-1.5" style={{gridTemplateColumns:`repeat(${opts.length},1fr)`}} role="group" aria-label="Event type">{opts.map(([k,l])=><button key={k} type="button" aria-pressed={type===k} onClick={()=>{setType(k);setM('')}} className={`rounded-xl border px-2 py-2 font-semibold transition ${type===k?'bg-secondary text-white border-secondary':'bg-white border-ink/15'}`}>{l}</button>)}</div>
  {type==='cleaning'?<form onSubmit={task} className="grid gap-3 kk-sheet">
   <label className="grid gap-1 text-xs text-muted">Room<select required name="room" className="inp">{inv?.rooms.map(r=><option key={r._id} value={r._id}>Room {r.number}</option>)}</select></label>
   <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs text-muted">Date<input required type="date" name="from" defaultValue={date} className="inp"/></label><label className="grid gap-1 text-xs text-muted">Last day (optional)<input type="date" name="last" className="inp"/></label></div>
   <label className="grid gap-1 text-xs text-muted">Note<input name="note" placeholder="For example: deep clean" className="inp"/></label>
   <Msg m={m}/><button className="btn">Add cleaning</button></form>
  :<form onSubmit={block} className="grid gap-3 kk-sheet">
   <label className="grid gap-1 text-xs text-muted">Room type<select required name="roomType" className="inp">{inv?.types.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select></label>
   <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs text-muted">From<input required type="date" name="from" defaultValue={date} className="inp"/></label><label className="grid gap-1 text-xs text-muted">Last day<input required type="date" name="last" defaultValue={date} className="inp"/></label></div>
   <label className="grid gap-1 text-xs text-muted">Rooms affected<input type="number" min="1" name="qty" defaultValue="1" className="inp"/></label>
   <label className="grid gap-1 text-xs text-muted">Note<input name="reason" placeholder={type==='maintenance'?'For example: air conditioner repair':'For example: owner stay'} className="inp"/></label>
   <Msg m={m}/><button className="btn">{type==='maintenance'?'Add maintenance':'Block dates'}</button></form>}
 </div>}

// Free rooms per night, kept from the old calendar for quick availability checks.
function Availability({branch}){
 const [from,setFrom]=useState(today()),[days,setDays]=useState(14),[d,,e]=useGet('/calendar',{from,days,branch:branch||undefined}),
  shift=n=>setFrom(addDays(from,n)),dates=d?Array.from({length:d.days},(_,i)=>new Date(+new Date(d.from)+i*864e5)):[];
 return <Box title="Free rooms each night" right={<span className="flex gap-3 text-sm items-center flex-wrap"><Btn onClick={()=>shift(-days)}>Back</Btn><Btn onClick={()=>setFrom(today())}>Today</Btn><Btn onClick={()=>shift(days)}>Next</Btn><select aria-label="Period" className="inp !w-auto !py-1.5" value={days} onChange={x=>setDays(+x.target.value)}><option value="7">Week</option><option value="14">2 weeks</option><option value="31">Month</option></select></span>}>
  {e&&!d&&<Msg m={e}/>}
  {d&&(d.types.length?<table className="text-xs min-w-max"><thead><tr><th className="text-left pr-3 sticky left-0 bg-white">Room type</th>{dates.map(x=><th key={+x} className="px-1 font-normal text-ink/60">{x.getUTCDate()}<div>{'SMTWTFS'[x.getUTCDay()]}</div></th>)}</tr></thead><tbody>{d.types.map(t=><tr key={t.id}><td className="pr-3 py-1 font-bold whitespace-nowrap sticky left-0 bg-white">{t.name}</td>{t.used.map((u,i)=>{const free=t.cap-u;return <td key={i} className={`text-center px-1.5 py-1 rounded ${free<=0?'bg-red-500/20':free<=1?'bg-accent/30':'bg-teal/15'}`}>{free}</td>})}</tr>)}</tbody></table>:<Empty>Add a room type to see availability.</Empty>)}
  <p className="text-xs text-ink/60 mt-2">Counts include confirmed bookings, active checkout holds and blocks. Red means sold out.</p></Box>}
