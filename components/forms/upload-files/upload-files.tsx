import { storage } from '../../../firebase';
import { useContext, useState } from 'react';
// import Gallery from '../../gallery/gallery';
import { StateContext } from '../../../pages/_app';
import { ref, uploadBytes } from 'firebase/storage';
import { Button, CircularProgress } from '@mui/material';
import { getDateObj, logToast } from '../../../shared/constants';

const isPublic = true;

export default function UploadFiles() {
    const { user } = useContext<any>(StateContext);

    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            let uploadedFile: any = e.target.files[0];
            if (uploadedFile) {
                setFile(uploadedFile);
            }
        }
    }

    // const addNewPost = () => {
    //     let maxPostRank = 0;
    //     if (chats.length > 0) {
    //         let chatRanks = chats.map(ch => ch.rank).sort((a, b) => b - a);
    //         maxPostRank = chatRanks[0];
    //     }

    //     const chatNumber = Math.max(maxPostRank) + 1;
    //     const nonUserRecips = recipients?.filter(r => r?.value?.toLowerCase() != user?.email?.toLowerCase());
    //     const chatType = nonUserRecips?.length > 1 ? ChatTypes.Group : (nonUserRecips?.length == 1 ? ChatTypes.Direct : ChatTypes.Self);

    //     const recipientsEmails = recipients?.map(r => r?.value);
    //     const recipientsString = recipientsEmails?.join(` `)?.trim();
    //     const uniqueRecipientEmails = Array.from(new Set([...[user?.email, ...recipientsEmails]]));

    //     const newChat = createChat(chatNumber, recipientsString, user, uniqueRecipientEmails, chatType);
    //     const newMessage = createMessage(1, message, user, newChat?.id, uniqueRecipientEmails);
    //     newChat.lastMessage = newMessage;

    //     addChatToDatabase(newChat);
    //     addMessageToChatSubcollection(newChat?.id, newMessage);
    //     setActiveChat(newChat);

    //     setRecipients([]);
    //     resetEditor(onFormSubmitEvent);
    // }

    const handleUpload = async () => {
        if (!file) return;

        const { year, monthName: month, hour, minutes, ampmxm } = getDateObj();
        const filename = `${hour}_${minutes}_${ampmxm}-${file?.name}`;
        
        const userID = `${user?.name}_${user?.uid}`;
        const filePath = `${userID}/${year}/${month}/${filename}`;

        const path = `uploads/${isPublic ? `public` : `private`}/${filePath}`;
        const fileRef = ref(storage, path);

        setUploading(true);

        try {
            await uploadBytes(fileRef, file);
        } catch (uploadFileError) {
            logToast(`Error on File Upload`, uploadFileError, true);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`uploadFilesWrapper`}>
            {user != null && <>
                <div className={`uploadFilesContainer`}>
                    <input type={`file`} onChange={handleFileChange} />
                    <Button className={`mui_btn`} onClick={handleUpload} disabled={!file || uploading}>
                        {uploading ? <CircularProgress size={20} /> : `Upload`}
                    </Button>
                </div>
            </>}
            {/* <div className={`uploadResult`}>
                <Gallery />
            </div> */}
        </div>
    )
}