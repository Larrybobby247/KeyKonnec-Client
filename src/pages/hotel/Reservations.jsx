import {useMemo,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Plus,Table2,CalendarRange,MessageCircle,CheckCircle2,BedDouble,User,Phone,Mail,Moon,Users,MapPin,Receipt,Hash} from 'lucide-react';import RoomAssign from '../../components/dashboard/RoomAssign';
import {useDash} from '../../components/dashboard/DashContext';
import {useGet,Msg,run,form,Btn,Modal,Badge,Pager,Empty,useDebounced,TableSkeleton,ErrorRetry} from '../../components/ui';
import {api,err,naira,fmt,day,today} from '../../services/api';
import {owing,fullyPaid,arrived,payLabel,RES_TONE} from '../../services/rules';
import EventCalendar,{monthRange,monthOf} from '../../components/bookings/EventCalendar';

const ST=['requested','pending','confirmed','checked_in','checked_out','cancelled','no_show','expired'],PS=['unpaid','partial','paid'],
 tone=s=>({confirmed:'green',checked_in:'green',checked_out:'blue',cancelled:'red',no_show:'red',expired:'red',paid:'green',partial:'amber'}[s]||'amber'),
 LEGEND=[['teal','Booked'],['green','Checked in'],['amber','Awaiting confirmation'],['slate','Checked out'],['rose','No-show']];
const phoneLink=(r,hn)=>{let p=r.guest.phone.replace(/\D/g,'');if(p.startsWith('0'))p='234'+p.slice(1);return `https://wa.me/${p}?text=`+encodeURIComponent(`Hello ${r.guest.name}, this is ${hn} about booking ${r.reference} (${day(r.checkIn)} to ${day(r.checkOut)}).`+(r.total>r.paid?` Balance: ${naira(r.total-r.paid)}.`:''))};

