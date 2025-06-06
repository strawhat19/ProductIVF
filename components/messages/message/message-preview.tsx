import { useState } from 'react';
import CustomImage from '../../custom-image';

export const newDefaultMessage = (overwrite?: any): any => {
    return {
        id: `msg-1`,
        name: `Aang`,
        date: `4:35 PM`,
        content: `WWWWWWWWWWWWWW WWWWWWWWWWWWWW WWWWWWWWWWWWW WWWWW WWWW WWW WWWW`,
        image: `https://sm.ign.com/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.jpg`,
        ...overwrite,
    }
}

export default function MessagePreview({ userMessage = newDefaultMessage() }: any) {
    let [message, setMessage] = useState(userMessage);

    return (
        <div className={`messagePreview`}>
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