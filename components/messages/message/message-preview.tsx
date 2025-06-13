import DOMPurify from 'dompurify';
import { useContext } from 'react';
import Avatar from '../avatar/avatar';
import CustomImage from '../../custom-image';
import { StateContext } from '../../../pages/_app';
import { Message } from '../../../shared/models/Message';

export function stripHtmlTags(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

export default function MessagePreview({ userMessage, clickableMsg = true, onClick = () => {} }: any) {
    let { user, users } = useContext<any>(StateContext);
    // let [message, setMessage] = useState(userMessage);

    const getMessageName = (msg: Message) => {
        let msgName = msg?.name;
        let msgSender = clickableMsg ? msg?.senderEmail : msg?.creator;
        if (msgSender) {
            if (clickableMsg) {
                if (msgSender?.toLowerCase() == user?.email?.toLowerCase()) {
                    let uniqueRecips = msg?.recipients?.filter(r => r?.toLowerCase() != user?.email?.toLowerCase());
                    msgSender = uniqueRecips[0];
                }
            }
            if (users && users.length > 0) {
                let msgUser = users?.find(usr => usr?.email?.toLowerCase() == msgSender?.toLowerCase());
                if (msgUser) {
                    msgName = msgUser?.name;
                }
            }
        }
        return msgName;
    }

    const getMessageTimeStamp = (msg: Message) => {
        let msgTime = userMessage?.meta?.updated;
        if (msgTime) {
            let msgTimeStampT = msgTime?.split(` `)[0];
            let msgTimeStampX = msgTime?.split(` `)[1];
            let msgTimeStamp = `${msgTimeStampT} ${msgTimeStampX}`;
            return msgTimeStamp;
        }
    }

    return (
        <div className={`messagePreview ${clickableMsg ? `clickableMsg` : `nonClickableMsg`} ${userMessage?.creator?.toLowerCase() == user?.email?.toLowerCase() ? `msgCreator` : `msgReader`}`} onClick={onClick}>
            {userMessage?.image && userMessage?.image != `` ? (
                <CustomImage 
                    alt={`Avatar Image`} 
                    src={userMessage?.image} 
                    className={`avatarImage`} 
                />
            ) : <Avatar name={getMessageName(userMessage)} />}
            <div className={`messageContent`}>
                <div className={`messageContentTop`}>
                    <div className={`messageSenderName`}>
                        <h3>{getMessageName(userMessage)}</h3>
                    </div>
                    <div className={`messageSentDate`}>
                        {getMessageTimeStamp(userMessage)}
                    </div>
                </div>
                <div className={`messageContentPreview renderHTML`}>
                    {clickableMsg && (userMessage?.creator?.toLowerCase() == user?.email?.toLowerCase()) ? `you: ` : ``} 
                    {clickableMsg ? stripHtmlTags(userMessage?.content) : <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userMessage?.content) }} />}
                </div>
            </div>
        </div>
    )
}