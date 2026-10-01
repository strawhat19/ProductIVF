import type { CSSProperties } from 'react';

type CubeMotionStyle = CSSProperties & Record<`--cube-${string}`, string | number>;

const cubeTopPath = `M 0 -44 L 55 -11 L 39.6 52.8 L -15.4 19.8 Z`;
const cubeSidePath = (height: number) => `M 0 0 L 1 0 L 1 -${height} L 0 -${height} Z`;

const faceGradients = [
    { id: `dark-top`, colors: [`#191e21`, `#101417`] },
    { id: `cyan-top`, colors: [`#15f0ef`, `#00d3de`] },
    { id: `cyan-left`, colors: [`#00d3df`, `#00bbc8`] },
    { id: `cyan-right`, colors: [`#08e2e7`, `#00c5d0`] }
];

const illuminatedCubeHeights = new Map<string, number>([
    [`0-7`, 38],
    [`1-4`, 45],
    [`1-8`, 30],
    [`2-2`, 36],
    [`2-6`, 54],
    [`2-9`, 42],
    [`3-0`, 48],
    [`3-5`, 40],
    [`4-2`, 32],
    [`4-7`, 60],
    [`5-4`, 52],
    [`5-8`, 34],
    [`6-1`, 40],
    [`6-5`, 56],
    [`7-3`, 44],
    [`7-7`, 36],
    [`8-1`, 58],
    [`8-4`, 32],
    [`8-8`, 42],
    [`9-2`, 48],
    [`9-5`, 38],
    [`4-10`, 46],
    [`6-10`, 28],
    [`7-10`, 50]
]);

const cubeMotionStyle = (row: number, column: number, height: number): CubeMotionStyle => ({
    [`--cube-side-scale`]: 1 + 12 / height,
    [`--cube-delay`]: `${-(row * 0.65 + column * 0.37)}s`
});

const cubeCells = Array.from({ length: 10 }, (_, row) => (
    Array.from({ length: 12 }, (_, column) => {
        const id = `${row}-${column}`;
        const heightPattern = (row * 7 + column * 11) % 13;
        const illuminatedHeight = illuminatedCubeHeights.get(id);
        const raisedHeight = heightPattern < 3 ? 18 + heightPattern * 20 : 6;

        return {
            id,
            row,
            column,
            x: 235 + column * 58 - row * 16.3,
            y: -230 + column * 34.8 + row * 67.5,
            height: illuminatedHeight ?? raisedHeight,
            illuminated: illuminatedHeight !== undefined
        };
    })
)).flat().sort((first, second) => first.y - second.y);

const illuminatedCells = cubeCells.filter(({ illuminated }) => illuminated);

