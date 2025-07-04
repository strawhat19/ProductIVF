import { useState } from 'react';
import CustomImage from '../custom-image';
// import { buildUserStructuredTree } from '../../firebase';
// import { flattenURLs, logToast } from '../../shared/constants';

export default function Gallery2({ attachments = [] }) {
  // const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>(attachments);

  // useEffect(() => {
  //   async function fetchTree() {
  //     const privateUploads = [];
  //     const publicUploads = await buildUserStructuredTree(`uploads/public`);
  //     // const privateUploads = await buildUserStructuredTree(`uploads/private`);
  //     if (publicUploads && privateUploads) {
  //       const uploads = { public: publicUploads, private: privateUploads };
  //       const uploadURLs = flattenURLs(uploads);
  //       const publicUploadURLs = uploadURLs?.map(up => (
  //         uploadsBaseURL + up?.replaceAll(`/`, `%2F`) + `?alt=media`
  //       ));
  //       setImages(publicUploadURLs);
  //       console.log(`Uploads`, {
  //         uploads,
  //         uploadURLs,
  //         publicUploadURLs,
  //       });
  //     } else {
  //       logToast(`Error on Get Uploads`, publicUploads, true);
  //     }
  //     setLoading(false);
  //   }

  //   fetchTree();
  // }, []);

  const imagesComponent = () => {
    return (
      images.length > 0 ? (
        images.map((img, imgIndx) => (
          <CustomImage key={imgIndx} src={img} borderRadius={4} />
        ))
      ) : (
        <>No Images</>
      )
    )
  }

  return (
    <div className={`gallery ${images?.length > 0 ? (images?.length == 1 ? `single_gallery` : `double_gallery`) : `empty_gallery`}`}>
      {imagesComponent()}
      {/* {loading ? (
        <>Loading...</>
      ) : imagesComponent()} */}
    </div>
  );
}