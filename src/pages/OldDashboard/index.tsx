import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store";

/**
 * 1:1 Bootstrap replica of the legacy Guru Dashboard. All tokens
 * (colors, sizes, spacing) are taken from Figma node 352:3.
 * Renders standalone (no AppLayout sidebar / topbar).
 */
export default function OldDashboardPage() {
  const navigate = useNavigate();
  const guruName = useAppSelector((s) => s.profile.guruName);
  const [showDialog, setShowDialog] = useState(false);
  const handleOpenDialog = () => setShowDialog(true);
  const handleSwitch = () => navigate("/new-dashboard");

  useEffect(() => {
    document.body.classList.add("od-body");
    return () => {
      document.body.classList.remove("od-body");
    };
  }, []);

  // Lock body scroll while dialog is open
  useEffect(() => {
    if (showDialog) document.body.classList.add("od-no-scroll");
    else document.body.classList.remove("od-no-scroll");
    return () => document.body.classList.remove("od-no-scroll");
  }, [showDialog]);

  return (
    <>
      <style>{css}</style>

      {/* ── Sticky stack: topbar + promo alert pin together on scroll ── */}
      <div className="od-sticky-stack">
      {/* ── Top bar ── */}
      <header className="od-topbar">
        <div className="od-topbar-logo">
          <img src={`${import.meta.env.BASE_URL}old-dashboard/gl-logo.svg`} alt="Great Learning" />
        </div>
        <h3 className="od-topbar-title">Great Learning Gurus</h3>
        <ul className="od-topbar-nav">
          <li>
            <span className="od-badge-blue">0</span>
            <a href="#"> Program support</a>
          </li>
          <li className="od-user">
            <a href="#" className="od-user-link">{guruName} <span className="od-caret"/></a>
            <ul className="od-user-menu">
              <li><button type="button">Your Profile</button></li>
              <li><button type="button">Switch to Learner Dashboard</button></li>
              <li><button type="button" onClick={() => navigate("/new-dashboard")}>Switch to New Dashboard</button></li>
              <li><button type="button">Refer participants</button></li>
              <li><button type="button">Logout</button></li>
            </ul>
          </li>
        </ul>
      </header>

      {/* ── Sticky promo alert (Bootstrap warning style with icon, pinned to top) ── */}
      <div className="od-promo-bar" role="alert">
        <svg className="od-promo-icon" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 1.45L0.5 14.5h15L8 1.45zM8 5.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 5.5zm0 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
        <span className="od-promo-text">
          <strong>Your Guru Dashboard experience just got upgraded!</strong>
        </span>
        <button type="button" className="btn od-promo-cta" onClick={handleOpenDialog}>
          Explore New Dashboard
        </button>
      </div>
      </div>

      {/* ── Body ── */}
      <div className="od-body-wrap">
        <div className="od-container">
          {/* Tabs */}
          <ul className="od-tabs">
            <li className="active"><a href="#">Upcoming</a></li>
            <li><a href="#">Completed</a></li>
            <li className="od-tab-spacer" />
            <li className="od-tab-right">
              <span className="od-badge-red">New</span>
              <a href="#"> Your Courses</a>
            </li>
            <li className="od-tab-right">
              <a href="#">GL Profile <img src={`${import.meta.env.BASE_URL}old-dashboard/graph-up.svg`} alt="" className="od-graph-icon"/></a>
            </li>
          </ul>

          <div className="od-content">
            {/* Availability banner */}
            <div className="od-avail">
              <div className="od-avail-icon">
                <img src={`${import.meta.env.BASE_URL}old-dashboard/calendar.svg`} alt="" />
              </div>
              <div className="od-avail-text">
                <h3>Availability for Online Mentorship Session</h3>
                <p>Please log your availability so that we can plan the online sessions for you</p>
              </div>
              <div className="od-avail-action">
                <a href="#" className="od-btn-primary">View/Add</a>
              </div>
            </div>

            {/* Confirmed Events */}
            <div className="od-section-list">
              <div className="od-section-header od-section-green">Confirmed Events</div>

              <EventRow
                day="9" month="May'26"
                title="Program Overview (All)"
                lines={["Mentored Learning session", "Topic: AI Application Casestudy - 2", "AIML Online April 26 A"]}
                email="nikita.swamy@greatlearning.in"
                time="04:30PM - 06:30PM"
                showPolls
              />
              <EventRow
                day="3" month="May'26"
                title="Program Overview (All)"
                lines={["Mentored Learning session", "Topic: AI Application Case Study 1", "AIML Online April 26 B"]}
                email="vandana.v1@greatlearning.in"
                time="10:30AM - 12:30PM"
              />
              <EventRow
                day="3" month="May'26"
                title="Data Visualization using Tableau"
                lines={["Online class", "Topic: M9 W1 | Storytelling with Data", "PGPDSGA.O.SEP25.A"]}
                email="priyanka.gouniyal@greatlearning.in"
                time="01:00PM - 03:00PM"
              />
            </div>

            {/* Planned Events */}
            <div className="od-section-list">
              <div className="od-section-header od-section-yellow">Planned Events (subject to change)</div>
              <div className="od-empty">No planned events at this moment!</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bootstrap-style switch dialog ── */}
      {showDialog && (
        <>
          <div className="od-modal-backdrop" />
          <div className="od-modal" role="dialog" aria-modal="true" aria-labelledby="od-modal-title" onClick={() => setShowDialog(false)}>
            <div className="od-modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="od-modal-content">
                <div className="od-modal-header">
                  <button type="button" className="od-modal-close" aria-label="Close" onClick={() => setShowDialog(false)}>
                    <span aria-hidden>×</span>
                  </button>
                  <h4 className="od-modal-title" id="od-modal-title">Experience the New Guru Dashboard</h4>
                </div>
                <div className="od-modal-body">
                  <ul className="od-modal-list">
                    <li><strong>A cleaner interface:</strong> manage all your activities at a glance.</li>
                    <li><strong>Calendar:</strong> Track activities and easy recurring availability marking.</li>
                    <li><strong>Profile:</strong> Get deeper insights into your mentorship impact.</li>
                    <li><strong>Payments and invoices:</strong> Track your monthly payouts and activity-based invoices.</li>
                  </ul>
                  <p className="od-modal-note-secondary">
                    <strong>Note :</strong> You can always switch back if needed. New dashboard will become the default dashboard for everyone in a few days.
                  </p>
                </div>
                <div className="od-modal-footer">
                  <button type="button" className="btn btn-default" onClick={() => setShowDialog(false)}>Maybe later</button>
                  <button type="button" className="btn btn-primary" onClick={handleSwitch}>Switch to New Dashboard</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function EventRow({ day, month, title, lines, email, time, showPolls }: {
  day: string; month: string; title: string; lines: string[]; email: string; time: string; showPolls?: boolean;
}) {
  return (
    <div className="od-event">
      <div className="od-event-date">
        <img src={`${import.meta.env.BASE_URL}old-dashboard/headset.png`} alt="" className="od-event-headset"/>
        <div className="od-event-day">{day}</div>
        <div className="od-event-month">{month}</div>
      </div>
      <div className="od-event-body-outer">
        <div className="od-event-body-inner">
          <div className="od-event-title">{title}</div>
          {lines.map((l, i) => <div key={i} className="od-event-line">{l}</div>)}
          <div className="od-event-email">
            <span className="od-envelope">✉</span>
            <span className="od-email-text">{email}</span>
          </div>
        </div>
      </div>
      <div className="od-event-action">
        <div className="od-event-time">{time}</div>
        <a href="#" className="od-event-join">
          <img src={`${import.meta.env.BASE_URL}old-dashboard/cam.svg`} alt="" className="od-event-cam"/>
          <span> Join session</span>
        </a>
        {showPolls && (
          <div className="od-event-polls-wrap">
            <a href="#" className="od-btn-polls">Create/View Polls</a>
          </div>
        )}
      </div>
    </div>
  );
}

const css = `
html:has(body.od-body) { overflow: visible !important; height: auto !important; }
body.od-body { overflow: visible !important; height: auto !important; }
#root:has(.od-promo-bar) { overflow: visible !important; }
.od-body { margin: 0 !important; background: #fff !important; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important; -webkit-font-smoothing: antialiased; }
.od-body * { box-sizing: border-box; }
.od-body a { text-decoration: none; }

/* ── Top bar ───────────────────────────────────────── */
.od-topbar { position: relative; background: #f8f8f8; border: 1px solid #e7e7e7; border-radius: 4px; min-height: 50px; padding: 0; display: flex; align-items: center; }
.od-topbar-logo { padding: 15px; flex: 0 0 auto; }
.od-topbar-logo img { height: 40px; width: 128.5px; display: block; }
.od-topbar-title { position: absolute; left: 0; right: 0; top: 0; bottom: 0; margin: 0; display: flex; align-items: center; justify-content: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 500; font-size: 24px; line-height: 26.4px; color: #333; pointer-events: none; }
.od-topbar-nav { list-style: none; margin: 0 15px 0 auto; padding: 27px 0 2.35px; display: flex; gap: 20px; align-items: flex-end; }
.od-topbar-nav > li { position: relative; height: 23px; line-height: 22.86px; font-size: 16px; }
.od-topbar-nav a { color: #337ab7; }
.od-topbar-nav a:hover { color: #23527c; text-decoration: underline; }
.od-badge-blue { display: inline-flex; align-items: center; justify-content: center; min-width: 10px; padding: 3px 7px; background: #196ae5; color: #fff; border-radius: 10px; font-size: 12px; font-weight: 700; line-height: 12px; vertical-align: middle; }
.od-user { position: relative; }
.od-caret { display: inline-block; margin-left: 4px; width: 0; height: 0; border-top: 4px dashed #337ab7; border-left: 4px solid transparent; border-right: 4px solid transparent; vertical-align: middle; }
.od-user-menu { display: none; position: absolute; right: 0; top: 100%; margin: 6px 0 0; padding: 5px 0; background: #fff; border: 1px solid rgba(0,0,0,0.15); border-radius: 4px; box-shadow: 0 6px 12px rgba(0,0,0,0.175); min-width: 220px; list-style: none; z-index: 100; }
.od-user:hover .od-user-menu, .od-user:focus-within .od-user-menu { display: block; }
.od-user-menu li { padding: 0; }
.od-user-menu li + li { border-top: 1px solid #f1f1f1; }
.od-user-menu button { display: block; width: 100%; text-align: left; background: none; border: 0; padding: 10px 20px; font-size: 14px; line-height: 1.4; color: #333; cursor: pointer; font-family: inherit; font-weight: 400; }
.od-user-menu button:hover { background: #f5f5f5; color: #262626; }

/* ── Body wrap ─────────────────────────────────────── */
.od-body-wrap { background: #f3f7fa; padding: 20px 0 400px; min-height: calc(100vh - 50px); }
.od-container { max-width: 1170px; margin: 0 auto; padding: 0 15px; }

/* ── Tabs ──────────────────────────────────────────── */
.od-tabs { list-style: none; margin: 0 0 30px; padding: 0; display: flex; align-items: flex-end; border-bottom: 1px solid #00bfff; height: 47.71px; }
.od-tabs > li { padding: 0; }
.od-tabs > li > a { display: block; padding: 11px 16px; font-size: 18px; font-weight: 700; color: #696969; border-radius: 4px 4px 0 0; border: 1px solid transparent; line-height: 25.71px; }
.od-tabs > li.active > a { color: #00bfff; background: #fff; border-color: #ddd; border-bottom-color: transparent; margin-bottom: -1px; }
.od-tabs > li > a:hover { background-color: #eee; }
.od-tabs > li.active > a:hover { background: #fff; }
.od-tab-spacer { flex: 1; }
.od-tab-right > a { display: inline-flex !important; align-items: center; gap: 3px; }
.od-graph-icon { width: 20.571px; height: 15.429px; vertical-align: middle; }
.od-badge-red { display: inline-flex; align-items: center; justify-content: center; min-width: 10px; padding: 3px 7px; background: red; color: #fff; border-radius: 10px; font-size: 12px; font-weight: 700; line-height: 12px; margin-right: 6px; }

/* ── Content padding (Figma uses px-60 inside container) ── */
.od-content { padding: 0 60px; display: flex; flex-direction: column; gap: 30px; }

/* ── Availability banner ───────────────────────────── */
.od-avail { display: flex; align-items: center; padding: 19px; border-radius: 6px; background-image: linear-gradient(260.99deg, rgba(65, 88, 232, 0.2) 2%, rgba(248, 107, 255, 0.2) 94%); }
.od-avail-icon { padding: 0 20px 5px 15px; flex: 0 0 auto; }
.od-avail-icon img { width: 70px; height: 68px; display: block; }
.od-avail-text { flex: 1 1 0; min-width: 0; padding: 19.25px 15px 10px; display: flex; flex-direction: column; gap: 10px; }
.od-avail-text h3 { margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 500; font-size: 24px; line-height: 26.4px; color: #333; }
.od-avail-text p { margin: 0; font-size: 14px; line-height: 20px; color: #333; font-weight: 400; }
.od-avail-action { padding: 0 15px; flex: 0 0 auto; }
.od-btn-primary { display: inline-flex; align-items: center; justify-content: center; padding: 11px 21px; background: #017bfe; border: 1px solid transparent; border-radius: 4px; color: #fff; font-size: 14px; line-height: 20px; }
.od-btn-primary:hover { background: #0163cc; color: #fff; }

/* ── Section list (header + cards stacked, each with own border) ── */
.od-section-list { display: flex; flex-direction: column; }
.od-section-header { padding: 10.25px 20px 4.58px; border: 1px solid #e3e3e3; border-radius: 4px; min-height: 20px; box-shadow: inset 0 1px 1px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; line-height: 31.43px; height: 52.83px; }
.od-section-green { background: #12cd66; }
.od-section-yellow { background: #ffc82c; }

/* ── Event card ─────────────────────────────────────── */
.od-event { display: flex; align-items: flex-start; padding: 20px 5px; border: 1px solid #e3e3e3; border-radius: 4px; background: #fff; box-shadow: inset 0 1px 1px rgba(0,0,0,0.05); min-height: 20px; }
.od-event-date { position: relative; width: 252.5px; flex: 0 0 252.5px; height: 82.85px; }
.od-event-headset { position: absolute; left: 15px; top: 8px; width: 53px; height: 60px; }
.od-event-day { position: absolute; left: 15px; right: 15px; padding-left: 128.53px; padding-right: 75.53px; top: 0; text-align: center; font-family: Helvetica, Arial, sans-serif; font-weight: 700; font-size: 32px; line-height: 45.71px; letter-spacing: 0.64px; color: #000; }
.od-event-month { position: absolute; left: 15px; right: 15px; padding-left: 94.69px; padding-right: 41.68px; top: 45.71px; text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 26px; line-height: 37.14px; letter-spacing: 0.52px; color: #696969; }

.od-event-body-outer { flex: 0 0 420.83px; width: 420.83px; padding: 13px; border: 1px solid #e3e3e3; border-radius: 4px; }
.od-event-body-inner { padding: 10px; background: rgba(224, 225, 226, 0.5); }
.od-event-title { font-family: Helvetica, Arial, sans-serif; font-size: 18px; line-height: 25.71px; letter-spacing: 0.36px; color: #76abe4; }
.od-event-line { font-family: Helvetica, Arial, sans-serif; font-size: 18px; line-height: 25.71px; letter-spacing: 0.36px; color: #000; }
.od-event-email { position: relative; height: 25.71px; }
.od-envelope { position: absolute; left: 0; top: 5px; width: 18.37px; height: 18px; line-height: 18px; font-size: 18px; color: #7c7f82; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
.od-email-text { display: block; padding-left: 24.37px; font-family: Helvetica, Arial, sans-serif; font-size: 18px; line-height: 25.71px; letter-spacing: 0.36px; color: #000; }

.od-event-action { flex: 0 0 336.66px; width: 336.66px; padding: 0 15px 10px; }
.od-event-time { text-align: center; font-size: 18px; line-height: 25.71px; color: #696969; }
.od-event-join { display: inline-flex; align-items: center; gap: 4px; width: 100%; justify-content: center; padding-top: 17px; padding-bottom: 4.34px; color: #00bfff; font-size: 18px; line-height: 25.71px; }
.od-event-cam { width: 26px; height: 17.333px; }
.od-event-polls-wrap { padding-top: 16px; display: flex; justify-content: center; }
.od-btn-polls { display: inline-flex; align-items: center; justify-content: center; padding: 7px 13px; background: #337ab7; border: 1px solid #2e6da4; border-radius: 4px; color: #fff; font-size: 14px; line-height: 20px; }
.od-btn-polls:hover { background: #286090; border-color: #204d74; color: #fff; }

/* ── Empty state ─────────────────────────────────── */
.od-empty { padding: 20px; border: 1px solid #e3e3e3; border-radius: 4px; background: #fff; box-shadow: inset 0 1px 1px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; min-height: 20px; font-style: italic; font-size: 18px; line-height: 25.71px; color: #333; }

/* ── Responsive: shrink the px-60 padding on narrow viewports so card row fits ── */
@media (max-width: 1199px) {
  .od-content { padding: 0 15px; }
}

/* ── Bootstrap btn / alert primitives (scoped) ─────── */
.od-body .btn { display: inline-block; font-weight: 400; line-height: 1.42857143; text-align: center; white-space: nowrap; vertical-align: middle; cursor: pointer; user-select: none; padding: 6px 12px; font-size: 14px; border-radius: 4px; border: 1px solid transparent; font-family: inherit; }
.od-body .btn-sm { padding: 5px 10px; font-size: 12px; line-height: 1.5; border-radius: 3px; }
.od-body .btn-primary { color: #fff; background-color: #337ab7; border-color: #2e6da4; }
.od-body .btn-primary:hover, .od-body .btn-primary:focus { color: #fff; background-color: #286090; border-color: #204d74; text-decoration: none; }
.od-body .btn-default { color: #333; background-color: #fff; border-color: #ccc; }
.od-body .btn-default:hover, .od-body .btn-default:focus { background-color: #e6e6e6; border-color: #adadad; }

.od-body .alert { padding: 15px; margin-bottom: 20px; border: 1px solid transparent; border-radius: 4px; }
.od-body .alert-info { color: #31708f; background-color: #d9edf7; border-color: #bce8f1; }
.od-body .alert-warning { color: #8a6d3b; background-color: #fcf8e3; border-color: #faebcc; }

/* ── Sticky stack (topbar + promo alert pin together on scroll) ── */
.od-sticky-stack {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #f8f8f8;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
}

/* ── Promo alert (Bootstrap warning style + icon) ── */
.od-promo-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 24px;
  background: #fcf3cf;
  border-bottom: 1px solid #f6e58d;
  color: #6b5300;
}
.od-promo-icon { flex: 0 0 auto; width: 20px; height: 20px; fill: #8a6d3b; }
.od-promo-text { flex: 1; min-width: 0; font-size: 14px; line-height: 20px; color: #6b5300; }
.od-promo-text strong { font-weight: 700; margin-right: 4px; color: #4a3800; }
.od-promo-cta { flex: 0 0 auto; }
.od-body .od-promo-cta.btn { background-color: #337ab7; border-color: #2e6da4; color: #fff; font-weight: 600; padding: 6px 14px; }
.od-body .od-promo-cta.btn:hover, .od-body .od-promo-cta.btn:focus { background-color: #286090; border-color: #204d74; color: #fff; }

@media (max-width: 600px) {
  .od-promo-bar { flex-wrap: wrap; padding: 12px 14px; gap: 10px; }
  .od-promo-text { flex-basis: 100%; }
}

/* ── Bootstrap-style modal ────────────────────────── */
.od-no-scroll { overflow: hidden !important; }
.od-modal-backdrop {
  position: fixed; inset: 0;
  background: #000;
  opacity: 0.5;
  z-index: 1040;
}
.od-modal {
  position: fixed; inset: 0;
  z-index: 1050;
  overflow-x: hidden; overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  outline: 0;
  padding: 30px 15px;
}
.od-modal-dialog {
  position: relative;
  width: auto;
  max-width: 600px;
  margin: 0 auto;
}
.od-modal-content {
  position: relative;
  background-color: #fff;
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
  outline: 0;
  background-clip: padding-box;
}
.od-modal-header {
  padding: 15px;
  border-bottom: 1px solid #e5e5e5;
  min-height: 16.43px;
  position: relative;
}
.od-modal-title {
  margin: 0;
  font-size: 18px;
  line-height: 1.42857143;
  font-weight: 500;
  color: #333;
  padding-right: 24px;
}
.od-modal-close {
  position: absolute;
  top: 14px; right: 15px;
  padding: 0;
  background: transparent;
  border: 0;
  float: right;
  font-size: 21px;
  font-weight: 700;
  line-height: 1;
  color: #000;
  text-shadow: 0 1px 0 #fff;
  opacity: 0.2;
  cursor: pointer;
}
.od-modal-close:hover, .od-modal-close:focus { opacity: 0.5; outline: 0; }
.od-modal-body {
  position: relative;
  padding: 15px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}
.od-modal-body p { margin: 0 0 10px; }
.od-modal-list { margin: 4px 0 12px; padding-left: 20px; }
.od-modal-list li { margin-bottom: 4px; line-height: 1.5; }
.od-modal-note-secondary { margin-top: 12px !important; margin-bottom: 0 !important; font-size: 13px; line-height: 1.5; color: #777; }
.od-modal-note-secondary strong { font-weight: 600; color: #777; }
.od-modal-footer {
  padding: 15px;
  text-align: right;
  border-top: 1px solid #e5e5e5;
}
.od-modal-footer .btn + .btn { margin-left: 5px; }

@media (max-width: 480px) {
  .od-modal-footer { display: flex; flex-direction: column-reverse; gap: 8px; }
  .od-modal-footer .btn + .btn { margin-left: 0; }
  .od-modal-footer .btn { width: 100%; }
}
`;
