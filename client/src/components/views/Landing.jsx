import { useEffect, useState } from "react";

const services = [
  {
    title: "Table Booking",
    copy: "Guests browse venues, choose tables, and submit reservation requests without staff back-and-forth.",
    icon: "T",
  },
  {
    title: "Operator Control",
    copy: "Admins review demand, confirm bookings, cancel conflicts, and keep every venue moving from one console.",
    icon: "O",
  },
  {
    title: "Door Check-in",
    copy: "Confirmed reservations generate QR hashes so door teams can admit guests with a fast, clear workflow.",
    icon: "D",
  },
];

const workflow = [
  { label: "01", title: "Guest selects a table", meta: "Laklak BGC / VIP 1" },
  { label: "02", title: "Admin confirms booking", meta: "Pending to confirmed" },
  { label: "03", title: "QR hash goes live", meta: "Ready for door staff" },
  { label: "04", title: "Guest checks in", meta: "Confirmed to attended" },
];

const metrics = [
  { value: "30s", label: "Live refresh" },
  { value: "4", label: "Operator roles" },
  { value: "1", label: "Command center" },
];

const Landing = ({ currentUser, onNavigate, getRouteForRole }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const signInRoute = currentUser ? getRouteForRole(currentUser) : "/login";
  const browseRoute = currentUser ? "/app/user" : "/login";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="lk-root">
      <section className="lk-hero" id="top">
        <div className="lk-hero-bg" />
        <div className="lk-hero-grid" />
        <div className="lk-hero-glow" />
        <div className="lk-noise" aria-hidden="true" />

        // Ensure this is inside your Landing component return
        <nav className={isScrolled ? "lk-nav scrolled" : "lk-nav"} aria-label="Public navigation">
          <div className="lk-logo">Laklak</div>

          <div className="lk-nav-links">
            <a href="#services" className="lk-nav-link">Services</a>
            <a href="#flow" className="lk-nav-link">Flow</a>
            <a href="#contact" className="lk-nav-link">Contact</a>
          </div>

          <button
            className="lk-btn-primary lk-nav-button"
            type="button"
            onClick={() => onNavigate(signInRoute)}
          >
            {currentUser ? "Dashboard" : "Sign In"}
          </button>
        </nav>

        <div className="lk-hero-content">
          <p className="lk-kicker">
            <span />
            Laklak Nightlife Systems
          </p>
          <h1>
            Bookings, approvals, <span>and door flow</span> for clubs that run late.
          </h1>
          <p className="lk-hero-copy">
            A reservation platform for Philippine nightlife operators: customer table
            browsing, admin confirmation, live venue inventory, and QR-assisted check-in.
          </p>
          <div className="lk-actions">
            <button className="lk-btn-primary" type="button" onClick={() => onNavigate(signInRoute)}>
              {currentUser ? "Go to Dashboard" : "Sign In to Laklak"}
            </button>
            <button className="lk-btn-secondary" type="button" onClick={() => onNavigate(browseRoute)}>
              Browse Tables
            </button>
          </div>
        </div>

        <div className="lk-scroll-indicator">Scroll</div>
      </section>

      <section className="lk-intro" id="services">
        <div>
          <p className="lk-section-label">
            <span />
            What Laklak Handles
          </p>
          <h2>One operating layer for reservation-heavy nights.</h2>
        </div>
        <p>
          Laklak keeps guest requests, operator decisions, and door activity in one
          connected flow so teams can move faster when the room fills up.
        </p>
      </section>

      <section className="lk-services" aria-label="Laklak services">
        {services.map((service, index) => (
          <article className="lk-service-card" key={service.title}>
            <div className="lk-service-icon">{service.icon}</div>
            <p className="lk-service-number">0{index + 1}</p>
            <h3>{service.title}</h3>
            <p>{service.copy}</p>
          </article>
        ))}
      </section>

      <section className="lk-work" id="flow">
        <div className="lk-work-copy">
          <p className="lk-section-label">
            <span />
            Booking Flow
          </p>
          <h2>From table request to door check-in.</h2>
          <p>
            The public side stays simple for guests. The operator side gives venue teams
            a calm, fast surface for every status change.
          </p>
        </div>

        <div className="lk-work-list">
          {workflow.map((item) => (
            <div className="lk-work-item" key={item.label}>
              <span>{item.label}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lk-stats" aria-label="Laklak platform numbers">
        {metrics.map((metric) => (
          <div className="lk-stat" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </section>

      <section className="lk-quote">
        <div>
          <p>
            "Laklak gives the floor team one shared picture of the night: what is pending,
            what is confirmed, and who is already through the door."
          </p>
          <span>Built for venue operators, club admins, and door teams.</span>
        </div>
      </section>

      <section className="lk-contact" id="contact">
        <p className="lk-section-label">
          <span />
          Ready When Doors Open
        </p>
        <h2>Start with the local dashboard, then shape the public booking experience.</h2>
        <button className="lk-btn-primary" type="button" onClick={() => onNavigate(signInRoute)}>
          {currentUser ? "Open Dashboard" : "Sign In to Laklak"}
        </button>
      </section>

      <footer className="lk-footer">
        <div className="lk-footer-grid">
          <div className="lk-footer-brand">
            <div className="lk-logo">Laklak</div>
            <p>© 2026 Philippine Nightlife Systems.<br />All rights reserved.</p>
          </div>
          <div className="lk-footer-col">
            <strong>Product</strong>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#venues">Venues</a>
          </div>
          <div className="lk-footer-col">
            <strong>Company</strong>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#careers">Careers</a>
          </div>
          <div className="lk-footer-col">
            <strong>Legal</strong>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;