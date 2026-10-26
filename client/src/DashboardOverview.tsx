import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  HeartHandshake,
  FileCheck2,
  Receipt,
  Bell,
  Clock3,
  MessageSquare,
  ClipboardList,
  CheckCircle2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { api, post, date, money } from "./api";
import { Status, ErrorState } from "./components";
import { EmptyState, Illustration, Reveal, Skeleton } from "./Visual";
import { services } from "../../shared/catalog";
type Row = Record<string, any>;
function useRecords(path: string, enabled = true) {
  return useQuery({
    queryKey: ["portal", path],
    queryFn: () => api<Row[]>(path),
    enabled,
  });
}
const indiaDay = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
export default function DashboardOverview({
  user,
  onNavigate,
}: {
  user: Row;
  onNavigate: (tab: string) => void;
}) {
  const qc = useQueryClient();
  const ops = ["owner", "operations"].includes(user.role);
  const finance = ["owner", "accountant", "client"].includes(user.role);
  const care = user.role !== "accountant";
  const client = user.role === "client";
  const worker = user.role === "caregiver";
  const [busy, setBusy] = useState(false);
  const summary = useQuery({
    queryKey: ["portal", "/admin/dashboard"],
    queryFn: () => api("/admin/dashboard"),
    enabled: ops || user.role === "accountant",
  });
  const bookings = useRecords(
    ops ? "/admin/bookings" : "/portal/bookings",
    care && !worker,
  );
  const shifts = useRecords("/portal/shifts", care);
  const assignments = useRecords("/portal/assignments", care);
  const invoices = useRecords("/portal/invoices", finance);
  const agreements = useRecords("/portal/agreements", client || worker);
  const notifications = useRecords("/portal/notifications");
  const inquiries = useRecords("/admin/inquiries", ops);
  const profile = useQuery({
    queryKey: ["caregiver-profile"],
    queryFn: () => api("/portal/caregiver-profile"),
    enabled: worker,
  });
  const records = bookings.data || [];
  const visits = shifts.data || [];
  const bills = invoices.data || [];
  const pendingAgreements =
    agreements.data?.filter((a) => !a.acceptedAt).length || 0;
  const next = visits
    .filter((s) => new Date(s.end) > new Date() && s.status !== "cancelled")
    .sort((a, b) => +new Date(a.start) - +new Date(b.start))[0];
  const assigned = assignments.data?.find((a) => a._id === next?.assignmentId);
  const outstanding = bills.reduce(
    (sum, i) => sum + i.totalPaise - i.paidPaise,
    0,
  );
  const unread = notifications.data?.filter((n) => !n.read).length || 0;
  const metrics = ops
    ? [
        ["Care requests", summary.data?.bookings, ClipboardList, "Bookings"],
        ["Active care", summary.data?.active, HeartHandshake, "Bookings"],
        [
          "Pending quotes",
          records.filter((b) => ["inquiry", "assessment"].includes(b.status))
            .length,
          FileCheck2,
          "Bookings",
        ],
        ["Approved caregivers", summary.data?.caregivers, Users, "Caregivers"],
      ]
    : user.role === "accountant"
      ? [
          ["Invoiced", money(summary.data?.billedPaise), Receipt, "Billing"],
          [
            "Collected (net)",
            money(summary.data?.collectedPaise),
            CheckCircle2,
            "Billing",
          ],
          [
            "Outstanding",
            money(summary.data?.outstandingPaise),
            Clock3,
            "Billing",
          ],
        ]
      : worker
        ? [
            [
              "Upcoming shifts",
              visits.filter((s) => s.status === "scheduled").length,
              CalendarDays,
              "Schedule",
            ],
            [
              "Completed shifts",
              visits.filter((s) => s.status === "completed").length,
              CheckCircle2,
              "Schedule",
            ],
            ["To acknowledge", pendingAgreements, FileCheck2, "Agreements"],
            ["Unread updates", unread, Bell, "Notifications"],
          ]
        : [
            ["Your requests", records.length, ClipboardList, "Bookings"],
            [
              "Upcoming visits",
              visits.filter((s) => s.status === "scheduled").length,
              CalendarDays,
              "Schedule",
            ],
            [
              client ? "To acknowledge" : "Active care",
              client
                ? pendingAgreements
                : records.filter((b) => b.status === "active").length,
              FileCheck2,
              client ? "Agreements" : "Bookings",
            ],
            ["Unread updates", unread, Bell, "Notifications"],
          ];
  async function start(id: string) {
    setBusy(true);
    try {
      await post(`/portal/shifts/${id}/start`);
      await qc.invalidateQueries();
      toast.success("Your shift has started");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const waiting = summary.isLoading || bookings.isLoading || shifts.isLoading;
  return (
    <div className={`dashboard-overview role-${user.role}`}>
      <Reveal className="dashboard-welcome">
        <div>
          <span className="dashboard-welcome-label">
            <span className="pulse-dot" />
            {ops
              ? "THOUGHTFUL CARE, WORKING TOGETHER"
              : worker
                ? "A NEW DAY TO MAKE A DIFFERENCE"
                : "YOUR CARE JOURNEY, CONNECTED"}
          </span>
          <h2>
            {ops
              ? "A clearer picture. A more connected team."
              : worker
                ? "You bring the human touch."
                : "Good care feels even better together."}
          </h2>
          <p>
            {ops
              ? "Keep the next step moving, from the first conversation to coordinated care."
              : worker
                ? "Your assigned work, important updates and next shift, all close at hand."
                : "We’re here to help you find your footing. Your care details and next steps are right here."}
          </p>
          <button
            className="text-link"
            onClick={() =>
              onNavigate(ops ? "Bookings" : worker ? "Schedule" : "Support")
            }
          >
            {ops
              ? "Review care requests"
              : worker
                ? "See your schedule"
                : "Talk to your care team"}
            <ArrowUpRight size={16} />
          </button>
        </div>
        <Illustration
          name={ops ? "coordination" : worker ? "caregiver" : "welcome"}
        />
      </Reveal>
      {waiting ? (
        <Skeleton />
      ) : (
        <div className="overview-metrics">
          {metrics.map(([label, value, Icon, tab], i) => {
            const I = Icon as typeof CalendarDays;
            return (
              <Reveal key={String(label)} delay={i * 0.05}>
                <button
                  className="overview-metric"
                  onClick={() => onNavigate(String(tab))}
                >
                  <span className={`metric-icon metric-${i}`}>
                    <I size={20} />
                  </span>
                  <span className="metric-copy">
                    <small>{String(label)}</small>
                    <strong>{String(value ?? "—")}</strong>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              </Reveal>
            );
          })}
        </div>
      )}
      {(bookings.error || summary.error) && (
        <ErrorState
          error={(bookings.error || summary.error)!}
          retry={() => {
            bookings.refetch();
            summary.refetch();
          }}
        />
      )}
      <div className="overview-grid">
        <div className="overview-primary">
          {care && (
            <Reveal className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">ONE STEP AT A TIME</p>
                  <h3>
                    {ops
                      ? "Upcoming coordinated care"
                      : worker
                        ? "Your next shift"
                        : "Your next care visit"}
                  </h3>
                </div>
                <button
                  className="text-button"
                  onClick={() => onNavigate("Schedule")}
                >
                  View schedule <ArrowUpRight size={14} />
                </button>
              </div>
              {shifts.error ? (
                <ErrorState error={shifts.error} />
              ) : next ? (
                <div className="next-visit">
                  <div className="visit-date">
                    <CalendarDays size={23} />
                    <b>
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "2-digit",
                        month: "short",
                        timeZone: "Asia/Kolkata",
                      }).format(new Date(next.start))}
                    </b>
                  </div>
                  <div>
                    <Status>{next.status}</Status>
                    <h3>
                      {(worker
                        ? assigned?.approvedClient?.preferredName
                        : assigned?.caregiver?.displayName) ||
                        "Coordinated care shift"}
                    </h3>
                    <p>
                      {date(next.start)}
                      <br />
                      Until {date(next.end)}
                    </p>
                    {assigned?.instructions && (
                      <p className="notice">{assigned.instructions}</p>
                    )}
                  </div>
                  {worker && next.status === "scheduled" && (
                    <button
                      className="button small"
                      disabled={busy}
                      onClick={() => start(next._id)}
                    >
                      Start shift <ArrowUpRight size={15} />
                    </button>
                  )}
                  {worker && next.status === "started" && (
                    <button
                      className="button small"
                      onClick={() => onNavigate("Schedule")}
                    >
                      Complete shift
                    </button>
                  )}
                </div>
              ) : (
                <EmptyState
                  type="scheduling"
                  title={
                    worker
                      ? "Your next shift is on its way."
                      : "Your next visit starts with a conversation."
                  }
                  text={
                    worker
                      ? "When the team assigns your work, your schedule and approved instructions will appear here."
                      : "Confirmed caregiver shifts will appear here once the team has coordinated your care."
                  }
                  action={
                    client
                      ? "Explore care services"
                      : ops
                        ? "Review requests"
                        : undefined
                  }
                  to={client ? "/services" : undefined}
                  onAction={ops ? () => onNavigate("Bookings") : undefined}
                />
              )}
            </Reveal>
          )}
          {!worker && care && (
            <Reveal className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">YOUR CARE, STEP BY STEP</p>
                  <h3>
                    {ops
                      ? "Requests that need a next step"
                      : "Your care requests"}
                  </h3>
                </div>
                <button
                  className="text-button"
                  onClick={() => onNavigate("Bookings")}
                >
                  View all <ArrowUpRight size={14} />
                </button>
              </div>
              {bookings.isLoading ? (
                <Skeleton />
              ) : records.length ? (
                records.slice(0, 3).map((b) => (
                  <article className="overview-booking" key={b._id}>
                    <div className="booking-heading">
                      <div>
                        <small>{b.reference}</small>
                        <h4>
                          {services.find((s) => s.slug === b.service)?.name ||
                            b.service}
                        </h4>
                        <p>
                          {b.preferredName} · {b.locality}
                        </p>
                      </div>
                      <Status>{b.status}</Status>
                    </div>
                    <BookingTimeline status={b.status} />
                    {b.quotePaise && (
                      <p className="quote-preview">
                        Proposed quote: <b>{money(b.quotePaise)}</b>
                      </p>
                    )}
                    <button
                      className="text-button"
                      onClick={() =>
                        onNavigate(
                          b.status === "agreement" && client
                            ? "Agreements"
                            : "Bookings",
                        )
                      }
                    >
                      {b.status === "agreement" && client
                        ? "Review your agreement"
                        : "View request"}
                      <ArrowUpRight size={14} />
                    </button>
                  </article>
                ))
              ) : (
                <EmptyState
                  type="empty-booking"
                  title="Let’s take your first step, together."
                  text="Tell us a little about your family’s needs. We’ll help you find a thoughtful place to begin."
                  action={client ? "Start a care request" : "Review bookings"}
                  to={client ? "/request-care" : undefined}
                  onAction={!client ? () => onNavigate("Bookings") : undefined}
                />
              )}
            </Reveal>
          )}
          {worker && (
            <Reveal className="dashboard-panel">
              <div className="panel-heading">
                <h3>Your care profile</h3>
                <ShieldCheck size={20} />
              </div>
              {profile.error ? (
                <ErrorState error={profile.error} />
              ) : profile.data ? (
                <div className="care-profile-summary">
                  <Illustration name="verification" />
                  <div>
                    <h4>{profile.data.displayName}</h4>
                    <Status>{profile.data.status}</Status>
                    <p>
                      {profile.data.qualification === "nurse"
                        ? "Nursing professional"
                        : "Non-clinical attendant"}
                    </p>
                    {profile.data.credentialExpiry && (
                      <p>
                        Credential expiry: {date(profile.data.credentialExpiry)}
                      </p>
                    )}
                    <p>Maximum shift: {profile.data.maxHours} hours</p>
                    <button
                      className="text-link"
                      onClick={() => onNavigate("Agreements")}
                    >
                      Review your agreements <ArrowUpRight size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState
                  type="verification"
                  title="Your profile is being prepared."
                  text="The team will review your onboarding details and service eligibility before assignment."
                />
              )}
            </Reveal>
          )}
          {(ops || user.role === "accountant") &&
            user.role !== "operations" && (
              <Reveal className="dashboard-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">A CLEARER VIEW OF THE DETAILS</p>
                    <h3>Billing & recorded collections</h3>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => onNavigate("Billing")}
                  >
                    View billing <ArrowUpRight size={14} />
                  </button>
                </div>
                {summary.data?.billing?.length ? (
                  <div className="overview-chart">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={summary.data.billing}>
                        <CartesianGrid vertical={false} stroke="#e5edf4" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="billed"
                          name="Invoiced INR"
                          fill="#c3e9f3"
                          radius={[5, 5, 0, 0]}
                        />
                        <Bar
                          dataKey="collected"
                          name="Collected INR"
                          fill="#1688a7"
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyState
                    type="invoice"
                    title="A clear picture, as care takes shape."
                    text="Recorded invoices and verified receipts will appear here. Bookings are not counted as recognized revenue."
                  />
                )}
              </Reveal>
            )}
          {ops && (
            <Reveal className="dashboard-panel">
              <div className="panel-heading">
                <h3>New care conversations</h3>
                <Status>
                  {inquiries.data?.filter((i) => i.status === "new").length ||
                    0}{" "}
                  new
                </Status>
              </div>
              {inquiries.error ? (
                <ErrorState error={inquiries.error} />
              ) : inquiries.data?.length ? (
                inquiries.data.slice(0, 4).map((i) => (
                  <div className="overview-inquiry" key={i._id}>
                    <span className="inquiry-avatar">{i.name.charAt(0)}</span>
                    <div>
                      <b>{i.name}</b>
                      <p>
                        {i.service} · {i.locality}
                      </p>
                    </div>
                    <Status>{i.status}</Status>
                  </div>
                ))
              ) : (
                <EmptyState
                  type="contact"
                  title="Ready for the next conversation."
                  text="New public care inquiries will be listed here for the team to review."
                />
              )}
              <button
                className="text-link"
                onClick={() => onNavigate("Inquiries")}
              >
                Review all inquiries <ArrowUpRight size={15} />
              </button>
            </Reveal>
          )}
        </div>
        <aside className="overview-secondary">
          {care && (
            <CalendarPanel
              shifts={visits}
              onNavigate={() => onNavigate("Schedule")}
            />
          )}
          <Reveal className="dashboard-panel quick-actions">
            <h3>A little help, right here.</h3>
            {(user.role === "accountant"
              ? [
                  ["Review invoices", Receipt, "Billing"],
                  ["View notifications", Bell, "Notifications"],
                  ["Account settings", ShieldCheck, "Settings"],
                ]
              : [
                  [
                    client
                      ? "Request a service"
                      : worker
                        ? "Review your shifts"
                        : "Review care requests",
                    Plus,
                    client ? "new" : worker ? "Schedule" : "Bookings",
                  ],
                  [
                    worker ? "Request leave" : "Contact the care team",
                    MessageSquare,
                    "Support",
                  ],
                  [
                    client || worker
                      ? "Review agreements"
                      : "Team notifications",
                    FileCheck2,
                    client || worker ? "Agreements" : "Notifications",
                  ],
                ]
            ).map(([label, Icon, tab]) => {
              const I = Icon as typeof Plus;
              return tab === "new" ? (
                <Link key={String(label)} to="/request-care">
                  <span>
                    <I size={18} />
                  </span>
                  {String(label)}
                  <ArrowUpRight size={15} />
                </Link>
              ) : (
                <button
                  key={String(label)}
                  onClick={() => onNavigate(String(tab))}
                >
                  <span>
                    <I size={18} />
                  </span>
                  {String(label)}
                  <ArrowUpRight size={15} />
                </button>
              );
            })}
          </Reveal>
          {finance && (
            <Reveal className="dashboard-panel invoice-summary">
              <span className="panel-icon">
                <Receipt size={20} />
              </span>
              <h3>
                {client ? "Your billing, at a glance." : "Outstanding invoices"}
              </h3>
              {invoices.error ? (
                <ErrorState error={invoices.error} />
              ) : bills.length ? (
                <>
                  <strong>{money(outstanding)}</strong>
                  <p>
                    Outstanding across{" "}
                    {bills.filter((i) => i.status !== "paid").length}{" "}
                    invoice(s).
                  </p>
                  <button
                    className="text-link"
                    onClick={() => onNavigate("Billing")}
                  >
                    Review invoices <ArrowUpRight size={15} />
                  </button>
                </>
              ) : (
                <EmptyState
                  type="invoice"
                  title="All clear for now."
                  text="Your issued invoices and receipts will appear here."
                />
              )}
            </Reveal>
          )}
          <Reveal className="dashboard-panel updates-panel">
            <div className="panel-heading">
              <h3>Care updates</h3>
              <Bell size={18} />
            </div>
            {notifications.error ? (
              <ErrorState error={notifications.error} />
            ) : notifications.data?.length ? (
              notifications.data.slice(0, 3).map((n) => (
                <div className="overview-update" key={n._id}>
                  <span className={!n.read ? "unread-dot" : "read-dot"} />
                  <div>
                    <p>{n.title}</p>
                    <small>{date(n.createdAt)}</small>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                type="notification"
                title="A little quiet is a good thing."
                text="Important care updates will be collected here."
              />
            )}
            <button
              className="text-link"
              onClick={() => onNavigate("Notifications")}
            >
              All notifications <ArrowUpRight size={15} />
            </button>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
function BookingTimeline({ status }: { status: string }) {
  const stages = [
    "inquiry",
    "assessment",
    "quote",
    "agreement",
    "confirmed",
    "active",
  ];
  const index = status === "completed" ? 6 : stages.indexOf(status);
  return (
    <ol className="booking-timeline" aria-label={`Care progress: ${status}`}>
      {[
        ["Request", 0],
        ["Review", 1],
        ["Agreement", 3],
        ["Care", 5],
      ].map(([label, position]) => (
        <li className={index >= Number(position) ? "reached" : ""} key={label}>
          <span>
            {index > Number(position) ? <CheckCircle2 size={12} /> : null}
          </span>
          <small>{label}</small>
        </li>
      ))}
    </ol>
  );
}
function CalendarPanel({
  shifts,
  onNavigate,
}: {
  shifts: Row[];
  onNavigate: () => void;
}) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selected, setSelected] = useState(() => indiaDay(new Date()));
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  const relevant = shifts.filter(
    (s) => s.status !== "cancelled" && indiaDay(new Date(s.start)) === selected,
  );
  const dateKey = (d: number) =>
    `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return (
    <Reveal className="dashboard-panel care-calendar">
      <div className="panel-heading">
        <h3>Your care calendar</h3>
        <CalendarDays size={18} />
      </div>
      <div className="calendar-month">
        <b>
          {new Intl.DateTimeFormat("en-IN", {
            month: "long",
            year: "numeric",
          }).format(month)}
        </b>
        <div>
          <button
            aria-label="Previous month"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
          >
            <ChevronLeft size={17} />
          </button>
          <button
            aria-label="Next month"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div className="calendar-days">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {Array.from({ length: offset }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const key = dateKey(i + 1);
          const scheduled = shifts.some(
            (s) =>
              s.status !== "cancelled" && indiaDay(new Date(s.start)) === key,
          );
          return (
            <button
              key={key}
              className={`${selected === key ? "selected" : ""} ${scheduled ? "has-visit" : ""}`}
              aria-label={`${key}${scheduled ? ", has scheduled care" : ""}`}
              aria-pressed={selected === key}
              onClick={() => setSelected(key)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="calendar-selection">
        <span className="pulse-dot" />
        <p>
          {relevant.length
            ? `${relevant.length} shift(s) on this date`
            : "No care shifts on this date."}
        </p>
      </div>
      <button className="text-link" onClick={onNavigate}>
        Open full schedule <ArrowUpRight size={15} />
      </button>
    </Reveal>
  );
}
