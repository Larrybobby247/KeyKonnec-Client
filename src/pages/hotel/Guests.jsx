import {useDash} from '../../components/dashboard/DashContext';import {Guests} from '../../components/dashboard/TeamTools';
export default function GuestsPage(){const p=useDash();return <><h1 className="font-display text-3xl">Guests</h1><Guests hotel={p.hotel}/></>}
