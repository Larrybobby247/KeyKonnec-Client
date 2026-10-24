import {createContext,useContext,useState,useEffect} from 'react';import {useSearchParams} from 'react-router-dom';import {site as fetchSite} from '../../services/bookings';
export const Ctx=createContext(null);export const useSite=()=>useContext(Ctx);
// One hotel's public website data. `to()` keeps preview and embed flags while navigating.
export function SiteProvider({slug,base,children}){const [sp]=useSearchParams(),preview=sp.get('preview')==='1',embed=sp.get('embed')==='1',[data,setData]=useState(null),[error,setError]=useState(''),[tries,setTries]=useState(0);
 useEffect(()=>{setData(null);setError('');fetchSite(slug,preview).then(r=>setData(r.data)).catch(e=>setError(!e.response?'network':e.response.data?.error==='not_published'?'not_published':'not_found'))},[slug,preview,tries]);
 const to=(path,q={})=>{const p=new URLSearchParams(q);if(preview)p.set('preview','1');if(embed)p.set('embed','1');const s=p.toString();return base+path+(s?'?'+s:'')};
 const h=data&&data.hotel,c=(data&&data.site)||{},contact={phone:c.contact?.phone||h?.phone,email:c.contact?.email,address:c.contact?.address||h?.address,whatsapp:c.contact?.whatsapp||h?.phone,hours:c.contact?.hours};
 return <Ctx.Provider value={{retry:()=>setTries(x=>x+1),slug,base,data,error,preview,embed,to,hotel:h,site:c,contact,types:(data&&data.types)||[]}}>{children}</Ctx.Provider>}
