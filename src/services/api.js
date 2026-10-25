import axios from 'axios';
export const API=import.meta.env.VITE_API_URL;
export const api=axios.create({baseURL:API,withCredentials:true,headers:{'X-Requested-With':'keykonnec'}});
// Public hotel website calls carry no cookies, so a hotel site on its own domain or subdomain can call the API.
export const publicApi=axios.create({baseURL:API,withCredentials:false,headers:{'X-Requested-With':'keykonnec'}});
export const err=e=>e?.response?.data?.error||(e&&!e.response&&(e.code==='ERR_NETWORK'||e.message==='Network Error')?'Network problem. Check your connection and retry.':null)||e?.message||'Something went wrong. Try again.';
export const naira=n=>'₦'+Number(n||0).toLocaleString('en-NG');
// Calendar dates travel as 'YYYY-MM-DD' (UTC midnight). A Date object is converted to that form; a plain String(date) would give text like 'Sat Oct 24', which broke every calendar.
export const day=d=>d instanceof Date?(isNaN(d)?'':d.toISOString().slice(0,10)):d?String(d).slice(0,10):'';
// Today's date on the device clock, as YYYY-MM-DD.
export const today=()=>{const n=new Date(),p=x=>String(x).padStart(2,'0');return n.getFullYear()+'-'+p(n.getMonth()+1)+'-'+p(n.getDate())};
export const fmt=d=>d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'';
// Cloudinary delivery: automatic format (WebP/AVIF), automatic quality and a width that matches the display size.
export const cld=(url,w)=>url&&url.includes('res.cloudinary.com')&&url.includes('/image/upload/')&&!/\/upload\/[a-z]{1,2}_/.test(url)?url.replace('/image/upload/',`/image/upload/f_auto,q_auto,c_limit,w_${w}/`):url;
export const srcSet=(url,ws=[400,800,1200])=>url&&url.includes('res.cloudinary.com')?ws.map(w=>`${cld(url,w)} ${w}w`).join(', '):undefined;
