import {
  ImagePlus,
  Upload,
  ExternalLink,
  Pencil,
  Trash2,
  Images,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiUrl, post, patch } from "./api";

export default function GalleryManager() {
  const query = useQuery({
    queryKey: ["admin-content"],
    queryFn: () => api<any[]>("/admin/content"),
  });
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState("");
  const photos = query.data?.filter((row) => row.kind === "gallery") || [];
  const refresh = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin-content"] }),
      qc.invalidateQueries({ queryKey: ["public-content"] }),
    ]);
  };
  return (
    <section className="gallery-manager">
      <header className="gallery-manager-heading">
        <div>
          <span className="gallery-kicker">
            <Images size={16} /> YOUR WEBSITE PHOTOS
          </span>
          <h2>Photo gallery</h2>
          <p>Upload a photo. See it on your website.</p>
        </div>
        <a
          className="button secondary"
          href="/gallery"
          target="_blank"
          rel="noopener noreferrer"
        >
          View gallery <ExternalLink size={16} />
        </a>
      </header>
      <form
        className="gallery-upload"
        id="gallery-upload"
        key={editing?._id || "new"}
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          const form = event.currentTarget;
          const data = new FormData(form);
          const file = data.get("photo") as File;
          if (!file?.size || file.size > 1500000) {
            setMessage("Choose a PNG, JPEG or WebP photo smaller than 1.5 MB.");
            return;
          }
          setBusy(true);
          setMessage("");
          try {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve(String(reader.result).split(",")[1]);
              reader.onerror = () =>
                reject(new Error("Could not read this photo."));
              reader.readAsDataURL(file);
            });
            const title = {
              en: "Gallery photo",
              hi: "गैलरी फोटो",
              mr: "गॅलरी फोटो",
            };
            const media = await post("/admin/media", {
              base64,
              alt: title,
              illustrative: false,
            });
            const content = {
              kind: "gallery",
              slug: editing?.slug || `photo-${crypto.randomUUID()}`,
              title,
              body: { en: "", hi: "", mr: "" },
              imageId: media.id,
              approved: true,
              published: true,
              sortOrder: editing?.sortOrder || 0,
            };
            if (editing) await patch(`/admin/content/${editing._id}`, content);
            else await post("/admin/content", content);
            setEditing(null);
            setPreview("");
            form.reset();
            await refresh();
            setMessage(editing ? "Photo updated." : "Photo uploaded.");
          } catch (error) {
            setMessage((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label
          className={`gallery-file-picker ${preview ? "has-preview" : ""}`}
        >
          {preview ? (
            <img src={preview} alt="Selected photo preview" />
          ) : (
            <span className="gallery-upload-icon">
              <ImagePlus size={28} />
            </span>
          )}
          <span>
            <strong>
              {editing ? "Choose replacement photo" : "Choose photo"}
            </strong>
            <small>JPG, PNG or WebP · up to 1.5 MB</small>
          </span>
          <input
            name="photo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview("");
              setMessage("");
              if (!file) return;
              if (
                file.size > 1500000 ||
                !["image/png", "image/jpeg", "image/webp"].includes(file.type)
              ) {
                event.target.value = "";
                setMessage(
                  "Choose a PNG, JPEG or WebP photo smaller than 1.5 MB.",
                );
                return;
              }
              const reader = new FileReader();
              reader.onload = () => setPreview(String(reader.result));
              reader.readAsDataURL(file);
            }}
          />
        </label>
        <button className="button" disabled={busy || !preview}>
          <Upload size={18} />
          {busy ? "Uploading…" : editing ? "Save photo" : "Upload photo"}
        </button>
        {editing && (
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            onClick={() => {
              setEditing(null);
              setPreview("");
            }}
          >
            Cancel edit
          </button>
        )}
      </form>
      {message && (
        <p className="gallery-feedback" role="status">
          {message}
        </p>
      )}
      {query.isLoading && <p>Loading photos…</p>}
      {query.error && <p role="alert">{query.error.message}</p>}
      <div className="gallery-collection-heading">
        <h3>Your photos</h3>
        <span>
          {photos.length} {photos.length === 1 ? "photo" : "photos"}
        </span>
      </div>
      <div className="owner-gallery-grid">
        {photos.map((row) => (
          <article className="gallery-photo-card" key={row._id}>
            <div className="gallery-photo-frame">
              {row.imageId && (
                <img
                  src={apiUrl(`/public/media/${row.imageId}`)}
                  alt={row.title.en}
                />
              )}
            </div>
            <div className="gallery-photo-info">
              <span className="gallery-photo-status">
                <Check size={14} />
                {row.published && row.approved ? "On your website" : "Hidden"}
              </span>
            </div>
            <div className="gallery-photo-actions">
              <button
                type="button"
                className="button secondary small"
                disabled={busy}
                onClick={() => {
                  setEditing(row);
                  setPreview("");
                  setMessage("");
                  document
                    .getElementById("gallery-upload")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                <Pencil size={15} /> Edit photo
              </button>
              <button
                className="button secondary small gallery-delete"
                disabled={busy}
                onClick={async () => {
                  if (
                    !window.confirm(
                      `Delete “${row.title.en}” from the website gallery?`,
                    )
                  )
                    return;
                  setBusy(true);
                  setMessage("");
                  try {
                    await api(`/admin/content/${row._id}`, {
                      method: "DELETE",
                    });
                    await refresh();
                    setMessage("Photo removed from the gallery.");
                  } catch (error) {
                    setMessage((error as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Trash2 size={15} /> Delete photo
              </button>
            </div>
          </article>
        ))}
      </div>
      {query.data && !query.data.some((row) => row.kind === "gallery") && (
        <div className="gallery-empty">
          <Images size={32} />
          <h3>Your gallery starts here</h3>
          <p>Choose your first photo above and upload it.</p>
        </div>
      )}
    </section>
  );
}
