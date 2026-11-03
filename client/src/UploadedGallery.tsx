import { useState } from "react";
import { Images, Maximize2, X } from "lucide-react";
import { apiUrl } from "./api";
import { usePublicContent } from "./PublicContent";
import { useLanguage } from "./i18n";
import { ErrorState, Loading } from "./components";

export default function UploadedGallery() {
  const { data = [], isLoading, error } = usePublicContent();
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<any>(null);
  const photos = data.filter(
    (row) => row.kind === "gallery" && row.imageId?._id,
  );
  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  if (!photos.length)
    return (
      <div className="uploaded-gallery-empty">
        <Images size={32} />
        <h2>
          {t([
            "New photos coming soon",
            "नई तस्वीरें जल्द आ रही हैं",
            "नवीन छायाचित्रे लवकरच येत आहेत",
          ])}
        </h2>
        <p>
          {t([
            "Our latest photos will appear here when they are uploaded.",
            "अपलोड होने पर हमारी नई तस्वीरें यहाँ दिखाई देंगी।",
            "अपलोड केल्यानंतर आमची नवीन छायाचित्रे येथे दिसतील.",
          ])}
        </p>
      </div>
    );
  return (
    <>
      <div className="uploaded-photo-grid">
        {photos.map((photo, index) => (
          <button
            className="uploaded-photo-tile"
            key={photo._id}
            onClick={() => setSelected(photo)}
            aria-label={`${t(["View photo", "तस्वीर देखें", "छायाचित्र पहा"])} ${index + 1}`}
          >
            <img
              src={apiUrl(`/public/media/${photo.imageId._id}`)}
              alt={
                photo.imageId.alt?.[language] ||
                photo.title?.[language] ||
                t(["Gallery photo", "गैलरी फोटो", "गॅलरी फोटो"])
              }
              loading={index < 3 ? "eager" : "lazy"}
              decoding="async"
              width={800}
              height={600}
            />
            <span className="uploaded-photo-expand" aria-hidden="true">
              <Maximize2 size={18} />
            </span>
          </button>
        ))}
      </div>
      {selected && (
        <dialog
          className="uploaded-photo-lightbox"
          aria-label={t([
            "Photo preview",
            "तस्वीर का पूर्वावलोकन",
            "छायाचित्र पूर्वावलोकन",
          ])}
          ref={(node) => {
            if (node && !node.open) node.showModal();
          }}
          onCancel={() => setSelected(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <button
            className="uploaded-photo-close"
            autoFocus
            onClick={() => setSelected(null)}
            aria-label={t([
              "Close image",
              "चित्र बंद करें",
              "छायाचित्र बंद करा",
            ])}
          >
            <X size={24} />
          </button>
          <img
            src={apiUrl(`/public/media/${selected.imageId._id}`)}
            alt={
              selected.imageId.alt?.[language] ||
              t(["Gallery photo", "गैलरी फोटो", "गॅलरी फोटो"])
            }
          />
        </dialog>
      )}
    </>
  );
}
