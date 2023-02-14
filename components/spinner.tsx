export default function Spinner(props) {
    let spinner;
    props.dots ? spinner = <i className={`fas fa-spinner spinner ${props.className}`}></i> : null;
    props.sync ? spinner = <i className={`fas fa-sync-alt spinner ${props.className}`}></i> : null;
    props.circleNotch ? spinner = <i className={`fas fa-circle-notch spinner ${props.className}`}></i> : null;
    return spinner;
}