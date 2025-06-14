import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./App.css";

interface SortableImageProps {
  id: string;
  src: string;
  index: number;
}

function SortableImage({ id, src, index }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img
        src={src}
        alt={`uploaded-${index}`}
        style={{
          width: "100%",
          height: 120,
          objectFit: "cover",
          borderRadius: 8,
          boxShadow: "0 2px 8px #0001",
          cursor: "grab",
        }}
      />
    </div>
  );
}

function App() {
  const [images, setImages] = useState<string[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    ).then((imgs) => setImages((prev) => [...prev, ...imgs]));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(
          (_, index) => `image-${index}` === active.id
        );
        const newIndex = items.findIndex(
          (_, index) => `image-${index}` === over?.id
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <>
      <h1 style={{ marginBottom: 32 }}>Montage UI</h1>
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "inline-block",
            padding: "8px 16px",
            backgroundColor: "#205493",
            color: "white",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#163d66";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#205493";
          }}
        >
          画像をアップロード
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </label>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((_, index) => `image-${index}`)}
          strategy={verticalListSortingStrategy}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}
          >
            {images.map((src, idx) => (
              <SortableImage
                key={`image-${idx}`}
                id={`image-${idx}`}
                src={src}
                index={idx}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}

export default App;
