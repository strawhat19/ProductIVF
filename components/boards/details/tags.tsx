import { Types } from '../../../shared/types/types';

export default function Tags({ item }) {
    const Tag = (tagName = item?.rank) => {
        return (
            <span className={`detailField itemTags itemTag ${item?.type == Types.Item ? `tagItem` : `tagTask`} itemCategory itemDate itemName itemCreated itemUpdated textOverflow extended flex row`}>
                <span className={`tagIconBadge`} style={{ color: `var(--gameBlue)`, fontSize: 9 }}>
                    {item?.type[0]}
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
        <div className={`itemTags fit ${item?.type == Types.Item ? `tagsItem` : `tagsTask`}`}>
            {Tag()}
        </div>
    </>
}