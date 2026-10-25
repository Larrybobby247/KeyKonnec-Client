import {Component} from 'react';import {RefreshCw} from 'lucide-react';
// Catches crashes so a broken page shows a message and a retry button instead of a blank screen.
// After a new version is published, an open tab may still ask for old page files that no longer exist; in that case the page reloads once to pick up the new version.
const isChunk=e=>/dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError|error loading dynamically/i.test(String(e&&(e.message||e)));
export default class ErrorBoundary extends Component{
 state={e:null};
 static getDerivedStateFromError(e){return {e}}
 componentDidCatch(e){if(isChunk(e)){try{if(!sessionStorage.getItem('kk-chunk-reload')){sessionStorage.setItem('kk-chunk-reload','1');location.reload()}}catch{}}console.error(e)}
 render(){const {e}=this.state;if(!e)return this.props.children;
  return <div role="alert" className="min-h-[50vh] grid place-items-center p-6"><div className="card p-8 max-w-md text-center"><h1 className="font-display text-2xl">This page could not load</h1><p className="text-sm text-muted mt-2">{isChunk(e)?'A new version of keykonnec was released. Reload to get it.':'Something went wrong while showing this page.'}</p><button className="btn mt-4" onClick={()=>{try{sessionStorage.removeItem('kk-chunk-reload')}catch{}location.reload()}}><RefreshCw size={16}/>Reload page</button></div></div>}}
