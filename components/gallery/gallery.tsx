import CustomImage from '../custom-image';
import { useEffect, useState } from 'react';
import { buildUserStructuredTree } from '../../firebase';
import { flattenURLs, logToast } from '../../shared/constants';

export const uploadsBaseURL = `https://firebasestorage.googleapis.com/v0/b/productivf.firebasestorage.app/o/`;

export default function Gallery() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
      async function fetchTree() {
        const privateUploads = [];
        const publicUploads = await buildUserStructuredTree(`uploads/public`);
        // const privateUploads = await buildUserStructuredTree(`uploads/private`);
        if (publicUploads && privateUploads) {
          const uploads = { public: publicUploads, private: privateUploads };
          const uploadURLs = flattenURLs(uploads);
          const publicUploadURLs = uploadURLs?.map(up => (
            uploadsBaseURL + up?.replaceAll(`/`, `%2F`) + `?alt=media`
          ));
          setImages(publicUploadURLs);
          console.log(`Uploads`, {
            uploads,
            uploadURLs,
            publicUploadURLs,
          });
        } else {
          logToast(`Error on Get Uploads`, publicUploads, true);
        }
        setLoading(false);
      }

      fetchTree();
    }, []);

  return (
    <div className={`gallery ${images?.length > 0 ? (images?.length == 1 ? `single_gallery` : `double_gallery`) : `empty_gallery`}`}>
      {loading ? (
        <>Loading...</>
      ) : images.length > 0 ? (
        images.map((img, imgIndx) => (
          <CustomImage key={imgIndx} src={img} borderRadius={4} />
        ))
      ) : (
        <>No Images</>
      )}
    </div>
  );
}