import Grid from './grid';

export default function Grids(props: any) {
    let { className = `gridsComponent` } = props;
    return (
        <div className={`grids userGrids ${className}`}>
            <Grid />
        </div>
    )
}