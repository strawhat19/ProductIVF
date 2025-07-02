import 'react-lazy-load-image-component/src/effects/blur.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export default function CustomImage({ useLazyLoad = true, alt = `Image`, width, height, effect = `blur`, className = `customImageComponent`, id, src, onImageLoad = (e) => {}, onImageError = (e) => {}, borderRadius = 0, style = { opacity: 1 }, }: any) {
    return useLazyLoad ? (
        <LazyLoadImage 
            id={id} 
            alt={alt} 
            src={src} 
            width={width}
            height={height} 
            effect={effect} 
            onLoad={(e) => onImageLoad(e)}
            onError={(e) => onImageError(e)}
            style={{ borderRadius, ...style }}
            className={`imageComponent ${className}`} 
        />
    ) : (
        <img 
            id={id} 
            alt={alt} 
            src={src} 
            width={width}
            height={height} 
            onLoad={(e) => onImageLoad(e)}
            onError={(e) => onImageError(e)}
            style={{ borderRadius, ...style }}
            className={`imageComponent ${className}`}
        />
    )
}