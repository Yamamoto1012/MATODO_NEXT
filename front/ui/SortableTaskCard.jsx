"use client"
import TaskCard from "./TaskCard";
import { useSortable } from "@dnd-kit/sortable";

export default function SortableTaskCard({ id }) {
    const { attributes, listeners, setNodeRef } = useSortable({
        id,
    });

    return(
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
        >
            <TaskCard id={id}/>
        </div>
    )
}