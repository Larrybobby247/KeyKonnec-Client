import {api} from './api';
export const get=()=>api.get('/website');
export const saveDraft=content=>api.put('/website/draft',{content});
export const publish=()=>api.post('/website/publish');
export const unpublish=()=>api.post('/website/unpublish');
