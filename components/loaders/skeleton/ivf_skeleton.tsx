import { CircularProgress, LinearProgress, Skeleton } from '@mui/material';

export default function IVFSkeleton(props: any) {

    let { 
        style, 
        label, 
        children, 
        className, 
        width = `100%`, 
        labelSize = 14, 
        height = `100%`, 
        animation = `wave`, 
        showLoading = false,
        labelColor = `white`, 
        // labelColor = `silver`, 
        skeletonContainerGap = 25,
        skeletonContainerPadding = 0,
        skeletonContainerWidth = `97%`,
    } = props;

    return (
        <Skeleton width={width} height={height} animation={animation} className={`${className}_container IVF_skeleton`} style={style}>
           <div className={`${className} IVF_skeleton_content`}>
                {label ? (
                    <div className={`IVF_skeleton_label_container`} style={{ gap: skeletonContainerGap, width: skeletonContainerWidth, padding: skeletonContainerPadding }}>
                        {showLoading ? <>
                            <CircularProgress size={15} style={{ color: `var(--gameBlue)` }} />
                        </> : <></>}
                        <span className={`IVF_skeleton_label`}>
                            <i style={{ color: labelColor, fontSize: labelSize }}>
                                {label}
                            </i>
                        </span>
                        {showLoading ? <>
                            <LinearProgress style={{ width: `100%` }} color={`info`} />
                        </> : <></>}
                    </div>
                ) : children}
           </div>
        </Skeleton>
    )
}