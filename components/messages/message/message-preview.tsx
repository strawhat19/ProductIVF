import Avatar from '../avatar/avatar';
import { useContext, useState } from 'react';
import CustomImage from '../../custom-image';
import { StateContext } from '../../../pages/_app';
import { Message } from '../../../shared/models/Message';

export default function MessagePreview({ userMessage, clickableMsg = true, onClick = () => {} }: any) {
    let { users } = useContext<any>(StateContext);
    let [message, setMessage] = useState(userMessage);

    const getMessageName = (msg: Message) => {
        let msgName = msg?.name;
        let msgSender = msg?.senderEmail;
        if (msgSender) {
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
        let msgTime = message?.meta?.updated;
        if (msgTime) {
            let msgTimeStampT = msgTime?.split(` `)[0];
            let msgTimeStampX = msgTime?.split(` `)[1];
            let msgTimeStamp = `${msgTimeStampT} ${msgTimeStampX}`;
            return msgTimeStamp;
        }
    }

    return (
        <div className={`messagePreview ${clickableMsg ? `clickableMsg` : ``}`} onClick={onClick}>
            {message?.image && message?.image != `` ? (
                <CustomImage 
                    src={message.image} 
                    alt={`Avatar Image`} 
                    className={`avatarImage`} 
                />
            ) : <Avatar name={getMessageName(message)} />}
            <div className={`messageContent`}>
                <div className={`messageContentTop`}>
                    <div className={`messageSenderName`}>
                        <h3>{getMessageName(message)}</h3>
                    </div>
                    <div className={`messageSentDate`}>
                        {getMessageTimeStamp(message)}
                    </div>
                </div>
                <div className={`messageContentPreview`}>
                    {message?.content}
                </div>
            </div>
        </div>
    )
}