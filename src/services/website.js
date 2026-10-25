import {api} from './api';
export const get=()=>api.get('/website');
export const saveDraft=content=>api.put('/website/draft',{content});
export const publish=()=>api.post('/website/publish');
export const unpublish=()=>api.post('/website/unpublish');
// The address guests should use. Path links are completed with the address this dashboard is open on.
export const siteUrl=d=>{if(!d)return '';const path=location.origin+(d.path||'/h/'+d.slug),base=import.meta.env.VITE_SITE_BASE_DOMAIN;
 // A subdomain link only works when wildcard DNS is set up and this app knows the base domain. Otherwise use the address that always works.
 if(d.urlKind==='custom')return d.domainVerified&&/^https?:\/\//.test(d.url||'')?d.url:path;
 if(d.urlKind==='subdomain')return base&&/^https?:\/\//.test(d.url||'')&&String(d.url).endsWith('.'+base)?d.url:path;
 return path};
