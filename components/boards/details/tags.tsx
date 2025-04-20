import { useContext } from 'react';
import { StateContext } from '../../../pages/_app';
import { Types, Views } from '../../../shared/types/types';

export default function Tags({ item, className = `tagsComponent`, parentClass = `tagsParent`, extend = false }) {
    const { selected } = useContext<any>(StateContext);

    const Tag = (tagName = item?.rank) => {
        return (
            <span className={`detailField itemTags itemTag ${item?.type == Types.Item ? `tagItem` : `tagTask`} itemCategory itemDate itemName itemCreated itemUpdated textOverflow extended flex row ${className}`}>
                <span className={`tagIconBadge`} style={{ color: `var(--gameBlue)`, fontSize: 9 }}>
                    {item?.type[0]}
                </span>
                <span className={`tagIconBadge`} style={{ fontSize: 9 }}>
                    {extend && (selected != null && selected?.type == Views.Details) ? item?.type : ``}
                </span>
                {/* {item?.type == Types.Item && (
                    <span className={`tagIconBadge`} style={{ color: `var(--gameBlue)`, fontSize: 9 }}>
                        +
                    </span>
                )} */}
                {/* <i style={{ color: `var(--gameBlue)`, fontSize: item?.type == Types.Item ? 9 : 7 }} className={`tagIconBadge ${item?.type == Types.Item ? `fas fa-plus` : `fas fa-check`}`} /> */}
                <span className={`tagNameField itemDateTime`}>
                    {tagName}
                </span>
            </span>
        )
    }

    return <>
        <div className={`itemTags itemTagsParent ${parentClass} fit ${item?.type == Types.Item ? `tagsItem` : `tagsTask`}`}>
            {Tag()}
        </div>
    </>
}