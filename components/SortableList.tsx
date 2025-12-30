"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { List, CardPlacement } from "@/types";
import SortableCard from "./SortableCard";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface SortableListProps {
  list: List;
  cards: CardPlacement[];
  onCardClick: (post: any) => void;
}

export default function SortableList({
  list,
  cards,
  onCardClick,
}: SortableListProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-100 rounded-lg p-4 min-w-[280px] flex flex-col"
    >
      <div
        {...attributes}
        {...listeners}
        className="font-semibold text-gray-900 mb-3 cursor-grab active:cursor-grabbing"
      >
        {list.name}
      </div>
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-2 min-h-[100px]">
          {cards.map((cardPlacement) => (
            <SortableCard
              key={cardPlacement.id}
              cardPlacement={cardPlacement}
              onClick={() => onCardClick(cardPlacement.posts)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}


