import { logToast } from '../shared/constants';
import { Close, Image } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { deleteObject, ref } from 'firebase/storage';
import { storage, updateDocFieldsWTimeStamp } from '../firebase';

export const uploadsBaseURL = `https://firebasestorage.googleapis.com/v0/b/productivf.firebasestorage.app/o/`;

export default function Media({ item, attachmentURL, children, onCoverChange = () => {} }) {
    const makeCover = async (attachmentURL) => {
        try {
            const updatedAttachments = [attachmentURL, ...item.attachments.filter(att => att !== attachmentURL)];
            await updateDocFieldsWTimeStamp(item, { image: attachmentURL, attachments: updatedAttachments });
            onCoverChange();
        } catch (err) {
            logToast(`Failed to Make Cover`, err, true);
        }
    }

    const removeAttachment = async (attachmentURL) => {
        try {
            if (attachmentURL?.includes(uploadsBaseURL)) {
                const decodedUrl = decodeURIComponent(attachmentURL.split(`?`)[0]);
                const pathStartIndex = decodedUrl.indexOf(`/o/`) + 3;
                const storagePath = decodedUrl.substring(pathStartIndex);
    
                const fileRef = ref(storage, storagePath);
                await deleteObject(fileRef);
            }

            const updatedAttachments = item.attachments.filter(att => att !== attachmentURL);
            await updateDocFieldsWTimeStamp(item, { 
                attachments: updatedAttachments,
                ...(item?.image == attachmentURL && {
                    image: updatedAttachments?.length > 0 ? updatedAttachments[0] : ``,
                }),
            });

            logToast(`Attachment removed successfully`, {attachmentURL});
        } catch (err) {
            logToast(`Failed to remove attachment`, err, true);
        }
    }

    return (
        <div className={`media`}>
            <div className={`mediaOverlay`}>
                <Tooltip title={`Remove Attachment`} arrow>
                    <IconButton 
                        size={`small`}
                        onClick={() => removeAttachment(attachmentURL)} 
                        className={`attachmentActionButton hoverBright`} 
                    >
                        <Close className={`hoverGlow`} style={{ color: `var(--gameBlue)` }} />
                    </IconButton>
                </Tooltip>
                {item?.image != attachmentURL && (
                    <Tooltip title={`Make Cover`} arrow>
                        <IconButton 
                            size={`small`}
                            onClick={() => makeCover(attachmentURL)} 
                            className={`attachmentActionButton hoverBright`} 
                        >
                            <Image className={`hoverGlow`} style={{ color: `var(--gameBlue)` }} />
                        </IconButton>
                    </Tooltip>
                )}
            </div>
            {children}
        </div>
    )
}