import { useContext, useState } from 'react';
import { StateContext } from '../../pages/_app';
import MessagePreview, { newDefaultMessage } from './message/message-preview';

export default function Messages() {
    let { user } = useContext<any>(StateContext);
    let [messages, setMessages] = useState([]);

    return (
        user != null ? (
            <div className={`messages`}>
                <div className={`messagesHeader`}>
                    <div className={`messagesInfoRow`}>
                        <h2 className={`flexThis gap5 alignCenter`}>
                            <span className={`mainColor`} style={{ fontSize: 14 }}>
                                ({messages.length})
                            </span> 
                            Messages
                        </h2>
                        <i className={`mainColor fas fa-edit`} style={{ fontSize: 14 }} />
                    </div>
                    {/* <div className={`messagesSearch`}>
                        [Messages Search Goes Here]
                    </div> */}
                </div>
                <div className={`messagesContainer`}>
                    <MessagePreview userMessage={newDefaultMessage({ name: `Bill`, content: `I am Bill` })} />
                    <MessagePreview />
                    <MessagePreview />
                    <MessagePreview />
                    <MessagePreview />
                </div>
            </div>
        ) : (
            <div className={`messagesZeroState`}>
                <i className={`mainColor fas fa-user-slash`} />
                Sign In to View Messages
            </div>
        )
    )
}