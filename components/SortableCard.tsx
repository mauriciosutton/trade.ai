"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardPlacement } from "@/types";

interface SortableCardProps {
  cardPlacement: CardPlacement;
  onClick: () => void;
}

export default function SortableCard({
  cardPlacement,
  onClick,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cardPlacement.id });

  const post = cardPlacement.posts;
  if (!post) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded-md shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-200"
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-semibold text-blue-600">
          r/{post.subreddit}
        </span>
        {post.upvotes !== null && (
          <span className="text-xs text-gray-500">▲ {post.upvotes}</span>
        )}
      </div>
      <p className="text-sm text-gray-800 line-clamp-3">
        {post.post_summary || post.original_post || "No summary available"}
      </p>
    </div>
  );
}

