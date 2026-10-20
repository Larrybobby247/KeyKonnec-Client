import {createContext,useContext,useState,useEffect,useCallback} from 'react';import {api} from '../../services/api';import {setCacheScope,clearCache} from '../../components/ui';
export const Ctx=createContext(null);export const useAccess=()=>useContext(Ctx);
// Loads who the user is and what their role and plan allow, straight from the backend.
export function AuthProvider({children}){const [access,setA]=useState(null),[loading,setL]=useState(true);
 const reload=useCallback(()=>api.get('/me/access').then(r=>{setCacheScope(r.data.user&&r.data.user.id);setA(r.data)}).catch(()=>setA(null)).finally(()=>setL(false)),[]);useEffect(()=>{reload()},[reload]);
 return <Ctx.Provider value={{access,loading,reload,logout:async()=>{await api.post('/auth/logout').catch(()=>{});clearCache();setCacheScope('public');setA(null)}}}>{children}</Ctx.Provider>}
