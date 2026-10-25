import {day,today} from './api';
// Shared booking rules, so the table, the calendar and the buttons all agree.
export const owing=r=>Math.max(0,(r.total||0)-(r.paid||0));
export const fullyPaid=r=>(r.total||0)>0?owing(r)<=0:r.paymentStatus==='paid';
// A guest can be checked in from the arrival date. Until then, change the dates with Modify.
export const arrived=r=>day(r.checkIn||r.from)<=today();
export const payLabel=r=>fullyPaid(r)?'paid':(r.paid||0)>0?'partial':'unpaid';
export const RES_TONE={requested:'amber',pending:'amber',confirmed:'teal',checked_in:'green',checked_out:'slate',no_show:'rose'};
