import Media from '../media';
import CustomImage from '../custom-image';
import { useEffect, useState } from 'react';
import IVFSkeleton from '../loaders/skeleton/ivf_skeleton';

export default function Gallery({ item }) {
  const [images, setImages] = useState<string[]>(item?.attachments?.slice(1, item?.attachments?.length) || []);

  useEffect(() => {
    setImages(item?.attachments?.slice(1, item?.attachments?.length) || []);
  }, [item])

  const imagesComponent = () => {
    return (
      images.length > 0 ? (
        images.map((img, imgIndx) => (
          <Media key={imgIndx} item={item} attachmentURL={img}>
            <CustomImage src={img} alt={item?.name} borderRadius={`var(--borderRadius)`} />
          </Media>
        ))
      ) : (
        <IVFSkeleton 
          height={65}
          labelSize={14}
          showLoading={true}
          label={`No Attachments`} 
          skeletonContainerGap={15}
          skeletonContainerWidth={`100%`}
          className={`attachmentsLoader`} 
          skeletonContainerPadding={`5px 12px`}
        />
      )
    )
  }

  return (
    <div className={`gallery ${images?.length > 0 ? (images?.length == 1 ? `single_gallery` : `double_gallery`) : `empty_gallery`}`}>
      {imagesComponent()}
    </div>
  );
}