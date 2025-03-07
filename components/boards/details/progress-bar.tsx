export default function ProgressBar({ progress }) {
    const getProgressClipPath = (progress) => `polygon(0% 0, ${progress}% 0%, ${progress}% 100%, 0 100%)`;
    return <>
        <div className={`progress`}>
            <div className={`progressBar`} 
                style={{ 
                    clipPath: getProgressClipPath(parseFloat(progress)), 
                    background: progress < 100 ? `rgba(0, 194, 255, ${progress / 100})` : `var(--gameBlue)`, 
                }}>
            </div>
        </div>
    </>
}