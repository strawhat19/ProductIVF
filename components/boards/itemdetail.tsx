import { useState } from 'react';

export default function ItemDetail(props) {
    const { item, boards, setBoards } = props;
    let [image, setImage] = useState(props.item.image ?? undefined);

    const manageItem = (e) => {
        e.preventDefault();
        let formFields = e.target.children;
        let imageLink = formFields.itemImageLink.value;
        item.image = imageLink;
        localStorage.setItem(`boards`, JSON.stringify(boards));
        setBoards(JSON.parse(localStorage.getItem(`boards`)));
        let closeButton: any = document.querySelector(`.alertButton`);
        if (closeButton) closeButton.click();
    }

    const refreshDetails = (e) => {
        e.preventDefault();
        if (e.target.name == `itemImageLink`) {
            setImage(e.target.value);
        }
    }

    return (
        <div id={`detail_view_${item?.id}`} className={`detailView flex row`}>
            {image && <img className={`itemImage`} src={image} alt={item?.content} style={{maxWidth: `50%`, maxHeight: 675}} />}
            <form onInput={(e) => refreshDetails(e)} onSubmit={(e) => manageItem(e)} className="changeInputs flex isColumn">
                <h3>Item Details</h3>
                <input type={`text`} name={`itemContent`} placeholder={`Item Content`} defaultValue={item?.content} />
                <input type={`text`} name={`itemImageLink`} placeholder={`Item Image`} defaultValue={item?.image} />
                <button className={`iconButton`} type={`submit`}>Save</button>
            </form>
        </div>
    )
}