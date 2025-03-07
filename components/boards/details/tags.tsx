export default function Tags() {
    return <>
        <div className={`itemTags`}>
            <span className={`detailField itemTags itemTag itemCategory itemDate itemName itemCreated itemUpdated textOverflow extended flex row`}>
                <i style={{ color: `var(--gameBlue)`, fontSize: 9 }} className={`fas fa-hashtag`} />
                <span className={`itemDateTime`}>
                    Tag
                </span>
            </span>
            <span className={`detailField itemTags itemTag itemCategory itemDate itemName itemCreated itemUpdated textOverflow extended flex row`}>
                <i style={{ color: `var(--gameBlue)`, fontSize: 9 }} className={`fas fa-hashtag`} />
                <span className={`itemDateTime`}>
                    Item
                </span>
            </span>
            <span className={`detailField itemTags itemTag itemCategory itemDate itemName itemCreated itemUpdated textOverflow extended flex row`}>
                <i style={{ color: `var(--gameBlue)`, fontSize: 9 }} className={`fas fa-hashtag`} />
                <span className={`itemDateTime`}>
                    Task
                </span>
            </span>
        </div>
    </>
}