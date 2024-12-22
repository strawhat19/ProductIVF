import 'react-lazy-load-image-component/src/effects/blur.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export default function CustomImage({ useLazyLoad = true, alt, width, height, effect = `blur`, className, id, src }: any) {
    return useLazyLoad ? (
        <LazyLoadImage 
            id={id} 
            alt={alt} 
            src={src} 
            width={width}
            height={height} 
            effect={effect} 
            className={className} 
        />
    ) : (
        <img 
            id={id} 
            alt={alt} 
            src={src} 
            width={width}
            height={height} 
            className={className}
        />
    )
}