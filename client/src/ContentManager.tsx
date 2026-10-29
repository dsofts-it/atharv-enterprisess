import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, patch, post } from "./api";
import { Loading, ErrorState } from "./components";

export function MediaUpload({
  onUploaded,
}: {
  onUploaded: (id: string) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <details>
      <summary>Upload a marketing photograph</summary>
      <p>
        Only public marketing images. Do not upload medical records or private
        patient images. Consent and usage rights are required. PNG, JPEG or
        WebP, maximum 1.5 MB; files persist in MongoDB.
      </p>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          const values = new FormData(event.currentTarget);
          const file = values.get("image") as File;
          if (!file?.size || file.size > 1500000) {
            setError("Select an image smaller than 1.5 MB");
            return;
          }
          setBusy(true);
          setError("");
          try {
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () =>
                resolve(String(reader.result).split(",")[1]);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            const row = await post("/admin/media", {
              base64,
              alt: {
                en: values.get("alt-en"),
                hi: values.get("alt-hi"),
                mr: values.get("alt-mr"),
              },
              illustrative: values.get("illustrative") === "on",
              consent: values.get("consent") === "on",
            });
            onUploaded(row.id);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Image file
          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp"
            required
          />
        </label>
        {["en", "hi", "mr"].map((lang) => (
          <label key={lang}>
            Image description ({lang})
            <input name={`alt-${lang}`} required maxLength={300} />
          </label>
        ))}
        <label className="checkbox">
          <input name="illustrative" type="checkbox" />
          AI-generated / illustrative image
        </label>
        <label className="checkbox">
          <input name="consent" type="checkbox" required />I have the rights and
          any necessary written consent to publish this image.
        </label>
        <button className="button" disabled={busy}>
          {busy ? "Uploading…" : "Upload image"}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </details>
  );
}
export default function ContentManager() {
  const query = useQuery({
    queryKey: ["admin-content"],
    queryFn: () => api<any[]>("/admin/content"),
  });
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [imageId, setImageId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <section className="paper">
      <BusinessContactEditor />
      <h2>Website content</h2>
      <p>
        Manage banners, about content, FAQs, approved testimonials, gallery
        photos, video links, family guides and contact information. Drafts are
        private. All three languages are required for titles.
      </p>
      <button
        className="button"
        onClick={() => {
          setSelected({
            kind: "blog",
            slug: "",
            title: {},
            body: {},
            sortOrder: 0,
          });
          setImageId("");
          setError("");
        }}
      >
        Add content
      </button>
      {query.isLoading ? (
        <Loading />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : (
        query.data?.map((row) => (
          <div key={row._id} className="list-row">
            <div>
              <strong>{row.title.en}</strong>
              <p>
                {row.kind} ·{" "}
                {row.published && row.approved ? "Published" : "Draft"}
              </p>
            </div>
            <button
              className="button secondary small"
              onClick={() => {
                setSelected(row);
                setImageId(row.imageId || "");
                setError("");
              }}
            >
              Edit content
            </button>
          </div>
        ))
      )}
      {selected && (
        <dialog
          className="hc-admin-dialog"
          ref={(node) => {
            if (node && !node.open) node.showModal();
          }}
          onCancel={() => setSelected(null)}
        >
          <button
            className="button secondary small"
            autoFocus
            onClick={() => setSelected(null)}
          >
            Close editor
          </button>
          <h2>Content editor</h2>
          <MediaUpload onUploaded={(id) => setImageId(id)} />
          <form
            key={selected._id || "new"}
            onSubmit={async (event) => {
              event.preventDefault();
              if (busy) return;
              setBusy(true);
              setError("");
              const v: any = Object.fromEntries(
                new FormData(event.currentTarget),
              );
              const data = {
                kind: v.kind,
                slug: v.slug,
                title: {
                  en: v["title-en"],
                  hi: v["title-hi"],
                  mr: v["title-mr"],
                },
                body: { en: v["body-en"], hi: v["body-hi"], mr: v["body-mr"] },
                imageId: imageId || null,
                externalUrl: v.externalUrl || "",
                approved: v.approved === "on",
                published: v.published === "on",
                sortOrder: Number(v.sortOrder),
              };
              try {
                if (selected._id)
                  await patch(`/admin/content/${selected._id}`, data);
                else await post("/admin/content", data);
                await qc.invalidateQueries({ queryKey: ["admin-content"] });
                await qc.invalidateQueries({ queryKey: ["public-content"] });
                setSelected(null);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Content type
              <select
                name="kind"
                aria-label="Content type"
                defaultValue={selected.kind}
              >
                {[
                  "banner",
                  "about",
                  "faq",
                  "testimonial",
                  "gallery",
                  "video",
                  "blog",
                  "contact",
                ].map((kind) => (
                  <option key={kind}>{kind}</option>
                ))}
              </select>
            </label>
            <label>
              URL slug
              <input
                name="slug"
                defaultValue={selected.slug}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                required
                maxLength={100}
              />
            </label>
            {["en", "hi", "mr"].map((lang) => (
              <fieldset key={lang}>
                <legend>
                  {lang === "en"
                    ? "English"
                    : lang === "hi"
                      ? "हिन्दी"
                      : "मराठी"}
                </legend>
                <label>
                  Title
                  <input
                    name={`title-${lang}`}
                    required
                    maxLength={300}
                    defaultValue={selected.title[lang]}
                  />
                </label>
                <label>
                  Body
                  <textarea
                    rows={5}
                    name={`body-${lang}`}
                    maxLength={10000}
                    defaultValue={selected.body[lang]}
                  />
                </label>
              </fieldset>
            ))}
            <label>
              Uploaded image ID
              <input
                value={imageId}
                onChange={(e) => setImageId(e.target.value)}
                pattern="[a-fA-F0-9]{24}"
              />
            </label>
            <label>
              External video / contact link (HTTPS)
              <input
                name="externalUrl"
                type="url"
                defaultValue={selected.externalUrl}
              />
            </label>
            <label>
              Display order
              <input
                name="sortOrder"
                type="number"
                min={0}
                max={1000}
                defaultValue={selected.sortOrder}
              />
            </label>
            <label className="checkbox">
              <input
                name="approved"
                type="checkbox"
                defaultChecked={selected.approved}
              />
              I verified this content. Reviews are genuine and approved;
              clinical educational content has been reviewed appropriately.
            </label>
            <label className="checkbox">
              <input
                name="published"
                type="checkbox"
                defaultChecked={selected.published}
              />
              Publish on the website
            </label>
            {error && (
              <p role="alert" className="notice error">
                {error}
              </p>
            )}
            <button className="button" disabled={busy}>
              {busy ? "Saving…" : "Save content"}
            </button>
          </form>
        </dialog>
      )}
    </section>
  );
}

function BusinessContactEditor() {
  const query = useQuery({
    queryKey: ["business-settings"],
    queryFn: () => api<any>("/admin/business-settings"),
  });
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <details>
      <summary>Business contact details and map</summary>
      <p>
        Enter verified public business contacts only. Empty phone or WhatsApp
        fields hide those buttons.
      </p>
      {query.error ? (
        <ErrorState error={query.error} />
      ) : (
        query.data && (
          <form
            key={query.data.updatedAt || "initial"}
            onSubmit={async (event) => {
              event.preventDefault();
              if (busy) return;
              setBusy(true);
              setMessage("");
              const values: any = Object.fromEntries(
                new FormData(event.currentTarget),
              );
              try {
                await patch("/admin/business-settings", {
                  ...values,
                  verified: values.verified === "on",
                });
                await qc.invalidateQueries({ queryKey: ["settings"] });
                await qc.invalidateQueries({ queryKey: ["business-settings"] });
                setMessage("Business contact details saved.");
              } catch (error) {
                setMessage((error as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {[
              ["phone", "Phone (+91 or 10 digits)", "tel"],
              ["whatsapp", "WhatsApp (+91 or 10 digits)", "tel"],
              ["email", "Official email", "email"],
              ["location", "Service location", "text"],
              ["address", "Actual business address", "text"],
              ["mapUrl", "Verified map link (HTTPS)", "url"],
            ].map(([name, label, type]) => (
              <label key={name}>
                {label}
                <input
                  name={name}
                  type={type}
                  required={name === "location"}
                  defaultValue={query.data[name] || ""}
                />
              </label>
            ))}
            <label className="checkbox">
              <input type="checkbox" name="verified" required />I verified these
              public business details.
            </label>
            <button className="button" disabled={busy}>
              {busy ? "Saving…" : "Save business contacts"}
            </button>
            {message && <p role="status">{message}</p>}
          </form>
        )
      )}
    </details>
  );
}
