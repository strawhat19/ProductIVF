import TagURL from './url';
import { useContext } from 'react';
// import RelatedURLsDND from './related-urls-dnd';
import { dev, StateContext } from '../../../pages/_app';
import { Types, Views } from '../../../shared/types/types';
// import { extractRootDomain } from '../../../shared/constants';

export default function Tags({ item, className = `tagsComponent`, parentClass = `tagsParent`, extend = false }) {
    const { selected } = useContext<any>(StateContext);

    const Tag = (tagName = item?.rank, icon = ``, tagClassName = `customTagComponent`) => {
        return (
            <span className={`taskTag detailField itemTags itemTag ${item?.type == Types.Item ? `tagItem` : `tagTask`} itemCategory itemDate itemName itemCreated itemUpdated textOverflow extended flex row ${tagClassName} ${className}`}>
                <span className={`tagIconBadge`} style={{ color: `var(--gameBlue)`, fontSize: 9, position: `relative`, top: 0.2 }}>
                    {icon == `` ? item?.type[0] : <i className={icon} />}
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
            {(item?.data?.relatedURLs?.length > 0) ? <>
                <div className={`itemTagURLs`}>
                    {Tag(item?.data?.relatedURLs?.length, `fas fa-link`, `simplifiedLinksTag`)}
                    {item?.data?.relatedURLs?.map((url, urlIndex) => {
                        return <TagURL itemOrTask={item} key={urlIndex} url={url} />;
                    })}
                </div>
            </> : <></>}
            {Tag(undefined, undefined, `rankTag`)}
        </div>
    </>
}