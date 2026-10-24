import {api} from './api';
export const get=()=>api.get('/website');
export const saveDraft=content=>api.put('/website/draft',{content});
export const publish=()=>api.post('/website/publish');
export const unpublish=()=>api.post('/website/unpublish');
// The address guests should use. Path links are completed with the address this dashboard is open on.
export const siteUrl=d=>!d?'':d.urlKind==='path'||!/^https?:\/\//.test(d.url||'')?location.origin+(d.path||'/h/'+d.slug):d.url;
