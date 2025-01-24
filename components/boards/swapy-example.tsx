import { useEffect, useMemo, useRef, useState } from 'react';
import { createSwapy, SlotItemMapArray, Swapy, utils } from 'swapy';

export const defaultItems = [
  { id: 10, title: `hello 10` }, { id: 500, title: `title 500` }, { id: 420, title: `420 blaze it` },
  { id: 100, title: `hello 100` }, { id: 5000, title: `title 5000` }, { id: 42069, title: `42069 blaze it` },
];

export default function SwapyExample() {
  const swapyRef = useRef<Swapy | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowStyles = { flex: 1, width: `100%`, background: `black`, minHeight: 35 };
  const flexStyles = { display: `flex`, gap: 15, alignItems: `center`, justifyContent: `center`, };
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(utils.initSlotItemMap(items, `id`));
  const slottedItems = useMemo(() => utils.toSlottedItems(items, `id`, slotItemMap), [items, slotItemMap]);

  useEffect(() => utils.dynamicSwapy(swapyRef.current, items, `id`, slotItemMap, setSlotItemMap), [items]);

  const addTask = () => {
    let existingIDs = [];
    let newID = Math.random().toString(36).substr(2, 9);
    if (existingIDs && existingIDs.length > 0) {
      while (existingIDs.includes(newID)) {
        newID = Math.random().toString(36).substr(2, 9);
      }
    }
    const newItem = { id: newID, title: `Swappable: " ${newID} "` };
    setItems([...items, newItem]);
  }

  useEffect(() => {
    swapyRef.current = createSwapy(containerRef.current!, {
      enabled: true,
      manualSwap: true,
      // dragAxis: 'x',
      // swapMode: 'drop',
      // dragOnHold: true,
      // animation: `spring`,
      // animation: 'dynamic',
      // autoScrollOnDrag: true,
    })

    swapyRef.current.onSwap((event) => {
      setSlotItemMap(event.newSlotItemMap.asArray);
    });

    return () => {
      if (swapyRef.current) {
        swapyRef.current?.destroy();
        swapyRef.current = null;
      }
    }
  }, [])
  
  return (
    <div className="container" ref={containerRef} style={{ width: `100%`, ...flexStyles, flexDirection: `column`, gap: 1 }}>
      {slottedItems.map(({ slotId, itemId, item }) => (
        // <div className="slot" key={slotId} data-swapy-slot={slotId}>
          // <div className="item" key={itemId} data-swapy-item={itemId}>
        <div className="slot" key={slotId} data-swapy-slot={slotId} style={{ ...rowStyles, ...flexStyles, width: `100%`, background: `white`, }}>
          <div className="item" key={itemId} data-swapy-item={itemId} style={{ ...rowStyles, ...flexStyles, width: `100%`, }}>
            <span>
              {item?.title}
            </span>
            {/* <span className="delete" data-swapy-no-drag onClick={() => { setItems(items.filter(i => i.id !== item.id)) }}>
              Delete
            </span> */}
          </div>
        </div>
      ))}
      <div className="item item--add" style={{ ...rowStyles }} onClick={() => addTask()}>
        + Add Item
      </div>
    </div>
  )
}