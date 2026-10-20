import {useDash} from '../../components/dashboard/DashContext';import {Reports} from '../../components/dashboard/MoneyTools';
export default function ReportsPage(){const p=useDash();return <><h1 className="font-display text-3xl">Reports</h1><Reports role={p.role} hotel={p.hotel}/></>}
