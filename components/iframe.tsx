import { Bleed } from "nextra-theme-docs";

export default function Iframe(props) {
    return <>
        <iframe src={props.src} style={{width: `100%`, height: `1080px`, margin: `20px auto`}} />
        {/* <Bleed full><iframe src={props.src} style={{width: `100%`, height: `100%`}} /></Bleed> */}
    </>
}