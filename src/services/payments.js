import {api} from './api';
export const list=p=>api.get('/payments',{params:p});
export const refund=(id,amount)=>api.post(`/payments/${id}/refund`,{amount});
export const verify=id=>api.post(`/payments/${id}/verify`);
export const receiptUrl=id=>`${import.meta.env.VITE_API_URL}/payments/${id}/receipt`;