export default function Reservations(){
 const {role,branch,access}=useDash(),[sp,setSp]=useSearchParams(),F=access.plan.features,
  [view,setView]=useState('table'),[f,setF]=useState({q:sp.get('q')||'',status:'',paymentStatus:'',roomType:'',from:'',to:''}),[pg,setPg]=useState(1),
  [cursor,setCursor]=useState(monthOf(today())),[m,setM]=useState(''),[panel,setPanel]=useState(sp.get('new')?{k:'new'}:null),[detail,setDetail]=useState(null),
  dq=useDebounced(f.q),cal=view==='calendar',range=useMemo(()=>monthRange(cursor),[cursor]),
  qs={...Object.fromEntries(Object.entries({...f,q:dq}).filter(([,v])=>v)),branch:branch||undefined,page:pg},
  [d,load,e]=useGet('/reservations',cal?{view:'calendar',from:range.from,to:range.to,limit:200,branch:branch||undefined}:qs),
  [inv]=useGet('/inventory',{branch:branch||undefined},{stale:30000}),
  money=['owner','manager'].includes(role),ops=F.includes('room_ops'),
  events=useMemo(()=>(d?.items||[]).filter(r=>!['cancelled','expired'].includes(r.status)).map(r=>({id:r._id,from:day(r.checkIn),to:day(r.checkOut),label:r.guest.name,sub:r.roomType?.name,tone:RES_TONE[r.status]||'teal',raw:r})),[d]);
 const close=()=>{setPanel(null);setDetail(null);setSp({});load()},
  act=(id,a)=>run(setM,async()=>{const r=await api.post(`/reservations/${id}/${a}`);setDetail(null);if(r.status===202)throw {response:{data:{error:r.data.message}}}},load),
  create=form(v=>run(setM,()=>api.post('/reservations',{roomType:v.roomType,checkIn:v.checkIn,checkOut:v.checkOut,adults:+v.adults,qty:+v.qty,source:v.source,guest:{name:v.name,phone:v.phone,email:v.email},
   ...(v.payMode&&v.payMode!=='none'?{payment:{mode:v.payMode,amount:v.payMode==='part'?+v.payAmount:undefined,method:v.payMethod||'cash'}}:{})}),close)),
  edit=form(async v=>{try{const r=await api.patch('/reservations/'+panel.r._id,{checkIn:v.checkIn,checkOut:v.checkOut,qty:+v.qty});if(r.status===202){setM(r.data.message);setPanel(null);return}const x=r.data;setM(`New total ${naira(x.total)}`+(x.owing>0?`. ${naira(x.owing)} still to pay; the guest was emailed a link.`:'')+(x.refunded?`. A refund of ${naira(x.refunded)} was started.`:''));setPanel(null);setDetail(null);load()}catch(x){setM(err(x))}}),
  pay=form(v=>run(setM,()=>api.post(`/reservations/${panel.r._id}/manual-payments`,{amount:+v.amount,method:v.method,note:v.note}),()=>{setPanel(null);setDetail(null);setM('Payment recorded');load()})),
  room=form(v=>run(setM,async()=>{if(v.roomType)await api.post(`/reservations/${panel.r._id}/change-room`,{roomType:v.roomType,keepPrice:!!v.keep});const ids=Object.keys(v).filter(k=>k.startsWith('r_'));if(ids.length)await api.post(`/reservations/${panel.r._id}/assign-rooms`,{rooms:ids.map(k=>k.slice(2))})},close)),
  open=async r=>{try{setDetail((await api.get('/reservations/'+r._id)).data)}catch(x){setM(err(x))}},
  // The whole row or card opens the details. Clicks on buttons, links and inputs inside it keep doing their own job.
  rowClick=r=>e=>{if(e.target.closest('button,a,input,select,textarea,label,[data-stop]'))return;open(r)};

 const Actions=({r})=>{const early=!arrived(r),paid=fullyPaid(r);
  return <span data-stop className="flex gap-x-3 gap-y-1.5 flex-wrap items-center text-sm" onClick={e=>e.stopPropagation()}>
   {r.status==='requested'&&<Btn onClick={()=>act(r._id,'confirm')}>Confirm</Btn>}
   {r.status==='confirmed'&&<Btn disabled={early} title={early?`Check-in opens on ${fmt(r.checkIn)}`:undefined} onClick={()=>act(r._id,'check-in')}>Check in</Btn>}
   {r.status==='checked_in'&&<Btn onClick={()=>act(r._id,'check-out')}>Check out</Btn>}
   {r.status==='confirmed'&&!early&&<Btn onClick={()=>act(r._id,'no-show')}>No-show</Btn>}
   {['confirmed','requested'].includes(r.status)&&<Btn onClick={()=>{setM('');setPanel({k:'edit',r})}}>Modify</Btn>}
   {['confirmed','checked_in'].includes(r.status)&&<Btn onClick={()=>setPanel({k:'room',r})}>Change room</Btn>}
   {money&&!['cancelled','checked_out','expired','no_show'].includes(r.status)&&(paid?<span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14}/>Paid in full</span>:<Btn onClick={()=>{setM('');setPanel({k:'pay',r})}}>{r.paid>0?'Add payment':'Payment'}</Btn>)}
   {['pending','requested','confirmed'].includes(r.status)&&<Btn onClick={()=>confirm('Cancel this reservation?')&&act(r._id,'cancel')}>Cancel</Btn>}
   {r.guest.phone&&<a className="text-secondary font-semibold inline-flex items-center gap-1" target="_blank" rel="noreferrer" href={phoneLink(r,access.hotel.name)}><MessageCircle size={14}/>WhatsApp</a>}
   {r.status==='confirmed'&&early&&<span className="basis-full text-xs text-muted">Check-in opens {fmt(r.checkIn)}</span>}
  </span>};
 const PayBadge=({r})=><Badge tone={tone(payLabel(r))}>{payLabel(r)}</Badge>;

 return <>
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
   <h1 className="font-display text-3xl">Reservations</h1>
   <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
    <div className="grid grid-cols-2 sm:flex w-full sm:w-auto rounded-full border border-ink/15 overflow-hidden bg-white" role="group" aria-label="View">
     {[['table',Table2,'Table'],['calendar',CalendarRange,'Calendar']].map(([k,I,l])=><button key={k} aria-pressed={view===k} onClick={()=>setView(k)} className={`px-4 py-2.5 text-sm font-semibold flex gap-1.5 items-center justify-center transition ${view===k?'bg-secondary text-white':''}`}><I size={16}/>{l}</button>)}
    </div>
    <button className="btn w-full sm:w-auto" onClick={()=>{setM('');setPanel({k:'new'})}}><Plus size={16}/>New reservation</button>
   </div>
  </div>
  {!panel&&<Msg m={m} ok={/recorded|total|refund/i.test(m)}/>}
  {!cal&&<div className="card p-3 grid sm:grid-cols-3 lg:grid-cols-6 gap-2">
   <input className="inp sm:col-span-3 lg:col-span-2" placeholder="Search reference, name, email" aria-label="Search" value={f.q} onChange={e=>{setF({...f,q:e.target.value});setPg(1)}}/>
   {[['status',ST,'Any status'],['paymentStatus',PS,'Any payment']].map(([k,o,l])=><select key={k} aria-label={l} className="inp" value={f[k]} onChange={e=>{setF({...f,[k]:e.target.value});setPg(1)}}><option value="">{l}</option>{o.map(s=><option key={s}>{s}</option>)}</select>)}
   <select aria-label="Room type" className="inp" value={f.roomType} onChange={e=>{setF({...f,roomType:e.target.value});setPg(1)}}><option value="">Any room</option>{inv?.types.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</select>
   <div className="grid grid-cols-2 gap-1 sm:col-span-3 lg:col-span-1"><input type="date" aria-label="Arrival from" className="inp min-w-0 !px-2" value={f.from} onChange={e=>setF({...f,from:e.target.value})}/><input type="date" aria-label="Arrival to" className="inp min-w-0 !px-2" value={f.to} onChange={e=>setF({...f,to:e.target.value})}/></div>
  </div>}
  <ErrorRetry e={e} retry={load}/>{!d&&!e&&<TableSkeleton/>}
  {d&&!cal&&(d.items.length?<>
   <div className="hidden md:block card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-muted border-b border-ink/10"><th className="p-3">Reference</th><th>Guest</th><th>Room</th><th>Stay</th><th>Guests</th><th>Total</th><th>Payment</th><th>Status</th><th>Source</th><th className="pr-3">Actions</th></tr></thead>
    <tbody>{d.items.map(r=><tr key={r._id} tabIndex={0} onKeyDown={e=>e.key==='Enter'&&!e.target.closest('button,a,input,select')&&open(r)} onClick={rowClick(r)} className="border-b border-ink/5 align-top hover:bg-mist/60 cursor-pointer focus:outline-none focus-visible:bg-mist">
     <td className="p-3"><button className="font-semibold text-secondary" onClick={()=>open(r)}>{r.reference}</button><div className="text-xs text-muted">{fmt(r.createdAt)}</div></td>
     <td>{r.guest.name}<div className="text-xs text-muted">{r.guest.phone}</div></td>
     <td>{r.roomType?.name}<div className="text-xs font-semibold text-secondary">{r.assignedRooms?.length?`Room ${r.assignedRooms.map(x=>x.number).join(', ')}`:<span className="text-muted font-normal">{['confirmed','checked_in'].includes(r.status)?'Not assigned':''}</span>}</div></td>
     <td className="whitespace-nowrap">{fmt(r.checkIn)} to {fmt(r.checkOut)}</td><td>{r.adults}</td>
     <td>{naira(r.total)}<div className="text-xs text-muted">paid {naira(r.paid)}{owing(r)>0&&r.paid>0?` · ${naira(owing(r))} left`:''}</div></td>
     <td><PayBadge r={r}/></td><td><Badge tone={tone(r.status)}>{r.status}</Badge></td><td className="text-xs">{r.source}</td>
     <td className="py-3 pr-3 min-w-[13rem]"><Actions r={r}/></td></tr>)}</tbody></table></div>
   <div className="md:hidden grid gap-3">{d.items.map(r=><div key={r._id} onClick={rowClick(r)} className="card p-4 grid gap-2 text-sm cursor-pointer active:bg-mist/60">
    <div className="flex justify-between gap-2 items-start"><button className="font-semibold text-secondary break-all text-left" onClick={()=>open(r)}>{r.reference}</button><Badge tone={tone(r.status)}>{r.status}</Badge></div>
    <div className="min-w-0 break-words"><b>{r.guest.name}</b> · {r.roomType?.name}{r.assignedRooms?.length>0&&<span className="text-secondary font-semibold"> · Room {r.assignedRooms.map(x=>x.number).join(', ')}</span>}</div>
    <div className="text-muted">{fmt(r.checkIn)} to {fmt(r.checkOut)} · {r.adults} guest{r.adults>1?'s':''}</div>
    <div className="flex items-center justify-between gap-2 flex-wrap"><span>{naira(r.total)}<span className="text-muted text-xs"> · paid {naira(r.paid)}</span></span><PayBadge r={r}/></div>
    <div className="border-t border-ink/10 pt-2"><Actions r={r}/></div></div>)}</div>
   <Pager page={pg} total={d.total} per={20} set={setPg}/></>:<Empty>No reservations match. Share your website link to start receiving bookings.</Empty>)}
  {cal&&<>
   {!d&&!e?null:<EventCalendar events={events} cursor={cursor} onCursor={setCursor} onEvent={x=>open(x.raw)} onDay={()=>{}} legend={LEGEND}/>}
   {d&&!events.length&&<p className="text-sm text-muted text-center">No reservations this month.</p>}</>}

  <Modal open={panel?.k==='new'} onClose={()=>setPanel(null)} title="New reservation"><NewForm inv={inv} money={money} create={create} m={m}/></Modal>
  <Modal open={panel?.k==='edit'} onClose={()=>setPanel(null)} title={`Modify ${panel?.r?.reference}`}>{panel?.r&&<form onSubmit={edit} className="grid gap-3"><div className="grid grid-cols-2 gap-2"><input required type="date" name="checkIn" defaultValue={day(panel.r.checkIn)} className="inp" aria-label="Check-in"/><input required type="date" name="checkOut" defaultValue={day(panel.r.checkOut)} className="inp" aria-label="Check-out"/></div><input type="number" min="1" name="qty" defaultValue={panel.r.qty} className="inp" aria-label="Rooms"/><p className="text-xs text-muted">A higher price asks the guest to pay the difference. A lower price refunds it.</p><Msg m={panel?.k==='edit'?m:''}/><button className="btn">Update</button></form>}</Modal>
  <Modal open={panel?.k==='pay'} onClose={()=>setPanel(null)} title="Record a payment">{panel?.r&&(fullyPaid(panel.r)?<p className="text-sm">This reservation is already paid in full.</p>:<form onSubmit={pay} className="grid gap-3">
   <div className="bg-mist rounded-xl p-3 text-sm grid grid-cols-3 gap-2 text-center"><div><div className="text-xs text-muted">Total</div><b>{naira(panel.r.total)}</b></div><div><div className="text-xs text-muted">Paid</div><b>{naira(panel.r.paid)}</b></div><div><div className="text-xs text-muted">Left to pay</div><b className="text-secondary">{naira(owing(panel.r))}</b></div></div>
   <label className="grid gap-1 text-xs text-muted">Amount received<input required type="number" min="1" max={owing(panel.r)} step="any" name="amount" defaultValue={owing(panel.r)} className="inp"/></label>
   <select name="method" className="inp" aria-label="Method"><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option><option value="other">Other</option></select><input name="note" placeholder="Receipt or note" className="inp"/>
   <p className="text-xs text-muted">Counted straight away and shown as manually recorded, separate from online payments. You can add more later until the balance is cleared.</p><Msg m={panel?.k==='pay'?m:''}/><button className="btn">Record payment</button></form>)}</Modal>
  <Modal open={panel?.k==='room'} onClose={close} title={`Room for ${panel?.r?.reference||''}`}>{panel?.r&&<div className="grid gap-4"><RoomAssign resId={panel.r._id} onSaved={load}/>{ops&&<form onSubmit={room} className="grid gap-3 border-t border-ink/10 pt-4"><b className="text-sm">Move to a different room type</b><select name="roomType" className="inp" aria-label="Change room type"><option value="">Keep room type</option>{inv?.types.filter(t=>t._id!==(panel.r.roomType?._id||panel.r.roomType)).map(t=><option key={t._id} value={t._id}>Move to {t.name}</option>)}</select><label className="text-sm"><input type="checkbox" name="keep" defaultChecked/> keep price (free upgrade)</label><button className="btn btn-ghost">Move guest</button></form>}</div>}</Modal>
  <Modal wide open={!!detail&&!panel} onClose={()=>setDetail(null)} title={detail?`Booking ${detail.reservation.reference}`:''}>{detail&&<Detail d={detail} Actions={Actions} PayBadge={PayBadge} role={role}/>}</Modal>
 </>}

