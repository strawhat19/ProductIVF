import { useContext } from "react";
import { Bleed } from "nextra-theme-docs";
import { StateContext } from "../pages/_app";

export default function Iframe(props) {
    const { tasks, setTasks } = useContext<any>(StateContext);
    console.log(`iframe`, tasks);
    return <>
        <iframe src={props.src} style={{width: `100%`, height: `1080px`, margin: `20px auto`}} />
        {/* <Bleed full><iframe src={props.src} style={{width: `100%`, height: `100%`}} /></Bleed> */}
    </>
}