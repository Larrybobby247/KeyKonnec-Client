import {useEffect,useState} from 'react';import {BrowserRouter,Routes,Route} from 'react-router-dom';import {Suspense} from 'react';import Router,{customerRoutes,CustomerShell as CustomerLayout} from './router';import {api} from '../services/api';import AppLoader from '../components/ui/AppLoader';import ErrorBoundary from '../components/ui/ErrorBoundary';
// The main app host shows keykonnec. A hotel's subdomain or verified custom domain shows only that hotel's website.
function hostSlug(){const base=import.meta.env.VITE_SITE_BASE_DOMAIN,host=location.hostname;if(base&&host.endsWith('.'+base)&&host!==base&&host!=='www.'+base)return host.slice(0,-(base.length+1));return null}
export default function App(){const APP=import.meta.env.VITE_APP_HOST,host=location.hostname,sub=hostSlug(),custom=!sub&&APP&&host!==APP&&host!=='localhost',[slug,setSlug]=useState(sub||(custom?undefined:null));
 useEffect(()=>{if(custom)api.get('/public/by-domain',{params:{host}}).then(r=>setSlug(r.data.slug)).catch(()=>setSlug(null))},[]);
 if(slug===undefined)return <AppLoader/>;
 return <ErrorBoundary><BrowserRouter>{slug?<Suspense fallback={<AppLoader/>}><Routes><Route path="/" element={<CustomerLayout slug={slug} base=""/>}>{customerRoutes()}</Route></Routes></Suspense>:<Router/>}</BrowserRouter></ErrorBoundary>}
