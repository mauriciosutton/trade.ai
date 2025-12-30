"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Board, List, CardPlacement, Post } from "@/types";
import SortableList from "./SortableList";
import SortableCard from "./SortableCard";
import PostModal from "./PostModal";

export default function Boards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cardPlacements, setCardPlacements] = useState<CardPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newBoardName, setNewBoardName] = useState("");
  const [newListName, setNewListName] = useState("");
  const [showNewBoardForm, setShowNewBoardForm] = useState(false);
  const [showNewListForm, setShowNewListForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchBoards = async () => {
    try {
      const response = await fetch("/api/boards");
      const data = await response.json();
      setBoards(data.boards || []);
      if (data.boards && data.boards.length > 0 && !selectedBoard) {
        setSelectedBoard(data.boards[0]);
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardDetails = async (boardId: string) => {
    try {
      const response = await fetch(`/api/boards/${boardId}`);
      const data = await response.json();
      setLists(data.lists || []);
      setCardPlacements(data.cardPlacements || []);
    } catch (error) {
      console.error("Failed to fetch board details:", error);
    }
  };

  useEffect(() => {
    fetchBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedBoard) {
      fetchBoardDetails(selectedBoard.id);
    }
  }, [selectedBoard]);

  const createBoard = async () => {
    if (!newBoardName.trim()) return;

    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBoardName }),
      });
      const data = await response.json();
      setBoards([...boards, data.board]);
      setSelectedBoard(data.board);
      setNewBoardName("");
      setShowNewBoardForm(false);
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  const createList = async () => {
    if (!newListName.trim() || !selectedBoard) return;

    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId: selectedBoard.id,
          name: newListName,
          position: lists.length,
        }),
      });
      const data = await response.json();
      setLists([...lists, data.list]);
      setNewListName("");
      setShowNewListForm(false);
    } catch (error) {
      console.error("Failed to create list:", error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !selectedBoard) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dragging a card
    const activePlacement = cardPlacements.find((cp) => cp.id === activeId);

    if (activePlacement) {
      // Dragging a card
      const overList = lists.find((l) => l.id === overId);
      const overPlacement = cardPlacements.find((cp) => cp.id === overId);

      if (overList) {
        // Dropped on a list
        await updateCardPlacement(activePlacement, overList.id, 0);
      } else if (overPlacement) {
        // Dropped on another card
        const targetListId = overPlacement.list_id;
        await updateCardPlacement(activePlacement, targetListId, 0);
      }
    } else {
      // Dragging a list
      const oldIndex = lists.findIndex((l) => l.id === activeId);
      const newIndex = lists.findIndex((l) => l.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newLists = arrayMove(lists, oldIndex, newIndex);
        setLists(newLists);
        // Update positions in database
        await Promise.all(
          newLists.map((list, index) =>
            fetch(`/api/lists/${list.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ position: index }),
            }).catch(console.error)
          )
        );
      }
    }
  };

  const updateCardPlacement = async (
    placement: CardPlacement,
    newListId: string,
    newPosition: number
  ) => {
    try {
      const response = await fetch("/api/card-placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId: selectedBoard!.id,
          listId: newListId,
          postId: placement.post_id,
          position: newPosition,
        }),
      });

      if (response.ok) {
        await fetchBoardDetails(selectedBoard!.id);
      }
    } catch (error) {
      console.error("Failed to update card placement:", error);
    }
  };

  const getCardsForList = (listId: string) => {
    return cardPlacements
      .filter((cp) => cp.list_id === listId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  };

  const getActiveCard = () => {
    if (!activeId) return null;
    const placement = cardPlacements.find((cp) => cp.id === activeId);
    return placement?.posts || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading boards...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Boards</h1>
          <p className="text-gray-600 mt-2">
            Organize problems into Trello-style boards
          </p>
        </div>
        <div className="flex gap-2">
          {boards.length > 0 && (
            <select
              value={selectedBoard?.id || ""}
              onChange={(e) => {
                const board = boards.find((b) => b.id === e.target.value);
                setSelectedBoard(board || null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowNewBoardForm(!showNewBoardForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + New Board
          </button>
        </div>
      </div>

      {showNewBoardForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Board name"
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md mr-2"
            onKeyPress={(e) => e.key === "Enter" && createBoard()}
          />
          <button
            onClick={createBoard}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
          >
            Create
          </button>
          <button
            onClick={() => {
              setShowNewBoardForm(false);
              setNewBoardName("");
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      )}

      {selectedBoard ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            <SortableContext
              items={lists.map((l) => l.id)}
              strategy={horizontalListSortingStrategy}
            >
              {lists.map((list) => (
                <SortableList
                  key={list.id}
                  list={list}
                  cards={getCardsForList(list.id)}
                  onCardClick={(post) => setSelectedPost(post)}
                />
              ))}
            </SortableContext>

            <div className="min-w-[280px]">
              {showNewListForm ? (
                <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="List name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                    onKeyPress={(e) => e.key === "Enter" && createList()}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={createList}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowNewListForm(false);
                        setNewListName("");
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewListForm(true)}
                  className="w-full min-w-[280px] px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                >
                  + Add another list
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeId && getActiveCard() && (
              <div className="bg-white rounded-lg shadow-xl p-4 w-64 border border-gray-200">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {getActiveCard()?.post_summary || "No summary"}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No boards found</p>
          <p className="text-gray-400 mt-2">
            Create your first board to get started
          </p>
        </div>
      )}

      <PostModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}

