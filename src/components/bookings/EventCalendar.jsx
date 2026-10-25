import {useMemo,useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {today} from '../../services/api';

// ---- date helpers: all dates are 'YYYY-MM-DD' strings, calculated in UTC so time zones never shift a day.
const T=s=>{const [y,m,d]=s.split('-').map(Number);return Date.UTC(y,m-1,d)},S=t=>new Date(t).toISOString().slice(0,10),DAY=864e5;
export const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEK=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export const monthOf=s=>String(s).slice(0,7);
export const shiftMonth=(c,n)=>{const [y,m]=c.split('-').map(Number),d=new Date(Date.UTC(y,m-1+n,1));return d.toISOString().slice(0,7)};
// Visible grid for a month ('YYYY-MM'): starts on the Monday on or before the 1st and covers whole weeks.
export const monthRange=c=>{const first=T(c+'-01'),dow=(new Date(first).getUTCDay()+6)%7,start=first-dow*DAY,[y,m]=c.split('-').map(Number),last=Date.UTC(y,m,0),weeks=Math.ceil(((last-start)/DAY+1)/7);return {from:S(start),to:S(start+weeks*7*DAY),weeks,start}};

// Colours are written out in full so Tailwind keeps them.
export const TONES={
  teal:'bg-secondary text-white',green:'bg-emerald-600 text-white',amber:'bg-accent text-primary',sky:'bg-sky-500 text-white',
  slate:'bg-slate-400 text-white',rose:'bg-rose-500 text-white',orange:'bg-orange-500 text-white',violet:'bg-violet-500 text-white'};
const DOT={teal:'bg-secondary',green:'bg-emerald-600',amber:'bg-accent',sky:'bg-sky-500',slate:'bg-slate-400',rose:'bg-rose-500',orange:'bg-orange-500',violet:'bg-violet-500'};

const MAXL=3;
// Puts each event on the first free line of the week so bars never overlap.
function layoutWeek(events,ws){
  const we=ws+7*DAY,segs=[];
  for(const e of events){const a=T(e.from),b=Math.max(T(e.to),a+DAY);if(b<=ws||a>=we)continue;segs.push({e,s:Math.max(0,Math.round((a-ws)/DAY)),f:Math.min(7,Math.round((b-ws)/DAY)),cl:a<ws,cr:b>we})}
  segs.sort((x,y)=>x.s-y.s||(y.f-y.s)-(x.f-x.s));
  const lanes=[];for(const g of segs){let i=lanes.findIndex(end=>end<=g.s);if(i<0){i=lanes.length;lanes.push(0)}lanes[i]=g.f;g.lane=i}
  const hidden=Array(7).fill(0);for(const g of segs)if(g.lane>=MAXL)for(let c=g.s;c<g.f;c++)hidden[c]++;
  return {segs:segs.filter(g=>g.lane<MAXL),hidden,perDay:Array.from({length:7},(_,c)=>segs.filter(g=>g.s<=c&&c<g.f))};
}

/**
 * Animated month calendar.
 * events: [{id, from, to (end exclusive), label, sub, tone, raw}]
 * cursor: 'YYYY-MM'   onCursor(next)   onEvent(event)   onDay('YYYY-MM-DD')
 */
export default function EventCalendar({events,cursor,onCursor,onEvent,onDay,legend=[],busy}){
  const {start,weeks}=useMemo(()=>monthRange(cursor),[cursor]),now=today(),[dir,setDir]=useState('');
  const go=n=>{setDir(n<0?'back':'');onCursor(shiftMonth(cursor,n))};
  const [y,m]=cursor.split('-').map(Number),rows=useMemo(()=>Array.from({length:weeks},(_,w)=>{const ws=start+w*7*DAY;return {ws,...layoutWeek(events,ws)}}),[events,start,weeks]);
  let n=0;
  return <section className="card p-3 sm:p-5" aria-label="Booking calendar">
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
      <h2 className="font-display text-xl sm:text-2xl min-w-0 flex-1 basis-40" aria-live="polite">{MONTHS[m-1]} <span className="text-muted font-normal">{y}</span></h2>
      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
        <button className="btn btn-ghost !px-3 !py-2" onClick={()=>go(-1)} aria-label="Previous month"><ChevronLeft size={18}/></button>
        <button className="btn btn-ghost !py-2 flex-1 sm:flex-none" onClick={()=>{setDir(cursor>monthOf(now)?'back':'');onCursor(monthOf(now))}}>Today</button>
        <button className="btn btn-ghost !px-3 !py-2" onClick={()=>go(1)} aria-label="Next month"><ChevronRight size={18}/></button>
      </div>
    </div>
    <div className={`transition-opacity ${busy?'opacity-60':''}`}>
      <div className="grid grid-cols-7 text-center text-[11px] sm:text-xs font-semibold text-muted pb-1.5">{WEEK.map(d=><div key={d}><span className="sm:hidden">{d[0]}</span><span className="hidden sm:inline">{d}</span></div>)}</div>
      <div key={cursor} className={`kk-cal-month ${dir} border border-ink/10 rounded-xl overflow-hidden bg-white`}>
        {rows.map((r,wi)=>{
          const cap=Math.max(1,Math.min(MAXL,r.segs.reduce((a,g)=>Math.max(a,g.lane+1),0))),hasMore=r.hidden.some(Boolean);
          return <div key={wi} className="relative border-t first:border-t-0 border-ink/10">
            {/* day cells: tapping one opens that day */}
            <div className="grid grid-cols-7">{Array.from({length:7},(_,c)=>{const t=r.ws+c*DAY,ds=S(t),inM=new Date(t).getUTCMonth()===m-1,isT=ds===now,list=r.perDay[c];
              return <button key={c} type="button" onClick={()=>onDay&&onDay(ds)} aria-label={`${ds}${list.length?`, ${list.length} event${list.length>1?'s':''}`:''}`}
                className={`kk-day relative text-left border-l first:border-l-0 border-ink/10 p-1 sm:p-1.5 min-h-[58px] sm:min-h-[var(--h)] ${inM?'bg-white':'bg-mist/60'}`} style={{'--h':`${34+cap*24+(hasMore?16:0)}px`}}>
                <span className={`inline-grid place-items-center text-[11px] sm:text-xs font-semibold h-6 min-w-6 px-1 rounded-full ${isT?'kk-today bg-primary text-white':inM?'text-ink':'text-muted/60'}`}>{+ds.slice(8)}</span>
                {list.length>0&&<span className="sm:hidden flex flex-wrap gap-[3px] mt-1" aria-hidden="true">{list.slice(0,3).map((g,i)=><i key={i} className={`block h-1.5 w-1.5 rounded-full ${DOT[g.e.tone]||DOT.teal}`}/>)}{list.length>3&&<b className="text-[9px] leading-none text-muted">+{list.length-3}</b>}</span>}
              </button>})}</div>
            {/* event bars sit on top of the cells (tablet and desktop) */}
            <div className="hidden sm:grid grid-cols-7 absolute inset-x-0 pointer-events-none" style={{top:30,gridAutoRows:'22px',rowGap:2}}>
              {r.segs.map(g=><button key={g.e.id+wi} type="button" onClick={()=>onEvent&&onEvent(g.e)} title={`${g.e.label}${g.e.sub?' · '+g.e.sub:''}`}
                style={{gridColumn:`${g.s+1} / ${g.f+1}`,gridRow:g.lane+1,animationDelay:`${(n++%14)*28}ms`}}
                className={`kk-ev pointer-events-auto h-[22px] mx-0.5 px-1.5 text-[11px] leading-[22px] font-semibold text-left truncate ${TONES[g.e.tone]||TONES.teal} ${g.cl?'rounded-l-none -ml-0.5':'rounded-l-md'} ${g.cr?'rounded-r-none -mr-0.5':'rounded-r-md'}`}>{g.e.label}{g.e.sub&&<span className="font-normal opacity-85"> · {g.e.sub}</span>}</button>)}
              {r.hidden.map((h,c)=>h>0&&<button key={'m'+c} type="button" onClick={()=>onDay&&onDay(S(r.ws+c*DAY))} style={{gridColumn:c+1,gridRow:MAXL+1}} className="pointer-events-auto text-[11px] font-semibold text-secondary text-left px-2 hover:underline">+{h} more</button>)}
            </div>
          </div>})}
      </div>
    </div>
    {legend.length>0&&<ul className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-muted">{legend.map(([t,l])=><li key={l} className="flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-sm ${DOT[t]}`}/>{l}</li>)}</ul>}
  </section>}
