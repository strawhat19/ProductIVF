import { useEffect, useState } from 'react';
import { updateDocFieldsWTimeStamp } from '../../../firebase';
import { extractRootDomain } from '../../../shared/constants';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const reorder = (list: string[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default function RelatedURLsDND({ item }) {
  const [urls, setUrls] = useState<string[]>(item?.data?.relatedURLs || []);

  useEffect(() => {
    setUrls(item?.data?.relatedURLs || []);
  }, [item?.data?.relatedURLs]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const reordered = reorder(urls, source.index, destination.index);
    setUrls(reordered);
    await updateDocFieldsWTimeStamp(item, { [`data.relatedURLs`]: reordered });
  };

  const removeURL = async (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    const updated = urls.filter(u => u !== url);
    setUrls(updated);
    await updateDocFieldsWTimeStamp(item, { [`data.relatedURLs`]: updated });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={`relatedURLs`} direction={`horizontal`}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className={`relatedURLs flexLabel`}>
            {urls.map((url, index) => {
              const rootDomain: any = extractRootDomain(url);
              const domainNameWithPath: any = extractRootDomain(url, true);
              const favicon = `https://www.google.com/s2/favicons?domain=${rootDomain}`;
              return (
                <Draggable key={url} draggableId={url} index={index} isDragDisabled={urls?.length == 1}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`url websiteURL button hoverBright`}
                      style={{
                        ...provided.draggableProps.style,
                        height: '100%',          // 👈 force full height
                        display: 'flex',         // 👈 aligns internal content
                        alignItems: 'center',
                        opacity: snapshot.isDragging ? 0.7 : 1,
                        zIndex: snapshot.isDragging ? 1000 : 1,
                      }}
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="itemURL flexLabel gap5"
                      >
                        <img src={favicon} alt="favicon" width={16} height={16} />
                        <span className="useFont" style={{ padding: '0 5px 0 0' }}>
                          {domainNameWithPath}
                        </span>
                        <i className="fas fa-external-link-alt useMainIconColor" style={{ fontSize: 10 }} />
                      </a>
                      <i
                        title="Remove URL"
                        onClick={(e) => removeURL(e, url)}
                        className="urlIcon useMainIconColor fas fa-times"
                        style={{ fontSize: 12, maxHeight: 10.5 }}
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}