// New reservation, with an optional payment so a guest who already paid shows as paid straight away.
function NewForm({inv,money,create,m}){
 const [mode,setMode]=useState('none');
 return <form onSubmit={create} className="grid gap-3">
  <select required name="roomType" className="inp" aria-label="Room type">{inv?.types.map(t=><option key={t._id} value={t._id}>{t.name} ({naira(t.price)})</option>)}</select>
  <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs text-muted">Check-in<input required type="date" name="checkIn" className="inp"/></label><label className="grid gap-1 text-xs text-muted">Check-out<input required type="date" name="checkOut" className="inp"/></label></div>
  <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs text-muted">Guests<input name="adults" type="number" min="1" defaultValue="2" className="inp"/></label><label className="grid gap-1 text-xs text-muted">Rooms<input name="qty" type="number" min="1" defaultValue="1" className="inp"/></label></div>
  <input required name="name" placeholder="Guest name" className="inp"/><input required name="phone" placeholder="Phone" className="inp"/><input name="email" type="email" placeholder="Email (optional)" className="inp"/>
  <select name="source" className="inp" aria-label="Source"><option value="phone">Phone</option><option value="walk_in">Walk-in</option><option value="whatsapp">WhatsApp</option></select>
  {money&&<fieldset className="grid gap-2 bg-mist rounded-xl p-3"><legend className="sr-only">Payment</legend>
   <label className="grid gap-1 text-xs text-muted">Has the guest paid?<select name="payMode" value={mode} onChange={e=>setMode(e.target.value)} className="inp"><option value="none">Not paid yet</option><option value="full">Paid in full</option><option value="part">Paid part of it</option></select></label>
   {mode==='part'&&<input required type="number" min="1" step="any" name="payAmount" placeholder="Amount paid" className="inp"/>}
   {mode!=='none'&&<select name="payMethod" className="inp" aria-label="Payment method"><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option><option value="other">Other</option></select>}</fieldset>}
  <Msg m={m}/><button className="btn">Save reservation</button></form>}

