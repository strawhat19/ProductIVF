import Spinner from "./spinner";
import { useContext } from 'react';
import { StateContext } from '../pages/_app';

export default function Status(props) {
    const { rearranging, loading, systemStatus, anim, animCompleted } = useContext<any>(StateContext);

    return <>
        {!animCompleted && <div className={`${!anim ? `loading` : `loaded  ${animCompleted ? `animComplete` : `anim`}`}`} style={{margin: `20px 0`, padding: `0 !important`}} id="systemStatus">
    <h2 style={{fontSize: 18, paddingBottom: `.5em`, borderBottom: `1px solid var(--gameBlueSoft)`}}><i>System Status</i></h2>
      <span className="actualQuote">{rearranging ? `Rearranging...` : (systemStatus ?? `System Status Ok.`)}</span>
      {loading && <i className={`spinnerEl ${loading ? `loading` : `loaded  ${animCompleted ? `animComplete` : `anim`}`}`} style={{color: `var(--gameBlueSoft)`, fontSize: `0.85em`, fontWeight: 700, letterSpacing: `0.1px`}}><Spinner circleNotch className={`spinner`} />Loading...</i>}
  </div>}
</>
}