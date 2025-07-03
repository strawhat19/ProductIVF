import { storage } from '../../firebase';
import { useContext, useState } from 'react';
import { StateContext } from '../../pages/_app';
import { ref, uploadBytes } from 'firebase/storage';
import { Button, CircularProgress } from '@mui/material';
import { getDateObj, logToast } from '../../shared/constants';

const isPublic = true;

export const dropZoneStyles = {
    dropZone: {
        gridGap: 5,
        minWidth: `50%`,
        display: `flex`,
        alignItems: `center`,
        padding: `5px 0 5px 5px`,
        borderRadius: `var(--borderRadius)`,
        background: `var(--darkCheckBox) !important`,
    },
    uploadInput: {
        padding: 0,
        display: `flex`,
        alignItems: `center`,
        background: `var(--transparent) !important`,
    },
    button: {
        marginRight: 5,
        color: `black`,
        alignSelf: `center`,
        padding: `0 0 0 5px`,
        background: `var(--white) !important`,
    },
    buttonContentContainer: {
        gridGap: 5,
        color: `black`,
        display: `flex`,
        alignItems: `center`,
    }
}

const styles = dropZoneStyles;

export default function DropZone() {
    const { user } = useContext<any>(StateContext);
    
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const onChange = (e) => {
        const { files: selectedFiles } = e?.target;
        const filesArray: File[] = Array.from(selectedFiles);
        setFiles(filesArray);
        console.log(`On Change`, filesArray);
    }

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);

        const userID = `${user?.name}_${user?.uid}`;
        const { year, monthName: month } = getDateObj();

        try {
            await Promise.all(files.map(async (file) => {
                const { hour, minutes, ampmxm } = getDateObj();
                const filename = `${hour}_${minutes}_${ampmxm}-${file?.name}`;
                const filePath = `${userID}/${year}/${month}/${filename}`;
                const path = `uploads/${isPublic ? `public` : `private`}/${filePath}`;
                const fileRef = ref(storage, path);
                await uploadBytes(fileRef, file);
            }));

            logToast(`All Files Uploaded Successfully`, files);
            setFiles([]);
        } catch (err) {
            logToast(`Error on One or More Uploads`, err, true);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`dropZoneWrapper`} style={styles.dropZone}>
            <input
                multiple
                type={`file`}
                className={`uploadInput`}
                style={styles.uploadInput}
                onChange={(e) => onChange(e)} 
            />
            <Button className={`mui_btn`} onClick={handleUpload} disabled={files?.length == 0 || uploading} style={{ ...styles.button, textTransform: `none` }}>
                <div className={`buttonContentContainer`} style={styles.buttonContentContainer}>
                    <i className={`fas fa-plus mainColor`} />
                    {uploading ? <CircularProgress size={20} /> : `${files?.length > 0 ? `Upload ` : ``}${files?.length} File(s)`}
                </div>
            </Button>
        </div>
    )
}