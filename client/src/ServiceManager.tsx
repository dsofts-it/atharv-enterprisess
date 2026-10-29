import { MediaUpload } from "./ContentManager";
import { serviceContent } from "./serviceContent";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, patch, post } from "./api";
import { ErrorState, Loading } from "./components";
import { serviceDrafts } from "../../shared/serviceDrafts";
export default function ServiceManager() {
  const query = useQuery({
    queryKey: ["admin-services"],
    queryFn: () => api<any[]>("/admin/services"),
  });
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const values: any = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const data = {
        name: values.name,
        summary: values.summary,
        description: values.description,
        image: values.image,
        includes: String(values.includes || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        excludes: String(values.excludes || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        active: values.active === "on",
        featured: values.featured === "on",
        sortOrder: Number(values.sortOrder),
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
        translations: {
          hi: {
            name: values["name-hi"],
            summary: values["summary-hi"],
            description: values["description-hi"],
          },
          mr: {
            name: values["name-mr"],
            summary: values["summary-mr"],
            description: values["description-mr"],
          },
        },
      };
      if (selected._id) await patch(`/admin/services/${selected._id}`, data);
      else
        await post("/admin/services", {
          slug: values.slug,
          name: values.name,
          tag: "CARE SERVICE",
          summary: values.summary,
          description: values.description,
          includes: data.includes,
          excludes: data.excludes,
          clinical: values.clinical === "on",
          requiredQualification:
            values.qualification === "none" ? undefined : values.qualification,
          image: values.image,
          translations: data.translations,
        });
      await qc.invalidateQueries({ queryKey: ["admin-services"] });
      await qc.invalidateQueries({ queryKey: ["services"] });
      setSelected(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="paper">
      <h2>Services and publication</h2>
      <p>
        New services are saved as inactive drafts. Verify business capability,
        qualifications and service scope before enabling a service. The original
        six services remain unchanged.
      </p>
      <button
        className="button"
        onClick={() =>
          setSelected({
            slug: "",
            name: "",
            summary: "",
            description: "",
            image: "home-nursing",
            sortOrder: 0,
          })
        }
      >
        Add service draft
      </button>
      {query.isLoading ? (
        <Loading />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : (
        query.data?.map((row) => (
          <div className="list-row" key={row._id}>
            <div>
              <strong>{row.name}</strong>
              <p>
                {row.active ? "Published" : "Draft · not publicly available"} ·
                Order {row.sortOrder || 0}
                {row.featured ? " · Featured" : ""}
              </p>
            </div>
            <button
              className="button secondary small"
              onClick={() => setSelected(row)}
            >
              Edit service
            </button>
          </div>
        ))
      )}
      <details>
        <summary>Suggested service categories</summary>
        <p>These are suggestions, not claims that Atharv offers them.</p>
        {serviceDrafts
          .filter(([slug]) => !query.data?.some((s) => s.slug === slug))
          .map(([slug, name, clinical]) => (
            <div className="list-row" key={slug}>
              <span>{name}</span>
              <button
                className="button secondary small"
                onClick={() =>
                  setSelected({
                    slug,
                    name,
                    clinical,
                    image: slug,
                    summary: "",
                    description: "",
                    sortOrder: 0,
                  })
                }
              >
                Prepare draft
              </button>
            </div>
          ))}
      </details>
      {selected && (
        <dialog
          className="hc-admin-dialog"
          ref={(node) => {
            if (node && !node.open) node.showModal();
          }}
          onCancel={() => setSelected(null)}
        >
          <button
            autoFocus
            className="button secondary small"
            onClick={() => setSelected(null)}
          >
            Close editor
          </button>
          <h2>{selected._id ? "Edit service" : "Create unpublished draft"}</h2>
          <MediaUpload
            onUploaded={(id) =>
              setSelected({ ...selected, image: `media-${id}` })
            }
          />
          <form
            onSubmit={save}
            key={(selected._id || selected.slug) + selected.image}
          >
            {!selected._id && (
              <label>
                URL slug
                <input
                  name="slug"
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  defaultValue={selected.slug}
                />
              </label>
            )}
            <label>
              Service name
              <input
                name="name"
                required
                minLength={2}
                maxLength={100}
                defaultValue={selected.name}
              />
            </label>
            <label>
              Short description
              <textarea
                name="summary"
                required
                minLength={10}
                maxLength={300}
                defaultValue={selected.summary}
              />
            </label>
            <label>
              Detailed scope
              <textarea
                name="description"
                required
                minLength={20}
                maxLength={2000}
                defaultValue={selected.description}
              />
            </label>
            <label>
              Included activities (one per line)
              <textarea
                name="includes"
                defaultValue={selected.includes?.join("\n") || ""}
                maxLength={1200}
              />
            </label>
            <label>
              Outside service scope (one per line)
              <textarea
                name="excludes"
                defaultValue={
                  selected.excludes?.join("\n") || "Emergency treatment"
                }
                maxLength={1200}
              />
            </label>
            {(["hi", "mr"] as const).map((lang, index) => (
              <fieldset key={lang}>
                <legend>{lang === "hi" ? "हिन्दी" : "मराठी"}</legend>
                <label>
                  Service name
                  <input
                    name={`name-${lang}`}
                    required
                    minLength={2}
                    maxLength={100}
                    defaultValue={
                      selected.translations?.[lang]?.name ||
                      serviceContent[selected.slug]?.name[index + 1]
                    }
                  />
                </label>
                <label>
                  Summary
                  <textarea
                    name={`summary-${lang}`}
                    required
                    minLength={10}
                    maxLength={300}
                    defaultValue={
                      selected.translations?.[lang]?.summary ||
                      serviceContent[selected.slug]?.summary[index + 1]
                    }
                  />
                </label>
                <label>
                  Detailed scope
                  <textarea
                    name={`description-${lang}`}
                    required
                    minLength={20}
                    maxLength={2000}
                    defaultValue={
                      selected.translations?.[lang]?.description ||
                      serviceContent[selected.slug]?.summary[index + 1]
                    }
                  />
                </label>
              </fieldset>
            ))}
            <label>
              Service photograph
              <select
                name="image"
                defaultValue={
                  selected.image ||
                  ({ "24-hour-care": "day-night-care" } as any)[
                    selected.slug
                  ] ||
                  selected.slug
                }
              >
                {selected.image?.startsWith("media-") && (
                  <option value={selected.image}>Uploaded photograph</option>
                )}
                {[
                  "home-nursing",
                  "elderly-care",
                  "patient-attendant",
                  "post-operative-care",
                  "day-night-care",
                  "bedridden-care",
                  ...serviceDrafts.map((s) => s[0]),
                ].map((slug) => (
                  <option key={slug}>{slug}</option>
                ))}
              </select>
            </label>
            {selected._id ? (
              <>
                <label>
                  Sort order
                  <input
                    name="sortOrder"
                    type="number"
                    min={0}
                    max={1000}
                    defaultValue={selected.sortOrder || 0}
                  />
                </label>
                <label>
                  SEO title
                  <input
                    name="seoTitle"
                    maxLength={100}
                    defaultValue={selected.seoTitle}
                  />
                </label>
                <label>
                  SEO description
                  <textarea
                    name="seoDescription"
                    maxLength={300}
                    defaultValue={selected.seoDescription}
                  />
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={selected.featured}
                  />
                  Featured service
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={selected.active}
                  />
                  The business offers this service; publish it
                </label>
              </>
            ) : (
              <>
                <label>
                  Required clinical qualification
                  <select
                    name="qualification"
                    defaultValue={
                      selected.slug === "physiotherapy"
                        ? "physiotherapist"
                        : selected.clinical
                          ? "nurse"
                          : "none"
                    }
                  >
                    <option value="none">Non-clinical support</option>
                    <option value="nurse">Nurse</option>
                    <option value="physiotherapist">Physiotherapist</option>
                  </select>
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="clinical"
                    defaultChecked={selected.clinical}
                  />
                  Requires a qualified clinical professional
                </label>
              </>
            )}
            {error && (
              <p role="alert" className="notice error">
                {error}
              </p>
            )}
            <button className="button" disabled={busy}>
              {busy ? "Saving…" : selected._id ? "Save service" : "Save draft"}
            </button>
          </form>
        </dialog>
      )}
    </section>
  );
}
