import { updateDocFieldsWTimeStamp } from '../../../firebase';
import { extractRootDomain } from '../../../shared/constants';

export const faviconOverwrites = {
    atlassian: `atlassian.com`,
}

export default function TagURL({ itemOrTask, url }) {
    let rootDomain = extractRootDomain(url) ?? `google.com`;
    const domainNameWithPath = extractRootDomain(url, true);

    for (const key in faviconOverwrites) {
        if (rootDomain.includes(key)) {
            rootDomain = faviconOverwrites[key];
            break;
        }
    }

    const favicon = `https://www.google.com/s2/favicons?domain=${rootDomain}`;
    // const favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`;
    // const parsedUrl = new URL(url.toLowerCase().startsWith(`http`) ? url : `https://${url}`);
    // const domainName = rootDomain.replace(/\.(com|net|org|io|co|gov|edu|us|uk|dev|app|info|biz|me|tv|xyz|ai|ca|in|nl|au|de)$/, ``).replace(/^[a-z]/, c => c.toUpperCase());

    const removeURL = async (e, url) => {
        const itemTaskURLs = itemOrTask?.data?.relatedURLs;
        const updatedItemTaskURLs = itemTaskURLs?.filter(ur => ur?.toLowerCase() != url?.toLowerCase());
        await updateDocFieldsWTimeStamp(itemOrTask, { [`data.relatedURLs`]: updatedItemTaskURLs });
    }

    return (
        <div title={url} className={`url websiteURL button hoverBright`} onClick={(e) => removeURL(e, url)}>
            <a
                href={url}
                target={`_blank`}
                rel={`noopener noreferrer`}
                className={`itemURL flexLabel gap5`}
            >
                {rootDomain != undefined && <img className={`tagImage`} src={favicon} alt={domainNameWithPath} width={16} height={16} />}
                <span className={`useFont pointerEventsNone`} style={{ fontSize: 10, padding: `1px 5px 0 0` }}>
                    {domainNameWithPath}
                </span>
                {/* <i className={`fas fa-external-link-alt useMainIconColor`} style={{ fontSize: 10 }} /> */}
            </a>
            <button title={`Remove URL`} className={`urlDeleteBtn`}>
                <i
                    className={`urlIcon urlDeleteIcon useMainIconColor fas fa-times`}
                    style={{ fontSize: 9, maxHeight: 10.5, maxWidth: `fit-content` }}
                />
            </button>
        </div>
    )
}