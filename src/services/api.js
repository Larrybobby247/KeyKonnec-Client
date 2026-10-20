import axios from 'axios';
export const API=import.meta.env.VITE_API_URL;
export const api=axios.create({baseURL:API,withCredentials:true,headers:{'X-Requested-With':'keykonnec'}});
export const err=e=>e?.response?.data?.error||(e&&!e.response&&(e.code==='ERR_NETWORK'||e.message==='Network Error')?'Network problem. Check your connection and retry.':null)||e?.message||'Something went wrong. Try again.';
export const naira=n=>'₦'+Number(n||0).toLocaleString('en-NG');
export const day=d=>d?String(d).slice(0,10):'';
export const fmt=d=>d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'';
// Cloudinary delivery: automatic format (WebP/AVIF), automatic quality and a width that matches the display size.
export const cld=(url,w)=>url&&url.includes('res.cloudinary.com')&&url.includes('/image/upload/')&&!/\/upload\/[a-z]{1,2}_/.test(url)?url.replace('/image/upload/',`/image/upload/f_auto,q_auto,c_limit,w_${w}/`):url;
export const srcSet=(url,ws=[400,800,1200])=>url&&url.includes('res.cloudinary.com')?ws.map(w=>`${cld(url,w)} ${w}w`).join(', '):undefined;
