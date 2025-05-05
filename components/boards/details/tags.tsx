import TagURL from './url';
import { useContext } from 'react';
// import RelatedURLsDND from './related-urls-dnd';
import { dev, StateContext } from '../../../pages/_app';
import { Types, Views } from '../../../shared/types/types';
// import { extractRootDomain } from '../../../shared/constants';

export default function Tags({ item, className = `tagsComponent`, parentClass = `tagsParent`, extend = false }) {
    const { selected } = useContext<any>(StateContext);

    const Tag = (tagName = item?.rank) => {
        return (
            <span className={`detailField itemTags itemTag ${item?.type == Types.Item ? `tagItem` : `tagTask`} itemCategory itemDate itemName itemCreated itemUpdated textOverflow extended flex row ${className}`}>
                <span className={`tagIconBadge`} style={{ color: `var(--gameBlue)`, fontSize: 9, position: `relative`, top: 0.2 }}>
                    {item?.type[0]}
                </span>
                <span className={`tagIconBadge`} style={{ fontSize: 9 }}>
                    {extend && (selected != null && selected?.type == Views.Details) ? item?.type : ``}
                </span>
                <span className={`tagNameField itemDateTime`}>
                    {tagName}
                </span>
            </span>
        )
    }

    return <>
        <div className={`itemTags itemTagsParent ${parentClass} fit ${item?.type == Types.Item ? `tagsItem` : `tagsTask`}`}>
            {(dev() && item?.data?.relatedURLs?.length > 0) ? <>
                {item?.data?.relatedURLs?.map((url, urlIndex) => {
                    return <TagURL itemOrTask={item} key={urlIndex} url={url} />;
                })}
            </> : <></>}
            {Tag()}
        </div>
    </>
}