const CubeField = () => (
    <div
        aria-hidden={true}
        id={`landing-cube-field`}
        className={`landingCubeField`}
    >
        <svg
            focusable={false}
            viewBox={`0 0 760 660`}
            id={`landing-cube-field-canvas`}
            className={`landingCubeFieldCanvas`}
            preserveAspectRatio={`xMidYMid slice`}
            xmlns={`http://www.w3.org/2000/svg`}
        >
            <defs id={`landing-cube-field-definitions`} className={`landingCubeFieldDefinitions`}>
                {faceGradients.map(({ id, colors }) => (
                    <linearGradient
                        key={id}
                        x1={`0%`}
                        y1={`0%`}
                        x2={`100%`}
                        y2={`100%`}
                        className={`landingCubeFieldFaceGradient`}
                        id={`landing-cube-field-${id}-gradient`}
                    >
                        {colors.map((color, index) => (
                            <stop
                                key={color}
                                stopColor={color}
                                offset={`${index * 100}%`}
                                className={`landingCubeFieldGradientStop`}
                                id={`landing-cube-field-${id}-stop-${index}`}
                            />
                        ))}
                    </linearGradient>
                ))}
                <radialGradient
                    id={`landing-cube-field-bloom-gradient`}
                    className={`landingCubeFieldBloomGradient`}
                >
                    <stop
                        offset={`0%`}
                        stopOpacity={`0.65`}
                        stopColor={`#00e6ed`}
                        className={`landingCubeFieldGradientStop`}
                        id={`landing-cube-field-bloom-center`}
                    />
                    <stop
                        offset={`42%`}
                        stopOpacity={`0.2`}
                        stopColor={`#00d5de`}
                        className={`landingCubeFieldGradientStop`}
                        id={`landing-cube-field-bloom-middle`}
                    />
                    <stop
                        offset={`100%`}
                        stopOpacity={`0`}
                        stopColor={`#00d5de`}
                        className={`landingCubeFieldGradientStop`}
                        id={`landing-cube-field-bloom-edge`}
                    />
                </radialGradient>
            </defs>
            <path
                id={`landing-cube-field-platform`}
                className={`landingCubeFieldPlatform`}
                d={`M 235 -274 L 931 143.6 L 768 818.6 L 72 401 Z`}
            />
            <g id={`landing-cube-field-contact-shadows`} className={`landingCubeFieldContactShadows`}>
                {cubeCells.map(({ id, x, y }) => (
                    <path
                        key={id}
                        d={cubeTopPath}
                        transform={`translate(${x + 8} ${y + 11})`}
                        className={`landingCubeFieldContactShadow`}
                        id={`landing-cube-field-contact-shadow-${id}`}
                    />
                ))}
            </g>
            <g id={`landing-cube-field-cubes`} className={`landingCubeFieldCubes`}>
                {cubeCells.map(({ id, x, y, row, column, height, illuminated }) => (
                    <g
                        key={id}
                        transform={`translate(${x} ${y})`}
                        id={`landing-cube-field-position-${id}`}
                        className={`landingCubeFieldCubePosition`}
                        style={cubeMotionStyle(row, column, height)}
                    >
                        {illuminated && (
                            <ellipse
                                cx={`14`}
                                rx={`76`}
                                ry={`82`}
                                cy={22 - height * 0.45}
                                className={`landingCubeFieldCubeBloom`}
                                id={`landing-cube-field-cube-bloom-${id}`}
                                fill={`url(#landing-cube-field-bloom-gradient)`}
                            />
                        )}
                        <g
                            id={`landing-cube-field-cube-${id}`}
                            className={`landingCubeFieldCube${illuminated ? ` landingCubeFieldCubeGlowing` : ``}`}
                        >
                            <g
                                className={`landingCubeFieldLeftFacePosition`}
                                transform={`matrix(55 33 0 1 -15.4 19.8)`}
                                id={`landing-cube-field-left-face-position-${id}`}
                            >
                                <path
                                    d={cubeSidePath(height)}
                                    className={`landingCubeFieldCubeLeft`}
                                    id={`landing-cube-field-left-face-${id}`}
                                />
                            </g>
                            <g
                                className={`landingCubeFieldRightFacePosition`}
                                transform={`matrix(-15.4 63.8 0 1 55 -11)`}
                                id={`landing-cube-field-right-face-position-${id}`}
                            >
                                <path
                                    d={cubeSidePath(height)}
                                    className={`landingCubeFieldCubeRight`}
                                    id={`landing-cube-field-right-face-${id}`}
                                />
                            </g>
                            <g
                                transform={`translate(0 -${height})`}
                                className={`landingCubeFieldTopFacePosition`}
                                id={`landing-cube-field-top-face-position-${id}`}
                            >
                                <path
                                    d={cubeTopPath}
                                    className={`landingCubeFieldCubeTop`}
                                    id={`landing-cube-field-top-face-${id}`}
                                />
                            </g>
                        </g>
                    </g>
                ))}
            </g>
            <g id={`landing-cube-field-light-spill`} className={`landingCubeFieldLightSpill`}>
                {illuminatedCells.map(({ id, x, y }) => (
                    <ellipse
                        key={id}
                        rx={`82`}
                        ry={`57`}
                        cx={x + 14}
                        cy={y + 18}
                        className={`landingCubeFieldTileSpill`}
                        id={`landing-cube-field-tile-spill-${id}`}
                        fill={`url(#landing-cube-field-bloom-gradient)`}
                    />
                ))}
            </g>
        </svg>
    </div>
);

export default CubeField;
