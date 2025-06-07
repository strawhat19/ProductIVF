import { useState } from 'react';
import CustomImage from '../../custom-image';

export default function MessagePreview({ userMessage, onClick = () => {} }: any) {
    let [message, setMessage] = useState(userMessage);

    return (
        <div className={`messagePreview`} onClick={onClick}>
            <CustomImage 
                src={message.image} 
                alt={`Avatar Image`} 
                className={`avatarImage`} 
            />
            <div className={`messageContent`}>
                <div className={`messageContentTop`}>
                    <div className={`messageSenderName`}>
                        <h3>{message.name}</h3>
                    </div>
                    <div className={`messageSentDate`}>
                        {message.date}
                    </div>
                </div>
                <div className={`messageContentPreview`}>
                    {message.content}
                </div>
            </div>
        </div>
    )
}