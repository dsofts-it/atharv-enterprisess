import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiUrl, patch, post } from "./api";
import { ErrorState, Loading } from "./components";

const statuses = [
  "new",
  "contacted",
  "follow-up",
  "confirmed",
  "reviewed",
  "closed",
  "cancelled",
];
export default function InquiryManager({ owner = false }: { owner?: boolean }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["inquiries", search, status],
    queryFn: () =>
      api<any[]>(`/admin/inquiries?${new URLSearchParams({ search, status })}`),
  });
  const analytics = useQuery({
    queryKey: ["inquiry-analytics"],
    queryFn: () => api<any>("/admin/inquiry-analytics"),
  });
  const team = useQuery({
    queryKey: ["inquiry-team"],
    queryFn: () => api<any[]>("/admin/inquiry-team"),
  });
  async function update(fields: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      setSelected(await patch(`/admin/inquiries/${selected._id}`, fields));
      setNote("");
      await qc.invalidateQueries({ queryKey: ["inquiries"] });
      await qc.invalidateQueries({ queryKey: ["inquiry-analytics"] });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="paper">
      <h2>Enquiry management</h2>
      {analytics.data && (
        <>
          <div className="hc-inquiry-metrics">
            {[
              ["Total enquiries", analytics.data.total],
              [
                "New",
                analytics.data.statuses.find((s: any) => s._id === "new")
                  ?.count || 0,
              ],
              [
                "Follow-up required",
                analytics.data.statuses.find((s: any) => s._id === "follow-up")
                  ?.count || 0,
              ],
              [
                "Confirmed",
                analytics.data.statuses.find((s: any) => s._id === "confirmed")
                  ?.count || 0,
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <details>
            <summary>Service demand and monthly enquiry trends</summary>
            <h3>Popular services</h3>
            <ul>
              {analytics.data.popular.map((s: any) => (
                <li key={s._id}>
                  {s._id}: {s.count}
                </li>
              ))}
            </ul>
            <h3>Monthly enquiries (last 12 months)</h3>
            <ul>
              {analytics.data.monthly.map((s: any) => (
                <li key={s._id}>
                  {s._id}: {s.count}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
      {analytics.error && <ErrorState error={analytics.error} />}
      <div className="hc-filters">
        <input
          aria-label="Search enquiries"
          placeholder="Search name, reference, phone, service…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filter enquiry status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <a
          className="button secondary small"
          href={apiUrl("/admin/inquiries-export")}
        >
          Export summary CSV
        </a>
      </div>
      <p>
        Latest 100 matching enquiries. CSV includes up to 1,000 summary records
        and excludes health notes and contact details.
      </p>
      {query.isLoading ? (
        <Loading />
      ) : query.error ? (
        <ErrorState error={query.error} />
      ) : !query.data?.length ? (
        <p>No matching enquiries.</p>
      ) : (
        query.data.map((row) => (
          <div className="list-row" key={row._id}>
            <div>
              <strong>{row.name}</strong>
              <p>
                {row.reference || row._id} · {row.service} · {row.locality}
              </p>
              <small>
                {row.status} ·{" "}
                {new Date(row.createdAt).toLocaleDateString("en-IN")}
              </small>
            </div>
            <button
              className="button secondary small"
              onClick={() => {
                setSelected(row);
                setNote("");
                setError("");
              }}
            >
              View and follow up
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
            Close enquiry
          </button>
          <h2>{selected.name}</h2>
          <dl className="review-list">
            {[
              "reference",
              "phone",
              "email",
              "city",
              "locality",
              "service",
              "patientAge",
              "startDate",
              "careDuration",
              "preferredShift",
              "requirements",
              "language",
            ].map((key) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{selected[key] ?? "Not supplied"}</dd>
              </div>
            ))}
          </dl>
          <label>
            Status
            <select
              aria-label="Status"
              disabled={busy}
              value={selected.status}
              onChange={(e) => void update({ status: e.target.value })}
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Assigned team member
            <select
              disabled={busy}
              value={selected.assignedTo || ""}
              onChange={(e) =>
                void update({ assignedTo: e.target.value || null })
              }
            >
              <option value="">Unassigned</option>
              {team.data?.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </label>
          {team.error && <ErrorState error={team.error} />}
          <h3>Internal follow-up notes</h3>
          {selected.notes?.map((entry: any, i: number) => (
            <p key={i}>
              {entry.text}
              <br />
              <small>{new Date(entry.createdAt).toLocaleString("en-IN")}</small>
            </p>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (note.trim()) void update({ note });
            }}
          >
            <label>
              Add internal note
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                required
              />
            </label>
            <button className="button" disabled={busy || !note.trim()}>
              Save follow-up note
            </button>
          </form>
          {error && (
            <div role="alert" className="notice error">
              {error}
            </div>
          )}
          {owner &&
            ["closed", "cancelled"].includes(selected.status) &&
            !selected.redactedAt && (
              <details>
                <summary>Privacy and retention review</summary>
                <p>
                  After verifying the privacy request and retention
                  requirements, the owner may remove enquiry contact details and
                  internal notes. Reference, service, status and an audit event
                  remain. This does not erase backups or separate billing
                  records.
                </p>
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const values = new FormData(event.currentTarget);
                    setBusy(true);
                    setError("");
                    try {
                      setSelected(
                        await post(`/admin/inquiries/${selected._id}/redact`, {
                          reason: values.get("reason"),
                          confirmed: values.get("confirmed") === "on",
                        }),
                      );
                      await qc.invalidateQueries({ queryKey: ["inquiries"] });
                    } catch (error) {
                      setError((error as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <label>
                    Retention review reason (no patient details)
                    <textarea
                      name="reason"
                      required
                      minLength={10}
                      maxLength={300}
                    />
                  </label>
                  <label className="checkbox">
                    <input name="confirmed" type="checkbox" required />I
                    verified this request and the applicable retention
                    requirements.
                  </label>
                  <button className="button secondary" disabled={busy}>
                    Remove personal enquiry details
                  </button>
                </form>
              </details>
            )}
        </dialog>
      )}
    </section>
  );
}
