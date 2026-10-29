import ContentManager from "./ContentManager";
import { LanguageSwitcher } from "./i18n";
import { tr } from "./legacyTranslations";
import InquiryManager from "./InquiryManager";
import ServiceManager from "./ServiceManager";
import AuthExperience from "./AuthExperience";
import DashboardOverview from "./DashboardOverview";
import { EmptyState } from "./Visual";
import { ActionDialog } from "./ActionDialog";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  CalendarDays,
  FileText,
  Receipt,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ArrowUpRight,
  Plus,
  Download,
  ShieldCheck,
  Menu,
  Search,
} from "lucide-react";
import { api, apiUrl, post, patch, money, date } from "./api";
import { Logo, Status, Loading, ErrorState } from "./components";
import { Field } from "./Pages";
import { services, areas } from "../../shared/catalog";
type Row = Record<string, any>;
const tabs = [
  ["Overview", LayoutDashboard],
  ["Bookings", ClipboardList],
  ["Inquiries", MessageSquare],
  ["Caregivers", Users],
  ["Schedule", CalendarDays],
  ["Agreements", FileText],
  ["Billing", Receipt],
  ["Support", MessageSquare],
  ["Notifications", Bell],
  ["Team", Users],
  ["Services", Settings],
  ["Content", FileText],
  ["Audit log", ShieldCheck],
  ["Settings", Settings],
] as const;
export default function Portal() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => api("/auth/me"),
    retry: false,
  });
  const [tab, setTab] = useState("Overview");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  if (isLoading) return <Loading />;
  if (error || !user)
    return (
      <AuthExperience
        standalone
        sessionIssue={
          error && !/sign in|session/i.test(error.message)
            ? "We couldn’t connect to the care service. You can try signing in again below."
            : error && /expired|longer valid/i.test(error.message)
              ? "Your session has ended. Sign in to continue securely."
              : undefined
        }
      />
    );
  const isOps = ["owner", "operations"].includes(user.role);
  const financial = ["owner", "accountant", "client"].includes(user.role);
  const visible = tabs.filter(
    ([t]) =>
      !(["Caregivers", "Inquiries"].includes(t) && !isOps) &&
      !(
        ["Team", "Services", "Content", "Audit log"].includes(t) &&
        user.role !== "owner"
      ) &&
      !(t === "Billing" && !financial) &&
      !(
        t === "Agreements" &&
        ["operations", "coordinator", "accountant"].includes(user.role)
      ) &&
      !(
        user.role === "accountant" &&
        ["Bookings", "Schedule", "Support"].includes(t)
      ),
  );
  return (
    <div className="portal-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Logo />
        <LanguageSwitcher />
        <p className="sidebar-label">{tr("YOUR CARE WORKSPACE")}</p>
        <nav aria-label="Care portal">
          {visible.map(([t, Icon]) => (
            <button
              key={tr(t)}
              className={tab === t ? "selected" : ""}
              onClick={() => {
                setTab(t);
                setOpen(false);
              }}
            >
              <Icon size={19} />
              {tr(t)}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="avatar">{user.name.charAt(0)}</span>
          <div>
            <b>{user.name}</b>
            <small>{user.role}</small>
          </div>
          <button
            aria-label={tr("Sign out")}
            className="icon-button"
            onClick={async () => {
              try {
                await post("/auth/logout");
                qc.clear();
                navigate("/login");
              } catch (e) {
                toast.error((e as Error).message);
              }
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <div className="portal-main">
        <div className="portal-top">
          <button
            className="menu-button icon-button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle portal menu"
          >
            <Menu />
          </button>
          <span>
            Atharv care / <b>{tr(tab)}</b>
          </span>
          <Link to="/">
            {tr("Back to website")}
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="portal-content">
          <div className="portal-heading">
            <div>
              <p className="eyebrow">
                {["owner", "operations", "accountant", "coordinator"].includes(
                  user.role,
                )
                  ? "CARE OPERATIONS"
                  : tr("YOUR PERSONAL CARE PORTAL")}
              </p>
              <h1>
                {tab === "Overview"
                  ? `Welcome, ${user.name.split(" ")[0]}.`
                  : tab}
              </h1>
              <p>
                {tab === "Overview"
                  ? "Here’s where your care journey comes together."
                  : tr("Clear information. Thoughtful next steps.")}
              </p>
            </div>
            {user.role === "client" && (
              <Link className="button" to="/request-care">
                <Plus size={17} />
                {tr("New care request")}
              </Link>
            )}
          </div>
          <PortalContent key={tab} tab={tab} user={user} onNavigate={setTab} />
        </div>
      </div>
    </div>
  );
}
function PortalContent({
  tab,
  user,
  onNavigate,
}: {
  tab: string;
  user: Row;
  onNavigate: (tab: string) => void;
}) {
  const qc = useQueryClient();
  const isOps = ["owner", "operations"].includes(user.role);
  const financial = ["owner", "accountant"].includes(user.role);
  const [form, setForm] = useState<string | null>(null);
  const [target, setTarget] = useState<Row | null>(null);
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const endpoint =
    tab === "Overview"
      ? null
      : tab === "Bookings"
        ? isOps
          ? "/admin/bookings"
          : "/portal/bookings"
        : tab === "Caregivers"
          ? "/admin/caregivers"
          : tab === "Schedule"
            ? "/portal/shifts"
            : tab === "Agreements"
              ? "/portal/agreements"
              : tab === "Billing"
                ? "/portal/invoices"
                : tab === "Support"
                  ? isOps
                    ? "/admin/tickets"
                    : "/portal/tickets"
                  : tab === "Notifications"
                    ? "/portal/notifications"
                    : tab === "Team"
                      ? "/admin/users"
                      : tab === "Services"
                        ? "/admin/services"
                        : tab === "Audit log"
                          ? "/admin/audit-logs"
                          : null;
  const query = useQuery({
    queryKey: ["portal", endpoint],
    queryFn: () => api(endpoint!),
    enabled: !!endpoint,
  });
  const assignments = useQuery({
    queryKey: ["portal", "/portal/assignments"],
    queryFn: () => api<Row[]>("/portal/assignments"),
    enabled: tab === "Schedule",
  });
  async function act(fn: () => Promise<any>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await qc.invalidateQueries();
      toast.success("Saved successfully");
      setForm(null);
      setTarget(null);
    } catch (e) {
      setError((e as Error).message);
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function openForm(name: string, row: Row | null = null) {
    setForm(name);
    setTarget(row);
    setError("");
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d: any = Object.fromEntries(new FormData(e.currentTarget));
    await act(async () => {
      if (form === "Staff") {
        return post("/admin/users", d);
      }
      if (form === "Support") {
        if (!d.bookingId) delete d.bookingId;
        return post("/portal/tickets", d);
      }
      if (form === "Review support") {
        return patch(`/admin/tickets/${target!._id}`, d);
      }
      if (form === "Quote") {
        return patch(`/admin/bookings/${target!._id}`, {
          status: "quote",
          quotePaise: Math.round(Number(d.amount) * 100),
          quoteDescription: d.description,
        });
      }
      if (form === "Assign caregiver") {
        return post("/admin/assignments", {
          bookingId: target!._id,
          caregiverId: d.caregiverId,
          start: new Date(d.start).toISOString(),
          end: new Date(d.end).toISOString(),
          instructions: d.instructions,
        });
      }
      if (form === "Invoice") {
        return post("/admin/invoices", {
          bookingId: d.bookingId,
          description: d.description,
          quantity: Number(d.quantity),
          unitPaise: Math.round(Number(d.unit) * 100),
          taxBps: Math.round(Number(d.tax) * 100),
          dueDate: d.dueDate,
        });
      }
      if (form === "Payment") {
        return post(`/admin/invoices/${target!._id}/payments`, {
          amountPaise: Math.round(Number(d.amount) * 100),
          reference: d.reference,
          kind: d.kind,
          reason: d.reason,
        });
      }
      if (form === "Caregiver profile") {
        return post("/admin/caregivers", {
          userId: d.userId,
          displayName: d.displayName,
          qualification: d.qualification,
          services: d.services.split(",").map((x: string) => x.trim()),
          localities: d.localities.split(",").map((x: string) => x.trim()),
          languages: d.languages.split(",").map((x: string) => x.trim()),
          engagement: d.engagement,
          maxHours: Number(d.maxHours),
          restHours: Number(d.restHours),
          ...(d.credentialExpiry
            ? { credentialExpiry: new Date(d.credentialExpiry).toISOString() }
            : {}),
        });
      }
      if (form === "Complete shift") {
        return post(`/portal/shifts/${target!._id}/complete`, {
          notes: d.notes,
          tasks: d.tasks.split("\n").filter(Boolean),
        });
      }
      if (form === "Service") {
        return patch(`/admin/services/${target!._id}`, {
          name: d.name,
          summary: d.summary,
          description: d.description,
          ...(d.rate
            ? {
                ratePaise: Math.round(Number(d.rate) * 100),
                rateUnit: d.rateUnit,
              }
            : {}),
        });
      }
      if (form === "Profile") {
        return patch("/portal/profile", d);
      }
    });
  }
  const rawItems: Row[] = Array.isArray(query.data) ? query.data : [];
  const items = rawItems.filter(
    (row) =>
      (statusFilter === "all" || row.status === statusFilter) &&
      JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
  );
  if (tab === "Overview")
    return <DashboardOverview user={user} onNavigate={onNavigate} />;
  if (query.isLoading) return <Loading />;
  if (query.error)
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  return (
    <>
      {error && !form && <ErrorState error={new Error(error)} />}
      <div className="portal-toolbar">
        {endpoint && (
          <div className="portal-list-filters">
            <label>
              <Search size={17} />
              <input
                aria-label={`Search ${tab.toLowerCase()}`}
                placeholder={`Search ${tab.toLowerCase()}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            {rawItems.some((r) => r.status) && (
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                {Array.from(
                  new Set(rawItems.map((r) => r.status).filter(Boolean)),
                ).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            )}
          </div>
        )}
        {tab === "Team" && (
          <button className="button" onClick={() => openForm("Staff")}>
            <Plus size={16} /> Add staff account
          </button>
        )}
        {tab === "Caregivers" && user.role === "owner" && (
          <button
            className="button"
            onClick={() => openForm("Caregiver profile")}
          >
            <Plus size={16} /> Onboard caregiver
          </button>
        )}
        {tab === "Billing" && financial && (
          <>
            <button className="button" onClick={() => openForm("Invoice")}>
              <Plus size={16} /> Create invoice
            </button>
            <a className="button secondary" href={apiUrl("/admin/reports")}>
              <Download size={16} /> Export billing
            </a>
          </>
        )}
        {tab === "Support" && !isOps && (
          <button className="button" onClick={() => openForm("Support")}>
            <Plus size={16} />
            {tr("New request")}
          </button>
        )}
      </div>
      {tab === "Inquiries" && <InquiryManager owner={user.role === "owner"} />}
      {tab === "Bookings" &&
        (items.length ? (
          items.map((b) => (
            <div className="paper booking-card" key={b._id}>
              <BookingCard b={b} />
              {isOps && (
                <div className="row-actions">
                  {b.status === "inquiry" && (
                    <button
                      className="button small secondary"
                      disabled={busy}
                      onClick={() =>
                        act(() =>
                          patch(`/admin/bookings/${b._id}`, {
                            status: "assessment",
                          }),
                        )
                      }
                    >
                      Begin assessment
                    </button>
                  )}
                  {b.status === "assessment" && (
                    <button
                      className="button small"
                      onClick={() => openForm("Quote", b)}
                    >
                      Prepare quote
                    </button>
                  )}
                  {b.status === "quote" && (
                    <button
                      className="button small"
                      disabled={busy}
                      onClick={() =>
                        act(() =>
                          patch(`/admin/bookings/${b._id}`, {
                            status: "agreement",
                          }),
                        )
                      }
                    >
                      Send agreement
                    </button>
                  )}
                  {b.status === "agreement" && (
                    <button
                      className="button small"
                      disabled={busy}
                      onClick={() =>
                        act(() =>
                          patch(`/admin/bookings/${b._id}`, {
                            status: "confirmed",
                            billingApproved: true,
                          }),
                        )
                      }
                    >
                      Confirm billing & booking
                    </button>
                  )}
                  {["confirmed", "active"].includes(b.status) && (
                    <button
                      className="button small"
                      onClick={() => openForm("Assign caregiver", b)}
                    >
                      Schedule caregiver
                    </button>
                  )}
                  {b.status === "active" && (
                    <button
                      className="button secondary small"
                      disabled={busy}
                      onClick={() =>
                        act(() =>
                          patch(`/admin/bookings/${b._id}`, {
                            status: "completed",
                          }),
                        )
                      }
                    >
                      Complete care
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <Empty text={tr("No care requests to display.")} />
        ))}
      {tab === "Caregivers" &&
        (items.length ? (
          items.map((c) => (
            <article className="paper list-row" key={c._id}>
              <div>
                <h3>{c.displayName}</h3>
                <p>
                  {c.qualification} · {c.engagement}
                </p>
                <small>Account ID: {c.userId}</small>
                <p>
                  {c.services.join(", ")}
                  <br />
                  {c.localities.join(", ")}
                </p>
                {c.credentialExpiry && (
                  <p>Credential expiry: {date(c.credentialExpiry)}</p>
                )}
              </div>
              <Status>{c.status}</Status>
              {user.role === "owner" && (
                <div className="row-actions">
                  <button
                    className="button small"
                    disabled={busy}
                    onClick={() =>
                      act(() =>
                        patch(`/admin/caregivers/${c._id}`, {
                          status: "approved",
                        }),
                      )
                    }
                  >
                    Approve verification
                  </button>
                  <button
                    className="button secondary small"
                    disabled={busy}
                    onClick={() =>
                      act(() =>
                        patch(`/admin/caregivers/${c._id}`, {
                          status: "suspended",
                        }),
                      )
                    }
                  >
                    Suspend
                  </button>
                </div>
              )}
            </article>
          ))
        ) : (
          <Empty text="No caregiver profiles yet. Create a staff account, then onboard a profile." />
        ))}
      {tab === "Schedule" &&
        (items.length ? (
          items.map((s) => (
            <article className="paper list-row" key={s._id}>
              <div>
                <h3>{date(s.start)}</h3>
                <p>
                  {tr("Until")}
                  {date(s.end)}
                </p>
                <small>Assignment {s.assignmentId}</small>
                {assignments.data
                  ?.filter((a) => a._id === s.assignmentId)
                  .map((a) => (
                    <div key={a._id}>
                      <p>
                        {tr("Caregiver:")}{" "}
                        {a.caregiver?.displayName ||
                          "Coordinated by the care team"}{" "}
                        · {a.caregiver?.qualification}
                      </p>
                      {a.instructions && (
                        <p className="notice">
                          {tr("Approved instructions:")}
                          {a.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                {s.actualStart && (
                  <p>
                    {tr("Checked in:")}
                    {date(s.actualStart)}
                  </p>
                )}
                {s.actualEnd && (
                  <p>
                    {tr("Completed:")}
                    {date(s.actualEnd)}
                  </p>
                )}
                {s.notes && <p>{s.notes}</p>}
              </div>
              <Status>{s.status}</Status>
              {user.role === "caregiver" && (
                <div>
                  {s.status === "scheduled" && (
                    <button
                      className="button small"
                      disabled={busy}
                      onClick={() =>
                        act(() => post(`/portal/shifts/${s._id}/start`))
                      }
                    >
                      Start shift
                    </button>
                  )}
                  {s.status === "started" && (
                    <button
                      className="button small"
                      onClick={() => openForm("Complete shift", s)}
                    >
                      Complete shift
                    </button>
                  )}
                </div>
              )}
            </article>
          ))
        ) : (
          <Empty
            text={tr(
              "No shifts scheduled. Confirmed assignments will appear here.",
            )}
          />
        ))}
      {tab === "Agreements" && (
        <p className="notice">
          {tr(
            "Agreement text is shown as issued. Ask the team for clarification in your preferred language before accepting.",
          )}
        </p>
      )}
      {tab === "Agreements" &&
        (items.length ? (
          items.map((a) => (
            <article className="paper agreement-card" key={a._id}>
              <div className="list-row">
                <h2>
                  {a.kind}
                  {tr("care agreement")}
                </h2>
                <Status>
                  {a.acceptedAt ? tr("Accepted") : tr("Needs your review")}
                </Status>
              </div>
              <p>
                {tr("Version")}
                {a.version}
                {tr("· Valid until")}
                {date(a.expiresAt)}
              </p>
              <blockquote>{a.text}</blockquote>
              <small className="hash">SHA-256: {a.hash}</small>
              {a.acceptedAt ? (
                <p>
                  {tr("Accepted by")}
                  {a.acceptedName}
                  {tr("on")}
                  {date(a.acceptedAt)}
                </p>
              ) : (
                <>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={!!consents[a._id]}
                      onChange={(e) =>
                        setConsents({ ...consents, [a._id]: e.target.checked })
                      }
                    />
                    {tr(
                      "I have read this version and agree to acknowledge it as",
                    )}{" "}
                    {user.name}.
                  </label>
                  <button
                    className="button"
                    disabled={!consents[a._id] || busy}
                    onClick={() =>
                      act(() =>
                        post(`/portal/agreements/${a._id}/accept`, {
                          consent: true,
                          name: user.name,
                        }),
                      )
                    }
                  >
                    {tr("Accept this agreement")}
                  </button>
                </>
              )}
              <a
                className="text-link"
                href={apiUrl(`/portal/agreements/${a._id}/pdf`)}
              >
                <Download size={16} />
                {tr("Download PDF")}
              </a>
            </article>
          ))
        ) : (
          <Empty
            text={tr(
              "Your agreements will appear after the team prepares your care arrangement.",
            )}
          />
        ))}
      {tab === "Billing" &&
        (items.length ? (
          items.map((i) => (
            <article className="paper list-row" key={i._id}>
              <div>
                <h3>{i.number}</h3>
                <p>{i.description}</p>
                <p>
                  {tr("Due")}
                  {i.dueDate}
                  {tr("· Total")}
                  {money(i.totalPaise)}
                </p>
                <small>
                  {tr("Received")}
                  {money(i.paidPaise)}
                  {tr("· Refunded")} {money(i.refundedPaise)}
                </small>
              </div>
              <Status>{i.status}</Status>
              <div className="row-actions">
                <a
                  className="button secondary small"
                  href={apiUrl(`/portal/invoices/${i._id}/pdf`)}
                >
                  <Download size={15} />
                  {tr("Invoice & receipts")}
                </a>
                {financial && (
                  <button
                    className="button small"
                    onClick={() => openForm("Payment", i)}
                  >
                    Record payment / refund
                  </button>
                )}
              </div>
            </article>
          ))
        ) : (
          <Empty
            text={tr(
              "No invoices yet. Approved service billing will appear here.",
            )}
          />
        ))}
      {tab === "Support" &&
        (items.length ? (
          items.map((t) => (
            <article className="paper" key={t._id}>
              <div className="list-row">
                <h3>
                  {t.type}
                  {tr("request")}
                </h3>
                <Status>{t.status}</Status>
              </div>
              <p>{t.message}</p>
              {t.resolution && (
                <p className="notice">
                  {tr("Team response:")}
                  {t.resolution}
                </p>
              )}
              <small>{date(t.createdAt)}</small>
              {isOps && (
                <button
                  className="button small secondary"
                  onClick={() => openForm("Review support", t)}
                >
                  Review & respond
                </button>
              )}
            </article>
          ))
        ) : (
          <Empty
            text={tr(
              "No support requests. Contact the team for changes, concerns or privacy requests.",
            )}
          />
        ))}
      {tab === "Notifications" &&
        (items.length ? (
          items.map((n) => (
            <article className="paper list-row" key={n._id}>
              <div>
                <h3>{n.title}</h3>
                <p>
                  {date(n.createdAt)} · {n.emailStatus}
                </p>
              </div>
              {!n.read && (
                <button
                  className="button small secondary"
                  disabled={busy}
                  onClick={() =>
                    act(() => post(`/portal/notifications/${n._id}/read`))
                  }
                >
                  {tr("Mark read")}
                </button>
              )}
            </article>
          ))
        ) : (
          <Empty
            text={tr("You’re all caught up. Care updates will appear here.")}
          />
        ))}
      {tab === "Team" &&
        items.map((u) => (
          <article className="paper list-row" key={u.id}>
            <div>
              <h3>{u.name}</h3>
              <p>
                {u.email} · {u.role}
              </p>
              <small>Account ID: {u.id}</small>
            </div>
            <Status>{u.role}</Status>
            {u.role !== "owner" && (
              <button
                className="button secondary small"
                disabled={busy}
                onClick={() =>
                  act(() => patch(`/admin/users/${u.id}`, { active: false }))
                }
              >
                Deactivate account
              </button>
            )}
          </article>
        ))}
      {tab === "Services" && <ServiceManager />}
      {tab === "Content" && <ContentManager />}
      {tab === "Audit log" &&
        (items.length ? (
          <div className="paper table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Time (IST)</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Resource</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a._id}>
                    <td>{date(a.createdAt)}</td>
                    <td>{a.action}</td>
                    <td>{a.actorId}</td>
                    <td>{a.resource}</td>
                    <td>{a.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="No audit events yet." />
        ))}
      {tab === "Settings" && (
        <div className="paper">
          <h2>{tr("Your profile & security")}</h2>
          <p>
            {user.name}
            <br />
            {user.email}
          </p>
          <button
            className="button secondary"
            onClick={() => openForm("Profile", user)}
          >
            {tr("Edit display name")}
          </button>
          <p>{tr("Session changes take effect immediately on the server.")}</p>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() =>
              act(async () => {
                await post("/auth/revoke-sessions");
                window.location.assign("/login");
              })
            }
          >
            {tr("Sign out all sessions")}
          </button>
          <p>
            {tr(
              "For access, correction, deletion or account closure, submit a Privacy request from Support. Retained records are reviewed rather than deleted automatically.",
            )}
          </p>
        </div>
      )}
      {form && (
        <ActionDialog
          title={form}
          onClose={() => {
            setForm(null);
            setTarget(null);
          }}
        >
          <div className="list-row">
            <h2>{form}</h2>
            <button
              className="text-button"
              onClick={() => {
                setForm(null);
                setTarget(null);
              }}
            >
              {tr("Close")}
            </button>
          </div>
          <form onSubmit={submit}>
            <FormFields kind={form} target={target} />
            {error && <ErrorState error={new Error(error)} />}
            <button className="button" disabled={busy}>
              {busy ? tr("Saving…") : tr("Save & continue")}
              <ArrowUpRight size={16} />
            </button>
          </form>
        </ActionDialog>
      )}
    </>
  );
}
function BookingCard({ b }: { b: Row }) {
  return (
    <article className="booking-summary">
      <div className="list-row">
        <div>
          <small>{b.reference}</small>
          <h3>
            {services.find((s) => s.slug === b.service)?.name || b.service}
          </h3>
        </div>
        <Status>{b.status}</Status>
      </div>
      <p>
        {b.preferredName} · {b.locality} · {b.shift}
        <br />
        {tr("Requested start:")}
        {b.startDate} · {b.duration}
        {tr("days")}
      </p>
      {b.instructions && <p className="notice">{b.instructions}</p>}
      {b.quotePaise && (
        <p>
          {tr("Proposed quote:")}
          <b>{money(b.quotePaise)}</b> · {b.quoteDescription}
        </p>
      )}
      <small>Booking ID: {b._id}</small>
    </article>
  );
}
function Empty({ text }: { text: string }) {
  const type = /invoice|billing/i.test(text)
    ? "invoice"
    : /notification|caught up/i.test(text)
      ? "notification"
      : /shift|schedule/i.test(text)
        ? "scheduling"
        : /caregiver|agreement/i.test(text)
          ? "verification"
          : /support|inquir/i.test(text)
            ? "contact"
            : "empty-booking";
  return (
    <EmptyState
      type={type}
      title={
        type === "notification"
          ? tr("You’re all caught up.")
          : tr("A little clarity, as care takes shape.")
      }
      text={text}
    />
  );
}
function FormFields({ kind, target }: { kind: string; target: Row | null }) {
  const input = (
    name: string,
    label: string,
    type = "text",
    value: any = "",
    required = true,
  ) => (
    <Field key={name} label={tr(label)}>
      <input name={name} type={type} defaultValue={value} required={required} />
    </Field>
  );
  if (kind === "Staff")
    return (
      <>
        {input("name", "Full name")}
        {input("email", "Email address", "email")}
        {input(
          "password",
          "Temporary password (at least 12 characters)",
          "password",
        )}
        <Field label="Role">
          <select name="role">
            {["caregiver", "operations", "coordinator", "accountant"].map(
              (t) => (
                <option key={t} value={t}>
                  {tr(t)}
                </option>
              ),
            )}
          </select>
        </Field>
      </>
    );
  if (kind === "Support")
    return (
      <>
        <Field label={tr("Request type")}>
          <select name="type">
            {[
              "Support",
              "Complaint",
              "Replacement",
              "Extension",
              "Cancellation",
              "Transfer",
              "Incident",
              "Leave",
              "Privacy",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        {input("bookingId", "Booking ID (optional)", "text", "", false)}
        <Field label={tr("How can we help?")}>
          <textarea name="message" required minLength={10} maxLength={2000} />
        </Field>
        <p className="notice">
          {tr(
            "Requests receive human review. A request does not automatically cancel care, approve leave or change a contract.",
          )}
        </p>
      </>
    );
  if (kind === "Review support")
    return (
      <>
        <Field label="Review status">
          <select name="status">
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
          </select>
        </Field>
        <Field label="Response / documented decision">
          <textarea name="resolution" required minLength={10} />
        </Field>
      </>
    );
  if (kind === "Quote")
    return (
      <>
        {input("amount", "Quote amount (INR)", "number")}
        <Field label="Scope and billing description">
          <textarea name="description" required minLength={5} />
        </Field>
      </>
    );
  if (kind === "Assign caregiver")
    return (
      <>
        {input("caregiverId", "Caregiver account ID")}
        {input("start", "Start (local time)", "datetime-local")}
        {input("end", "End (local time)", "datetime-local")}
        <Field label="Approved care instructions">
          <textarea name="instructions" maxLength={1500} />
        </Field>
        <p>
          Credentials, service eligibility, locality, agreements, working hours
          and rest conflicts are checked on the server.
        </p>
      </>
    );
  if (kind === "Invoice")
    return (
      <>
        {input("bookingId", "Approved booking ID")}
        {input("description", "Service period and description")}
        {input("quantity", "Quantity", "number", 1)}
        {input("unit", "Unit amount (INR)", "number")}
        {input("tax", "Tax percentage (confirm applicable tax)", "number", 0)}
        {input("dueDate", "Due date", "date")}
      </>
    );
  if (kind === "Payment")
    return (
      <>
        <Field label="Record type">
          <select name="kind">
            <option value="payment">Verified offline payment</option>
            <option value="refund">Owner-approved refund</option>
          </select>
        </Field>
        {input("amount", "Amount (INR)", "number")}
        {input("reference", "Unique external payment reference")}
        {input("reason", "Verification evidence / approval reason")}
        <p className="notice">
          This records a verified offline transaction. It does not move money or
          charge a card.
        </p>
      </>
    );
  if (kind === "Caregiver profile")
    return (
      <>
        {input("userId", "Caregiver account ID (from Team)")}
        {input("displayName", "Approved display name")}
        <Field label="Qualification">
          <select name="qualification">
            <option value="attendant">Non-clinical attendant</option>
            <option value="nurse">Qualified nurse</option>
            <option value="physiotherapist">Qualified physiotherapist</option>
          </select>
        </Field>
        <Field label="Engagement">
          <select name="engagement">
            <option value="employee">Employee</option>
            <option value="contractor">Contractor</option>
          </select>
        </Field>
        {input(
          "services",
          "Eligible service slugs, comma separated",
          "text",
          "elderly-care,patient-attendant",
        )}
        {input(
          "localities",
          `Eligible localities, comma separated (e.g. ${areas[0]})`,
        )}
        {input(
          "languages",
          "Languages, comma separated",
          "text",
          "Marathi,Hindi",
        )}
        {input("maxHours", "Maximum shift hours (up to 12)", "number", 12)}
        {input("restHours", "Minimum rest hours", "number", 8)}
        {input(
          "credentialExpiry",
          "Nursing credential expiry",
          "datetime-local",
          "",
          false,
        )}
      </>
    );
  if (kind === "Complete shift")
    return (
      <>
        <Field label="Shift completion & handover notes">
          <textarea name="notes" maxLength={1500} />
        </Field>
        <Field label="Completed care tasks (one per line)">
          <textarea name="tasks" />
        </Field>
      </>
    );
  if (kind === "Service")
    return (
      <>
        {input("name", "Service name", "text", target?.name)}
        {input("summary", "Short description", "text", target?.summary)}
        <Field label="Description">
          <textarea
            name="description"
            required
            defaultValue={target?.description}
          />
        </Field>
        {input(
          "rate",
          "Optional configured rate (INR)",
          "number",
          target?.ratePaise ? target.ratePaise / 100 : "",
          false,
        )}
        <Field label="Rate unit">
          <select name="rateUnit">
            {["visit", "hour", "shift", "day", "week", "month"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
      </>
    );
  if (kind === "Profile")
    return input("name", "Display name", "text", target?.name);
  return null;
}
