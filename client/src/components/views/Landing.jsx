import { useEffect, useState, useRef } from "react";

const services = [
  {
    title: "Table Booking",
    copy: "Guests browse venues, choose tables, and submit reservation requests without staff back-and-forth.",
    icon: "T",
    accent: "Book",
  },
  {
    title: "Operator Control",
    copy: "Admins review demand, confirm bookings, cancel conflicts, and keep every venue moving from one console.",
    icon: "O",
    accent: "Control",
  },
  {
    title: "Door Check-in",
    copy: "Confirmed reservations generate QR hashes so door teams can admit guests with a fast, clear workflow.",
    icon: "D",
    accent: "Entry",
  },
];

const workflow = [
  { label: "01", title: "Guest selects a table", meta: "Laklak BGC / VIP 1" },
  { label: "02", title: "Admin confirms booking", meta: "Pending → Confirmed" },
  { label: "03", title: "QR hash goes live", meta: "Ready for door staff" },
  { label: "04", title: "Guest checks in", meta: "Confirmed → Attended" },
];

const metrics = [
  { value: "30s", label: "Live refresh" },
  { value: "4", label: "Operator roles" },
  { value: "1", label: "Command center" },
];

/* smooth scroll helper */
const scrollTo = (id) => {
  const el = id === "top" ? document.body : document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

const Landing = ({ currentUser, onNavigate, getRouteForRole }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [activeSection, setActiveSection] = useState("");
  const signInRoute = currentUser ? getRouteForRole(currentUser) : "/login";
  const browseRoute = currentUser ? "/app/user" : "/login";

  /* scroll state for nav */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* close mobile menu on resize to desktop */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* active nav section tracking */
  useEffect(() => {
    const sectionIds = ["services", "flow", "contact"];
    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.4 }
      );
      io.observe(el);
      return io;
    });
    return () => observers.forEach((io) => io && io.disconnect());
  }, []);

  /* intersection observer — reveal on scroll */
  useEffect(() => {
    const targets = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, e.target.dataset.reveal]));
          }
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const reveal = (id) =>
    visibleSections.has(id) ? "lk-reveal visible" : "lk-reveal";

  return (
    <main className="lk-root">

      {/* ── NAV ── */}
      <nav className={`lk-nav${isScrolled ? " scrolled" : ""}`} aria-label="Public navigation">
        <div className="lk-nav-inner">
          {/* Logo → scrolls to top */}
          <button
            className="lk-logo lk-logo-btn"
            type="button"
            onClick={() => { scrollTo("top"); setMenuOpen(false); }}
            aria-label="Back to top"
          >
            Laklak
          </button>

          {/* Desktop nav links */}
          <div className="lk-nav-links lk-nav-links--desktop">
            {["services", "flow", "contact"].map((id) => (
              <button
                key={id}
                className={`lk-nav-link${activeSection === id ? " active" : ""}`}
                type="button"
                onClick={() => { scrollTo(id); setMenuOpen(false); }}
              >
                {id === "flow" ? "How It Works" : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>

          <div className="lk-nav-right">
            <button
              className="lk-btn-primary lk-nav-button"
              type="button"
              onClick={() => onNavigate(signInRoute)}
            >
              {currentUser ? "Dashboard" : "Sign In"}
            </button>
            <button
              className="lk-menu-toggle"
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={menuOpen ? "open" : ""} />
              <span className={menuOpen ? "open" : ""} />
              <span className={menuOpen ? "open" : ""} />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`lk-mobile-drawer${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
          <div className="lk-mobile-drawer-inner">
            {["services", "flow", "contact"].map((id) => (
              <button
                key={id}
                className={`lk-mobile-nav-link${activeSection === id ? " active" : ""}`}
                type="button"
                onClick={() => { scrollTo(id); setMenuOpen(false); }}
              >
                <span className="lk-mobile-nav-num">
                  {id === "services" ? "01" : id === "flow" ? "02" : "03"}
                </span>
                {id === "flow" ? "How It Works" : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <button
              className="lk-btn-primary lk-btn-glow lk-mobile-cta"
              type="button"
              onClick={() => { onNavigate(signInRoute); setMenuOpen(false); }}
            >
              {currentUser ? "Dashboard" : "Sign In"}
              <span className="lk-btn-arrow">→</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lk-hero" id="top">
        <div className="lk-hero-bg" />
        <div className="lk-hero-grid" />
        <div className="lk-hero-glow lk-hero-glow--a" />
        <div className="lk-hero-glow lk-hero-glow--b" />
        <div className="lk-noise" aria-hidden="true" />
        <div className="lk-hero-lines" aria-hidden="true">
          <span /><span /><span />
        </div>

        <div className="lk-hero-content">
          <div className="lk-hero-text">

            <div className="lk-kicker lk-hero-kicker">
              <span className="lk-kicker-dot" />
              <span className="lk-kicker-dot" />
              <span className="lk-kicker-dot" />
              Now live in BGC &amp; Makati
            </div>

            <h1>
              Precision Control for <em>Philippine Nightlife.</em>
            </h1>

            <p className="lk-hero-copy">
              The all-in-one command center for BGC and Makati venues.
              Manage table inventory, verify guests, and sync your door team in real-time.
            </p>

            <div className="lk-actions">
              <button className="lk-btn-primary lk-btn-glow" type="button" onClick={() => onNavigate(signInRoute)}>
                {currentUser ? "Open Dashboard" : "Get Started"}
                <span className="lk-btn-arrow">→</span>
              </button>
              <button className="lk-btn-secondary" type="button" onClick={() => onNavigate(browseRoute)}>
                View Venues
              </button>
            </div>

            <div className="lk-trust-bar">
              <span className="lk-trust-chip">Table Booking</span>
              <span className="lk-trust-dot" />
              <span className="lk-trust-chip">QR Check-in</span>
              <span className="lk-trust-dot" />
              <span className="lk-trust-chip">Live Ops</span>
            </div>
          </div>
        </div>

        <div className="lk-scroll-indicator" onClick={() => scrollTo("services")} role="button" tabIndex={0}>
          <span className="lk-scroll-line" />
          Scroll
        </div>
      </section>

      {/* ── MARQUEE TICKER ── */}
      <div className="lk-ticker" aria-hidden="true">
        <div className="lk-ticker-track">
          {Array(3).fill(["Table Booking", "Admin Control", "QR Check-in", "Live Inventory", "Operator Dashboard", "Door Flow"]).flat().map((t, i) => (
            <span key={i} className="lk-ticker-item">
              <span className="lk-ticker-dot" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── INTRO ── */}
      <section className="lk-intro" id="services" data-reveal="intro">
        <div className={reveal("intro")}>
          <p className="lk-section-label">
            <span />
            What Laklak Handles
          </p>
          <h2>One operating layer for reservation-heavy nights.</h2>
        </div>
        <p className={reveal("intro")} style={{ transitionDelay: "0.1s" }}>
          Laklak keeps guest requests, operator decisions, and door activity in one
          connected flow so teams can move faster when the room fills up.
        </p>
      </section>

      {/* ── SERVICES ── */}
      <section className="lk-services" aria-label="Laklak services">
        {services.map((service, index) => (
          <article
            className="lk-service-card"
            key={service.title}
            data-reveal={`svc-${index}`}
          >
            <div className={`lk-service-card-inner ${reveal(`svc-${index}`)}`} style={{ transitionDelay: `${index * 0.08}s` }}>
              <div className="lk-service-top">
                <div className="lk-service-icon">{service.icon}</div>
                <span className="lk-service-accent">{service.accent}</span>
              </div>
              <p className="lk-service-number">0{index + 1}</p>
              <h3>{service.title}</h3>
              <p>{service.copy}</p>
              <div className="lk-service-arrow">↗</div>
            </div>
          </article>
        ))}
      </section>

      {/* ── WORKFLOW ── */}
      <section className="lk-work" id="flow" data-reveal="flow">
        <div className={`lk-work-copy ${reveal("flow")}`}>
          <p className="lk-section-label">
            <span />
            Booking Flow
          </p>
          <h2>From table request to door check-in.</h2>
          <p>
            The public side stays simple for guests. The operator side gives venue teams
            a calm, fast surface for every status change.
          </p>

          {/* status pill demo */}
          <div className="lk-status-demo">
            <span className="lk-status lk-status--pending">Pending</span>
            <span className="lk-status-arrow">→</span>
            <span className="lk-status lk-status--confirmed">Confirmed</span>
            <span className="lk-status-arrow">→</span>
            <span className="lk-status lk-status--attended">Attended</span>
          </div>
        </div>

        <div className={`lk-work-list ${reveal("flow")}`} style={{ transitionDelay: "0.1s" }}>
          {workflow.map((item, i) => (
            <div className="lk-work-item" key={item.label} style={{ transitionDelay: `${i * 0.07}s` }}>
              <span>{item.label}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.meta}</p>
              </div>
              <div className="lk-work-dot" />
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="lk-stats" aria-label="Laklak platform numbers" data-reveal="stats">
        {metrics.map((metric, i) => (
          <div className={`lk-stat ${reveal("stats")}`} key={metric.label} style={{ transitionDelay: `${i * 0.1}s` }}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </section>

      {/* ── QUOTE ── */}
      <section className="lk-quote" data-reveal="quote">
        <div className={reveal("quote")}>
          <div className="lk-quote-mark">"</div>
          <p>
            Laklak gives the floor team one shared picture of the night: what is pending,
            what is confirmed, and who is already through the door.
          </p>
          <span>Built for venue operators, club admins, and door teams.</span>
        </div>
      </section>

      {/* ── CONTACT CTA ── */}
      <section className="lk-contact" id="contact" data-reveal="contact">
        <div className={`lk-contact-inner ${reveal("contact")}`}>
          <p className="lk-section-label">
            <span />
            Ready When Doors Open
          </p>
          <h2>Start with the local dashboard, then shape the public booking experience.</h2>
          <div className="lk-contact-actions">
            <button className="lk-btn-primary lk-btn-glow" type="button" onClick={() => onNavigate(signInRoute)}>
              {currentUser ? "Open Dashboard" : "Sign In to Laklak"}
              <span className="lk-btn-arrow">→</span>
            </button>
            <button className="lk-btn-secondary" type="button" onClick={() => scrollTo("services")}>
              See Features
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lk-footer">

        {/* CTA Banner */}
        <div className="lk-footer-cta">
          <div>
            <p className="lk-footer-cta-label">Ready when doors open</p>
            <p className="lk-footer-cta-heading">Start managing your venue tonight.</p>
          </div>
          <button className="lk-btn-primary lk-btn-glow" type="button" onClick={() => onNavigate(signInRoute)}>
            {currentUser ? "Open Dashboard" : "Sign In to Laklak"}
            <span className="lk-btn-arrow">→</span>
          </button>
        </div>

        <div className="lk-footer-body">

          {/* Brand column */}
          <div className="lk-footer-brand">
            <button className="lk-logo lk-logo-btn lk-footer-logo" type="button" onClick={() => scrollTo("top")}>
              Lak<span className="lk-logo-accent">lak</span>
            </button>
            <p className="lk-footer-tagline">Philippine Nightlife OS</p>
            <p className="lk-footer-desc">
              Table booking, operator control, and QR door check-in — built for clubs
              that run late.
            </p>

            {/* Social icons */}
            <div className="lk-footer-socials">
              {[
                { label: "Twitter / X", path: "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" },
                { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" },
                { label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
              ].map(({ label, path }) => (
                <button key={label} className="lk-social-btn" type="button" aria-label={label}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d={path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="lk-footer-cols">
            {[
              {
                label: "Product",
                links: [
                  { text: "Features", action: () => scrollTo("services") },
                  { text: "Pricing", href: "#pricing" },
                  { text: "Venues", href: "#venues" },
                  { text: "Operators", href: "#operators" },
                ],
              },
              {
                label: "Platform",
                links: [
                  { text: "Table Booking", action: () => scrollTo("services") },
                  { text: "Door Check-in", action: () => scrollTo("services") },
                  { text: "QR System", href: "#qr" },
                  { text: "Dashboard", action: () => onNavigate(signInRoute) },
                ],
              },
              {
                label: "Company",
                links: [
                  { text: "About", href: "#about" },
                  { text: "Contact", action: () => scrollTo("contact") },
                  { text: "Careers", href: "#careers" },
                  { text: "Blog", href: "#blog" },
                ],
              },
              {
                label: "Legal",
                links: [
                  { text: "Privacy Policy", href: "#privacy" },
                  { text: "Terms of Service", href: "#terms" },
                  { text: "Cookies", href: "#cookies" },
                ],
              },
            ].map(({ label, links }) => (
              <div className="lk-footer-col" key={label}>
                <p className="lk-footer-col-label">{label}</p>
                {links.map(({ text, href, action }) =>
                  action ? (
                    <button key={text} className="lk-footer-link" type="button" onClick={action}>
                      {text}
                    </button>
                  ) : (
                    <a key={text} href={href} className="lk-footer-link">
                      {text}
                    </a>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lk-footer-divider" />

        {/* Bottom bar — centered copyright */}
        <div className="lk-footer-bottom">
          <span className="lk-footer-copy">© 2026 Laklak. All rights reserved.</span>
        </div>

      </footer>
    </main>
  );
};

export default Landing;