const Card=({icon:I,title,children,className=''})=><section className={`rounded-2xl border border-ink/10 bg-white p-4 grid gap-2 content-start ${className}`}><h3 className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5"><I size={14}/>{title}</h3>{children}</section>,
 Row=({k,v,bold})=><div className="flex justify-between gap-3 text-sm"><span className="text-muted shrink-0">{k}</span><span className={`text-right break-words min-w-0 ${bold?'font-bold':'font-medium'}`}>{v||'-'}</span></div>;
// Full booking details: guest, the room type and the exact room(s), stay, money and payments, laid out in cards.
function Detail({d,Actions,PayBadge}){const r=d.reservation,t=r.roomType||{},rooms=r.assignedRooms||[],nights=Math.max(1,Math.round((new Date(r.checkOut)-new Date(r.checkIn))/864e5)),pct=r.total?Math.min(100,Math.round(r.paid/r.total*100)):0;
 return <div className="grid gap-3 text-sm">
  <div className="flex flex-wrap items-center gap-2"><Badge tone={tone(r.status)}>{r.status.replace('_',' ')}</Badge><PayBadge r={r}/><span className="text-xs text-muted">Booked {fmt(r.createdAt)} · via {r.source}</span></div>
  <div className="grid md:grid-cols-2 gap-3">
   <Card icon={User} title="Guest"><div className="font-bold text-base break-words">{r.guest.name}</div>{r.guest.phone&&<a className="flex items-center gap-2 text-secondary" href={'tel:'+r.guest.phone}><Phone size={14}/>{r.guest.phone}</a>}{r.guest.email&&<a className="flex items-center gap-2 text-secondary break-all" href={'mailto:'+r.guest.email}><Mail size={14}/>{r.guest.email}</a>}<Row k="Guests" v={`${r.adults||1} adult${(r.adults||1)>1?'s':''}`}/>{r.notes&&<p className="text-xs bg-mist rounded-lg p-2 mt-1">{r.notes}</p>}</Card>
   <Card icon={BedDouble} title="Room"><Row k="Room type" v={t.name} bold/>{t.category&&<Row k="Category" v={t.category}/>}{t.bedType&&<Row k="Bed" v={`${t.beds||1} ${t.bedType}`}/>}<Row k="Rooms booked" v={r.qty}/>
    <div className="flex justify-between gap-3 items-center"><span className="text-muted text-sm">Assigned room</span><span className="flex flex-wrap justify-end gap-1.5">{rooms.length?rooms.map(x=><span key={x._id} className="rounded-lg bg-secondary text-white font-bold px-2.5 py-1 text-sm">{x.number}</span>):<span className="text-muted">{['confirmed','checked_in'].includes(r.status)?'Not assigned yet':'None'}</span>}</span></div>
    {d.branch&&<Row k="Branch" v={d.branch.name}/>}</Card>
   <Card icon={Moon} title="Stay"><Row k="Check-in" v={fmt(r.checkIn)} bold/><Row k="Check-out" v={fmt(r.checkOut)} bold/><Row k="Length of stay" v={`${nights} night${nights>1?'s':''}`}/></Card>
   <Card icon={Receipt} title="Money">{r.discount>0&&<Row k={`Discount${r.promoCode?' ('+r.promoCode+')':''}`} v={'- '+naira(r.discount)}/>}{r.tax>0&&<Row k="Taxes and fees" v={naira(r.tax)}/>}<Row k="Total" v={naira(r.total)} bold/><Row k="Paid" v={naira(r.paid)}/><div className="h-2 rounded-full bg-mist overflow-hidden"><div className="h-full bg-secondary transition-all" style={{width:pct+'%'}}/></div><Row k="Balance" v={owing(r)>0?naira(owing(r)):'Nothing to pay'} bold/></Card></div>
  <Card icon={Hash} title="Payments">{d.payments.length?d.payments.map(p=><div key={p._id} className="flex flex-wrap justify-between gap-x-3 border-t border-ink/10 first:border-0 py-1.5"><span>{p.source==='platform'?'Online':'Recorded by hotel'}{p.kind==='balance'?' (balance)':''}<span className="block text-[11px] text-muted">{fmt(p.createdAt)} · {p.reference}</span></span><span className="flex items-center gap-2"><b>{naira(p.amount)}</b><Badge tone={p.status==='success'?'green':p.status==='flagged'?'red':'amber'}>{p.status==='pending'?'waiting':p.status}</Badge></span></div>):<p className="text-muted">No payments yet.</p>}</Card>
  <div className="border-t border-ink/10 pt-3"><Actions r={r}/></div></div>}