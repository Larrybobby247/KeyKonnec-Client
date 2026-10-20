import {useEffect,useState} from 'react';import {useParams,useSearchParams,Navigate} from 'react-router-dom';import {booking} from '../../services/bookings';import {Spinner} from '../../components/ui';
// Old email and payment links point at /booking/:ref. Send them to the hotel's own website page.
export default function BookingRedirect(){const {ref}=useParams(),[sp]=useSearchParams(),[to,setTo]=useState(null),[bad,setBad]=useState(false);
 useEffect(()=>{booking(ref,sp.get('token')).then(r=>setTo(`/h/${r.data.hotel.slug}/confirmation/${ref}?token=${sp.get('token')}`)).catch(()=>setBad(true))},[]);
 return bad?<p className="p-10 text-center">We could not find this booking.</p>:to?<Navigate to={to} replace/>:<Spinner/>}
