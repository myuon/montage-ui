import { useState } from "react";
import { nanoid } from "nanoid";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./App.css";
import JSZip from "jszip";

interface ImageData {
  id: string;
  src: string;
}

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
  const [images, setImages] = useState<ImageData[]>([]);
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
        return new Promise<ImageData>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({ id: nanoid(), src: reader.result as string });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      })
    ).then((imageDataArray) =>
      setImages((prev) => [...prev, ...imageDataArray])
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDownload = async () => {
    if (images.length === 0) return;

    const zip = new JSZip();
    const promises = images.map(async (image, index) => {
      const response = await fetch(image.src);
      const blob = await response.blob();
      zip.file(`image-${index + 1}.jpg`, blob);
    });

    await Promise.all(promises);
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "images.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          padding: "12px 24px",
          zIndex: 1000,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 600,
            color: "#205493",
          }}
        >
          Montage UI
        </h1>
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
      <div style={{ marginTop: 88, padding: "32px 48px 0" }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((image) => image.id)}
            strategy={rectSortingStrategy}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 24,
                width: "100%",
              }}
            >
              {images.map((image, idx) => (
                <SortableImage
                  key={image.id}
                  id={image.id}
                  src={image.src}
                  index={idx}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      {images.length > 0 && (
        <div
          style={{
            marginTop: 32,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleDownload}
            style={{
              padding: "8px 16px",
              backgroundColor: "#205493",
              color: "white",
              border: "none",
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
            ZIPファイルでダウンロード
          </button>
        </div>
      )}
    </>
  );
}

export default App;
