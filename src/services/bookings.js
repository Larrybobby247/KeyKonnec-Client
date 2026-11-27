import {api,publicApi as p} from './api';
export const site=(slug,preview)=>preview?api.get('/website/preview'):p.get(`/public/${slug}`);
export const availability=(slug,params)=>p.get(`/public/${slug}/availability`,{params});
export const quote=(slug,params)=>p.get(`/public/${slug}/quote`,{params});
export const book=(slug,b)=>p.post(`/public/${slug}/book`,b);
export const lookup=(slug,b)=>p.post(`/public/${slug}/lookup`,b);
export const booking=(ref,token)=>p.get(`/public/booking/${ref}`,{params:{token}});
export const payBalance=(ref,token)=>p.post(`/public/booking/${ref}/pay-balance`,null,{params:{token}});
export const feedback=(ref,token,b)=>p.post(`/public/booking/${ref}/feedback`,b,{params:{token}});
export const enquire=(slug,b)=>p.post(`/public/${slug}/enquiry`,b);
export const resume=(ref,token)=>p.post(`/public/booking/${ref}/resume`,null,{params:{token}});
// The browser remembers an unfinished booking so the guest can pay later, per hotel site. It holds only the reference and the booking's own access token.
const KEY='kk-unpaid',read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
export const rememberUnpaid=(slug,reference,token)=>{try{localStorage.setItem(KEY,JSON.stringify({...read(),[slug]:{reference,token,at:Date.now()}}))}catch{}};
export const getUnpaid=slug=>read()[slug]||null;
export const forgetUnpaid=slug=>{try{const o=read();delete o[slug];localStorage.setItem(KEY,JSON.stringify(o))}catch{}};
