import {useDash} from '../../components/dashboard/DashContext';import {ReportsView} from '../../components/dashboard/ReportsView';
export default function ReportsPage(){const p=useDash();return <ReportsView branches={p.branches||[]} branch={p.branch} setBranch={p.setBranch} owner={p.role==='owner'}/>}
