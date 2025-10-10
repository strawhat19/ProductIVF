import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState } from 'react';
import { extractRootDomain } from '../../../shared/constants';
import { updateDocFieldsWTimeStamp } from '../../../firebase';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';

export const reorder = (list, oldIndex, newIndex) => arrayMove(list, oldIndex, newIndex);

const SortableURL = ({ url, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url });

  const style = {
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1000 : 1,
    transform: CSS.Transform.toString(transform),
  };

  const rootDomain: any = extractRootDomain(url);
  const domainNameWithPath: any = extractRootDomain(url, true);
  const favicon = `https://www.google.com/s2/favicons?domain=${rootDomain}`;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="url websiteURL button hoverBright">
      <a href={url} target="_blank" rel="noopener noreferrer" className="itemURL flexLabel gap5">
        <img src={favicon} alt="favicon" width={16} height={16} />
        <span className="useFont" style={{ padding: '0 5px 0 0' }}>
          {domainNameWithPath}
        </span>
        <i className="fas fa-external-link-alt useMainIconColor" style={{ fontSize: 10 }} />
      </a>
      <i
        title="Remove URL"
        onClick={(e) => onRemove(e, url)}
        className="urlIcon useMainIconColor fas fa-times"
        style={{ fontSize: 12, maxHeight: 10.5 }}
      />
    </div>
  );
};

export default function RelatedURLs({ item }: { item: any }) {
  const [urls, setUrls] = useState(item?.data?.relatedURLs || []);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setUrls(item?.data?.relatedURLs || []);
  }, [item?.data?.relatedURLs]);

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = urls.indexOf(active.id);
    const newIndex = urls.indexOf(over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const updatedURLs = reorder(urls, oldIndex, newIndex);
    setUrls(updatedURLs);

    await updateDocFieldsWTimeStamp(item, { [`data.relatedURLs`]: updatedURLs });
  };

  const removeURL = async (e, url) => {
    e.stopPropagation();
    const updated = urls.filter(u => u !== url);
    setUrls(updated);
    await updateDocFieldsWTimeStamp(item, { [`data.relatedURLs`]: updated });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <SortableContext items={urls} strategy={verticalListSortingStrategy}>
        {urls.map((url, index) => (
          <SortableURL key={index} url={url} onRemove={removeURL} />
        ))}
      </SortableContext>
    </DndContext>
  );
}