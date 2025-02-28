import { Feature } from './features';
import { withinXTime } from '../constants';
import { StateContext } from '../../pages/_app';
import { useContext, useEffect, useState } from 'react';

export default function FeatureFlagBadge({ featureID, considerBeta = true }) {
    let [isNew, setIsNew] = useState(false);
    let { features, getFeature } = useContext<any>(StateContext);
    let defaultFeature = features && features?.length > 0 ? features[0] : new Feature({});
    let [feature, setFeature] = useState(defaultFeature);

    useEffect(() => {
        setFeature(getFeature(featureID));
    }, [features])

    useEffect(() => {
        if (!feature?.status?.public) {
            setIsNew(false);
            return;
        }
        const checkIsNew = () => {
            if (feature?.status?.public) {
                setIsNew(withinXTime(feature?.meta?.lastMadePublic, 5, `minutes`));
            }
        }
        checkIsNew();
        const interval = setInterval(checkIsNew, 15_000);
        return () => clearInterval(interval);
    }, [feature?.status?.public, feature?.meta?.lastMadePublic]);

    return <>
        {feature?.status?.public == true ? (
            isNew ? (
                <div className={`featureFlagBadge`} style={{ background: `var(--gameBlue)` }}>
                    New
                </div>
            ) : <></>
        ) : (
            considerBeta && feature?.status?.beta == true && (
                <div className={`featureFlagBadge`} style={{ background: `var(--toastify-color-success)` }}>
                    Beta
                </div>
            )
        )}
    </>
}