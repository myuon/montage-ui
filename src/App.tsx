import { useState } from "react";
import "./App.css";
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { ReactPlugin } from "@stagewise-plugins/react";

function App() {
  const [images, setImages] = useState<string[]>([]);

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

  return (
    <>
      <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
      <div style={{ marginBottom: 16 }}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 16,
        }}
      >
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`uploaded-${idx}`}
            style={{
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 8,
              boxShadow: "0 2px 8px #0001",
            }}
          />
        ))}
      </div>
    </>
  );
}

export default App;
