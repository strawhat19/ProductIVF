import { useEffect, useMemo, useRef, useState } from 'react'
import { createSwapy, SlotItemMapArray, Swapy, utils } from 'swapy'

type Item = {
  id: string
  title: string
}

const initialItems: Item[] = [
  { id: '1', title: '1' },
  { id: '2', title: '2' },
  { id: '3', title: '3' },
]

let id = 4

function SwapyExample2() {
  const fullWidth = { width: `100%`, minWidth: `100%`, maxWidth: `100%` };
  const rowStyles = { ...fullWidth, display: `flex`, justifyContent: `center`, alignItems: `center`, background: `black` };

  const [items, setItems] = useState<Item[]>(initialItems)
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(utils.initSlotItemMap(items, 'id'))
  const slottedItems = useMemo(() => utils.toSlottedItems(items, 'id', slotItemMap), [items, slotItemMap])
  const swapyRef = useRef<Swapy | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => utils.dynamicSwapy(swapyRef.current, items, 'id', slotItemMap, setSlotItemMap), [items])

  useEffect(() => {
    swapyRef.current = createSwapy(containerRef.current!, {
      manualSwap: true,
      // animation: 'dynamic'
      // autoScrollOnDrag: true,
      // swapMode: 'drop',
      // enabled: true,
      // dragAxis: 'x',
      // dragOnHold: true
    })

    swapyRef.current.onSwap((event) => {
      setSlotItemMap(event.newSlotItemMap.asArray)
    })

    return () => {
      swapyRef.current?.destroy()
    }
  }, [])
  return (
    <div className="container" ref={containerRef} style={{ ...rowStyles, background: `transparent`, flexDirection: `column`, gap: 15 }}>
      <div className="items" style={{ ...rowStyles, flexDirection: `column`, gap: 1 }}>
        {slottedItems.map(({ slotId, itemId, item }) => (
          <div className="slot" key={slotId} data-swapy-slot={slotId} style={{ ...rowStyles, background: `white` }}>
            {item &&
              <div className="item" data-swapy-item={itemId} key={itemId} style={{ ...rowStyles, alignItems: `stretch` }}>
                <span>
                  {item.title}
                </span>
                <span className="delete" data-swapy-no-drag onClick={() => {
                  setItems(items.filter(i => i.id !== item.id))
                }}></span>
              </div>
            }
          </div>
        ))}
      </div>
      <div className="item item--add" onClick={() => {
        const newItem: Item = { id: `${id}`, title: `${id}` }
        setItems([...items, newItem])
        id++
      }}>+</div>
    </div>
  )
}

export default SwapyExample2;