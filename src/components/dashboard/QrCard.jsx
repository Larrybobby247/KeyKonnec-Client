import {useEffect,useState} from 'react';import QRCode from 'qrcode';import {Download,QrCode,Loader2} from 'lucide-react';
const DARK='#0D2B2A';
const slug=s=>String(s||'hotel').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'hotel';
const save=(blob,name)=>{const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000)};
const fit=(ctx,text,max,start,min,font)=>{let size=start;ctx.font=font(size);while(ctx.measureText(text).width>max&&size>min){size-=2;ctx.font=font(size)}return size};
// QR code for the hotel website link: a preview, a print-ready PNG with the hotel name and address underneath, and a scalable SVG.
export default function QrCard({url,name,live}){const [src,setSrc]=useState(''),[busy,setBusy]=useState(''),[m,setM]=useState('');
 useEffect(()=>{let on=true;setSrc('');QRCode.toDataURL(url,{width:520,margin:1,errorCorrectionLevel:'M',color:{dark:DARK,light:'#ffffff'}}).then(d=>on&&setSrc(d)).catch(()=>on&&setM('Could not create the QR code.'));return()=>{on=false}},[url]);
 const png=async()=>{setBusy('png');setM('');try{
   const W=1200,H=1500,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,W,H);
   x.fillStyle=DARK;x.fillRect(0,0,W,16);x.fillStyle='#D9A441';x.fillRect(0,16,W,6);x.textAlign='center';x.textBaseline='alphabetic';
   x.fillStyle=DARK;fit(x,name,W-160,64,34,s=>`700 ${s}px Georgia, serif`);x.fillText(name,W/2,170);
   x.fillStyle='#1C5D57';x.font='600 34px -apple-system, Segoe UI, Arial, sans-serif';x.fillText('Scan to book your stay',W/2,235);
   const q=document.createElement('canvas');await QRCode.toCanvas(q,url,{width:880,margin:1,errorCorrectionLevel:'M',color:{dark:DARK,light:'#ffffff'}});
   x.strokeStyle='#E3EAE8';x.lineWidth=4;x.strokeRect(120,290,960,960);x.drawImage(q,160,330,880,880);
   x.fillStyle=DARK;const shown=url.replace(/^https?:\/\//,'');fit(x,shown,W-160,38,22,s=>`600 ${s}px -apple-system, Segoe UI, Arial, sans-serif`);x.fillText(shown,W/2,1330);
   x.fillStyle='#74817E';x.font='500 26px -apple-system, Segoe UI, Arial, sans-serif';x.fillText('Point your phone camera at the code',W/2,1385);x.fillText('Powered by keykonnec',W/2,1450);
   await new Promise((ok,no)=>c.toBlob(b=>b?(save(b,`${slug(name)}-qr-code.png`),ok()):no(new Error('png')),'image/png'))}catch{setM('Could not create the image. Try the SVG instead.')}setBusy('')},
  svg=async()=>{setBusy('svg');setM('');try{const t=await QRCode.toString(url,{type:'svg',margin:2,errorCorrectionLevel:'M',color:{dark:DARK,light:'#ffffff'}});save(new Blob([t],{type:'image/svg+xml'}),`${slug(name)}-qr-code.svg`)}catch{setM('Could not create the SVG.')}setBusy('')};
 return <section className="card p-5 sm:p-6 max-w-2xl mx-auto w-full"><div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start"><div className="shrink-0 rounded-2xl border border-ink/10 p-2 bg-white">{src?<img src={src} alt={`QR code for ${url}`} width="176" height="176" className="w-44 h-44"/>:<div className="w-44 h-44 grid place-items-center text-muted"><Loader2 className="spin"/></div>}</div>
  <div className="text-center sm:text-left"><h2 className="font-display text-xl flex items-center gap-2 justify-center sm:justify-start"><QrCode size={20} className="text-secondary"/>QR code for your website</h2><p className="text-sm text-muted mt-1">Guests scan it with their phone camera and land on your booking website. Print it for the front desk, rooms, flyers and posters.</p>
   <p className="text-xs text-muted mt-1 break-all">Links to: {url}</p>{!live&&<p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-2 mt-2">Your website is not published yet, so the code will not open anything until you publish.</p>}
   <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start"><button className="btn" onClick={png} disabled={!src||!!busy}>{busy==='png'?<Loader2 size={16} className="spin"/>:<Download size={16}/>}Download PNG</button><button className="btn btn-ghost" onClick={svg} disabled={!src||!!busy}>{busy==='svg'?<Loader2 size={16} className="spin"/>:<Download size={16}/>}Download SVG</button></div>
   {m&&<p role="alert" className="text-sm text-red-700 mt-2">{m}</p>}</div></div></section>}
