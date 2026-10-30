import {api,err} from './api';
export const inventory=p=>api.get('/inventory',{params:p});
export const getType=id=>api.get('/room-types/'+id);
export const saveType=(id,b)=>id?api.patch('/room-types/'+id,b):api.post('/room-types',b);
export const addRoom=b=>api.post('/rooms',b);
export const patchRoom=(id,b)=>api.patch('/rooms/'+id,b);
export const ALLOWED=['image/jpeg','image/png','image/webp'],MAX=10*1024*1024;
export const validateImage=f=>!ALLOWED.includes(f.type)?`${f.name}: use a JPG, PNG or WebP image`:f.size>MAX?`${f.name}: larger than 10 MB`:null;
// Signed direct upload to Cloudinary with progress. Resolves with the metadata saved on the record.
export const uploadToCloud=(file,onProgress)=>new Promise(async(res,rej)=>{try{const s=(await api.get('/uploads/sign')).data,fd=new FormData();
 ['folder','timestamp','signature'].forEach(k=>fd.append(k,s[k]));fd.append('api_key',s.apiKey);fd.append('file',file);
 const x=new XMLHttpRequest();x.open('POST',`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`);x.upload.onprogress=e=>e.lengthComputable&&onProgress(Math.round(e.loaded/e.total*100));
 x.onload=()=>{let r={};try{r=JSON.parse(x.responseText)}catch{}x.status<300&&r.secure_url?res({url:r.secure_url,publicId:r.public_id,width:r.width,height:r.height,format:r.format,bytes:r.bytes}):rej(new Error((r.error&&r.error.message)||'Upload failed'))};
 x.onerror=()=>rej(new Error('Network problem. Check your connection and retry.'));x.send(fd)}catch(e){rej(new Error(err(e)))}});
export const deleteRoom=id=>api.delete('/rooms/'+id);
