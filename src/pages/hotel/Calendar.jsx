import {useDash} from '../../components/dashboard/DashContext';import AvailabilityCalendar from '../../components/bookings/AvailabilityCalendar';
export default function CalendarPage(){const p=useDash();return <><h1 className="font-display text-3xl">Booking Calendar</h1><AvailabilityCalendar branch={p.branch} role={p.role} hotel={p.hotel}/></>}
