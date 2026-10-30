import {useState,useCallback} from 'react';import {Link} from 'react-router-dom';import {Lock,AlertTriangle,Loader2,Download} from 'lucide-react';
import {api,naira} from '../../services/api';import {Modal,useGet} from '../ui';import {useDash} from './DashContext';

// Reads the message out of an error response, including JSON errors that arrive as a Blob (downloads ask for a blob).
const messageOf=async e=>{const d=e&&e.response&&e.response.data;try{if(typeof Blob!=='undefined'&&d instanceof Blob){const t=await d.text();try{return JSON.parse(t).error||t}catch{return t}}}catch{}
 return (d&&d.error)||(e&&!e.response?'Network problem. Check your connection and try again.':e&&e.message)||'The download failed. Please try again.'};

// Names the cheapest plan that includes a feature, so the upgrade message can say what to upgrade to.
function UpgradeBody({feature,label,message,onClose}){const {access}=useDash(),[plans]=useGet('/plans',null,{stale:300000,shared:true}),
 target=plans&&[...plans].sort((a,b)=>a.price-b.price).find(p=>p.features.includes(feature)),owner=access.user.role==='owner';
 return <div className="text-center">
  <span className="mx-auto grid place-items-center h-14 w-14 rounded-full bg-amber-100 text-amber-700"><Lock size={26}/></span>
  <p className="font-semibold mt-3">{label||'This download'} is not included in your {access.plan.name} plan</p>
  <p className="text-sm text-muted mt-1">{target?<>It is available from the <b>{target.name}</b> plan ({naira(target.price)} per month). </>:null}{message&&!target?message+' ':''}{owner?'Upgrade to unlock it.':'Ask the hotel owner to upgrade the plan.'}</p>
  <div className="grid gap-2 mt-5">{owner&&<Link to="/dashboard/subscription" onClick={onClose} className="btn !py-3">View plans and upgrade</Link>}<button type="button" onClick={onClose} className="btn btn-ghost">Not now</button></div></div>}

// useDownload(): returns [start, modal, busyKey]. start(path, filename, {feature, label, params}) downloads a file from the API with the user's session.
// If the plan lacks `feature`, or the server answers 402, an upgrade modal opens instead of leaving the app. Other failures open an error modal.
export const useDownload=()=>{const {access}=useDash(),[busy,setBusy]=useState(''),[up,setUp]=useState(null),[bad,setBad]=useState('');
 const start=useCallback(async(path,filename,o={})=>{if(busy)return;
  if(o.feature&&!access.plan.features.includes(o.feature)){setUp({feature:o.feature,label:o.label});return}
  setBusy(path);
  try{const r=await api.get(path,{responseType:'blob',params:o.params}),url=URL.createObjectURL(r.data),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000)}
  catch(e){const m=await messageOf(e);if(e&&e.response&&e.response.status===402)setUp({feature:o.feature,label:o.label,message:m});else setBad(m)}
  finally{setBusy('')}},[busy,access]);
 const modal=<>
  <Modal open={!!up} onClose={()=>setUp(null)} title="Upgrade to download">{up&&<UpgradeBody {...up} onClose={()=>setUp(null)}/>}</Modal>
  <Modal open={!!bad} onClose={()=>setBad('')} title="Download failed"><div className="text-center"><span className="mx-auto grid place-items-center h-14 w-14 rounded-full bg-red-100 text-red-700"><AlertTriangle size={26}/></span><p className="text-sm mt-3 break-words">{bad}</p><button type="button" className="btn mt-5 w-full" onClick={()=>setBad('')}>Close</button></div></Modal></>;
 return [start,modal,busy]};

// A link-style button that downloads through the API. Place {modal} once near it, or use <DownloadLink/> which brings its own.
export function DownloadLink({path,filename,feature,label,params,children,className='text-teal font-bold text-sm',icon}){const [start,modal,busy]=useDownload();
 return <><button type="button" className={'inline-flex items-center gap-1.5 hover:underline disabled:opacity-60 '+className} disabled={!!busy} onClick={()=>start(path,filename,{feature,label,params})}>{busy?<Loader2 size={14} className="spin"/>:icon?<Download size={14}/>:null}{children}</button>{modal}</>}
