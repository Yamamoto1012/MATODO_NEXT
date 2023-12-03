"use clinet"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    UniqueIdentifier,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import SideBar from "./SideBar";
import { useState } from "react";
import MatrixArea from "./MatrixArea";
import AddTask from "./AddTask";

export default function DragController() {
    const [tasks, setTasks] = useState({
        // sidebarのtasklist
        prepare: ["A","B","C","D"],
        // MatrixAreaのtasklist
        required: ["B"],
        effective: ["1"],
        illusion: ["2"],
        waste: ["3"],
    });

    // DragOverlay用のid
    const [activeId, setActiveId] = useState("");

    // ドラッグ開始、移動、終了などにどのような入力を許可するかを決めるprops
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // 各コンテナ取得関数
    const findContainer = (id) => {
        if (id in tasks) {
            return id;
        }
        return Object.keys(tasks).find((key)=>
            tasks[key].includes(id)
        )
    }

    // ドラッグ開始に発火する関数
    const handleDragStart = (event) => {
        const { active } = event;
        // ドラッグしたリソースのid
        const id = active.id.toString();
        setActiveId(id);
    }

    // ドラッグ可能なアイテムがドロップ可能なコンテナの上に移動時に発火する関数
    const handleDragOver = (event) => {
        const { active, over } = event;
        // ドラッグしたリソースのid
        const id = active.id.toString();
        // ドロップした場所に合ったリソースのid
        const overId = over?.id;

        if (!overId) return;

        //ドラッグ、ドロップ時のコンテナ取得
        //required,effective,illusion,wasteのいずれかを持つ
        const activeContainer = findContainer(id);
        const overContainer = findContainer(over?.Id);

        if(
            !activeContainer ||
            !overContainer ||
            activeContainer !== overContainer
        ) {
            return;
        }

        setTasks((prev) => {
            // 移動元のコンテナの要素配列を取得
            const activeItems = prev[activeContainer];
            // 移動先のコンテナの要素配列を取得
            const overItems = prev[overContainer];

            // 配列のインデックス取得
            const activeIndex = activeItems.indexOf(id);
            const overIndex = overItems.indexOf(overId.toString());

            let newIndex;
            if (overId in prev) {
                // We're at the root droppable of a container
                newIndex = overItems.length + 1;
            } else {
                const isBelowLastItem = over && overIndex === overItems.length - 1;

                const modifier = isBelowLastItem ? 1 : 0;

                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    // itemのところをtaskに変更しなければいけない可能性あり
                    ...prev[activeContainer].filter((task) => task !== active.id),
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    tasks[activeContainer][activeIndex],
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length),
                ],
            };
        });
    };

    // ドラッグ終了したときに発火する関数
    const handleDragEnd = (e) => {
        const { active, over } = e;
        // ドラッグしたリソースのid
        const id = active.id.toString();
        //ドロップした場所にあったリソースのid
        const overId = over?.id;

        if (!overId) return;

        // ドラッグ、ドロップ時のコンテナ取得
        // container1,container2,container3,container4のいずれかを持つ
        const activeContainer = findContainer(id);
        const overContainer = findContainer(over?.id);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer !== overContainer
        ) {
            return;
        }

        // 配列のインデックス取得
        const activeIndex = tasks[activeContainer].indexOf(id);
        const overIndex = tasks[overContainer].indexOf(overId.toString());

        if (activeIndex !== overIndex) {
            setTasks((tasks) => ({
                ...tasks,
                [overContainer]: arrayMove(
                    tasks[overContainer],
                    activeIndex,
                    overIndex
                ),
            }));
        }
        setActiveId(undefined);
    }
    console.log(activeId)
    return(
        <div className="bg-[#393E4F] h-[100vh] w-screen flex">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <SideBar
                    id="prepare"
                    tasks={tasks.prepare}
                    label="prepare"
                />
        
                < DragOverlay>{activeId ? <TaskCard id={activeId} /> : null}</DragOverlay>
            </DndContext>
            <div className="relative shadow-lg h-[100vh] w-[70vw] md:w-[85vw] flex flex-col items-center bg-[#222831]">
                <MatrixArea />
                <div className="absolute bottom-12 w-full items-center justify-center flex">
                    <AddTask />
                </div>
            </div>
        </div>
    )
}