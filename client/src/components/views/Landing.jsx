import { useEffect, useRef, useState } from "react";

// --- MOCK DATABASE ---
const dbClubs = [
  { id: 1, name: "XYLO at The Palace" },
  { id: 2, name: "Revel at The Palace" },
  { id: 3, name: "The Island" },
  { id: 4, name: "Bank Bar" },
  { id: 5, name: "Yes Please" },
  { id: 6, name: "Sanctuary" },
];

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

/* ── CINEMATIC NEURAL WEB — FULL-BLEED 3D OVERFLOW ── */
const NeuralWeb = ({ clubs = [] }) => {
  const canvasRef = useRef(null);
  const tooltipRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId;
    let t = 0;
    let mouseX = 0, mouseY = 0;
    let targetRotY = 0, targetRotX = 0;
    let rotY = 0, rotX = 0;
    let hoveredIdx = null;

    // ── SIZING: canvas covers the full hero section
    const heroEl = canvas.closest(".lk-hero") || canvas.parentElement?.parentElement;

    const resize = () => {
      const w = heroEl ? heroEl.offsetWidth : window.innerWidth;
      const h = heroEl ? heroEl.offsetHeight : window.innerHeight;
      canvas.width = w * Math.min(window.devicePixelRatio, 2);
      canvas.height = h * Math.min(window.devicePixelRatio, 2);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(Math.min(window.devicePixelRatio, 2), Math.min(window.devicePixelRatio, 2));
      stateRef.current.W = w;
      stateRef.current.H = h;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── 3D MATH HELPERS
    const project = (x3, y3, z3, W, H) => {
      const fov = 520;
      const camZ = 7;
      const dz = camZ - z3;
      if (dz <= 0.01) return null;
      const scale = fov / dz;
      return { x: W / 2 + x3 * scale, y: H / 2 - y3 * scale, scale, sizeScale: (1 / dz) * 60 };
    };

    const rotatePoint = (x, y, z, rX, rY) => {
      const cosY = Math.cos(rY), sinY = Math.sin(rY);
      let x1 = x * cosY + z * sinY;
      let z1 = -x * sinY + z * cosY;
      const cosX = Math.cos(rX), sinX = Math.sin(rX);
      let y1 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;
      return { x: x1, y: y1, z: z2 };
    };

    // ── NODE DEFINITIONS
    const safeClubsCount = (clubs && Array.isArray(clubs)) ? clubs.length : 0;
    const baseNodes = [
      { x: 0, y: 0, z: 0, r: 0.22, isCore: true },
      { x: -4.2, y: 1.8, z: -1.2, r: 0.10, depth: "bg" },
      { x: 3.9, y: 2.3, z: 0.8, r: 0.13, depth: "fg" },
      { x: -3.1, y: -2.7, z: 0.4, r: 0.11, depth: "mid" },
      { x: 4.5, y: -1.4, z: -0.9, r: 0.09, depth: "bg" },
      { x: 0.8, y: 3.8, z: 1.1, r: 0.12, depth: "fg" },
      { x: -1.2, y: -3.6, z: -1.4, r: 0.10, depth: "bg" },
      { x: 5.8, y: 0.5, z: -0.5, r: 0.07, depth: "bg" },
      { x: -5.5, y: -0.8, z: 0.3, r: 0.08, depth: "mid" },
      { x: 2.1, y: -4.2, z: 1.2, r: 0.09, depth: "fg" },
      { x: -2.8, y: 4.0, z: -0.7, r: 0.08, depth: "bg" },
      { x: 1.5, y: 1.2, z: 2.2, r: 0.11, depth: "fg" },
    ].slice(0, 1 + safeClubsCount);

    const pulses = baseNodes.slice(1).map((node, i) => ({
      nodeIdx: i + 1,
      t: i / (baseNodes.length - 1),
      speed: 0.55 + i * 0.04,
      active: true,
    }));

    const particles = Array.from({ length: 80 }, () => ({
      x: (Math.random() - 0.5) * 14, y: (Math.random() - 0.5) * 10, z: (Math.random() - 0.5) * 5,
      bx: (Math.random() - 0.5) * 14, by: (Math.random() - 0.5) * 10, bz: (Math.random() - 0.5) * 5,
      phase: Math.random() * Math.PI * 2,
    }));

    const glowCache = {};
    const getGlow = (radius, r, g, b, alpha) => {
      const key = `${radius}-${r}-${g}-${b}-${alpha}`;
      if (glowCache[key]) return glowCache[key];
      const size = radius * 2;
      const gc = document.createElement("canvas");
      gc.width = gc.height = size;
      const gx = gc.getContext("2d");
      const grad = gx.createRadialGradient(radius, radius, 0, radius, radius, radius);
      grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.25, `rgba(${r},${g},${b},${alpha * 0.6})`);
      grad.addColorStop(0.55, `rgba(${r},${g},${b},${alpha * 0.18})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      gx.fillStyle = grad;
      gx.fillRect(0, 0, size, size);
      glowCache[key] = gc;
      return gc;
    };

    const drawNode = (px, py, pscale, radius, isCore, isHovered, pulseAmp) => {
      const r = radius * pscale;
      if (r < 0.5) return;
      ctx.save();
      const bloomR = r * (isCore ? 9 : 6) * (1 + pulseAmp * 0.4);
      const bloom = getGlow(Math.ceil(bloomR * 2), 191, 255, 71, isCore ? 0.55 : (isHovered ? 0.5 : 0.28));
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(bloom, px - bloomR, py - bloomR, bloomR * 2, bloomR * 2);
      if (isCore || isHovered) {
        const bloom2 = getGlow(Math.ceil(bloomR * 3), 191, 255, 71, 0.12);
        ctx.drawImage(bloom2, px - bloomR * 1.5, py - bloomR * 1.5, bloomR * 3, bloomR * 3);
      }
      ctx.globalCompositeOperation = "source-over";
      const sphere = ctx.createRadialGradient(px - r * 0.3, py - r * 0.35, r * 0.05, px, py, r);
      if (isCore) {
        sphere.addColorStop(0, `rgba(230,255,140,1)`);
        sphere.addColorStop(0.3, `rgba(191,255,71,0.95)`);
        sphere.addColorStop(0.7, `rgba(100,160,20,0.85)`);
        sphere.addColorStop(1, `rgba(30,60,5,0.7)`);
      } else {
        sphere.addColorStop(0, `rgba(220,255,160,${isHovered ? 1 : 0.95})`);
        sphere.addColorStop(0.35, `rgba(191,255,71,${isHovered ? 0.9 : 0.8})`);
        sphere.addColorStop(0.75, `rgba(80,130,15,0.7)`);
        sphere.addColorStop(1, `rgba(15,35,3,0.5)`);
      }
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fillStyle = sphere; ctx.fill();
      const spec = ctx.createRadialGradient(px - r * 0.28, py - r * 0.32, 0, px - r * 0.2, py - r * 0.22, r * 0.45);
      spec.addColorStop(0, `rgba(255,255,255,${isCore ? 0.9 : 0.75})`);
      spec.addColorStop(0.5, `rgba(255,255,255,0.15)`); spec.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fillStyle = spec; ctx.fill();
      const rim = ctx.createRadialGradient(px + r * 0.35, py + r * 0.38, r * 0.3, px + r * 0.2, py + r * 0.2, r);
      rim.addColorStop(0, `rgba(120,220,0,${isCore ? 0.45 : 0.28})`);
      rim.addColorStop(0.6, `rgba(80,180,0,0.08)`); rim.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fillStyle = rim; ctx.fill();
      if (isCore) {
        ctx.save(); ctx.translate(px, py); ctx.scale(1, 0.22);
        ctx.beginPath(); ctx.arc(0, 0, r * 1.55, 0, Math.PI * 2); ctx.strokeStyle = `rgba(191,255,71,${0.28 + pulseAmp * 0.25})`; ctx.lineWidth = 0.9 * pscale; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, r * 2.1, 0, Math.PI * 2); ctx.strokeStyle = `rgba(191,255,71,${0.1 + pulseAmp * 0.1})`; ctx.lineWidth = 0.5 * pscale; ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    };

    const drawLaserPulse = (x0, y0, x1, y1, progress, z0scale, z1scale) => {
      if (progress < 0 || progress > 1) return;
      const px = x0 + (x1 - x0) * progress;
      const py = y0 + (y1 - y0) * progress;
      const pscale = z0scale + (z1scale - z0scale) * progress;
      const fade = progress < 0.08 ? progress / 0.08 : progress > 0.88 ? (1 - progress) / 0.12 : 1;
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      const headR = Math.max(1, 5 * pscale * fade);
      const head = getGlow(Math.ceil(headR * 4), 220, 255, 120, 0.95 * fade);
      ctx.drawImage(head, px - headR * 2, py - headR * 2, headR * 4, headR * 4);
      const innerR = Math.max(0.8, 2.8 * pscale * fade);
      const inner = getGlow(Math.ceil(innerR * 3), 255, 255, 240, 1.0 * fade);
      ctx.drawImage(inner, px - innerR * 1.5, py - innerR * 1.5, innerR * 3, innerR * 3);
      const tailLen = 0.12; const t0 = Math.max(0, progress - tailLen);
      const tx0 = x0 + (x1 - x0) * t0; const ty0 = y0 + (y1 - y0) * t0;
      const angle = Math.atan2(py - ty0, px - tx0);
      const tailDist = Math.sqrt((px - tx0) ** 2 + (py - ty0) ** 2);
      if (tailDist > 1) {
        const beam = ctx.createLinearGradient(tx0, ty0, px, py);
        beam.addColorStop(0, `rgba(120,220,0,0)`); beam.addColorStop(0.4, `rgba(160,255,40,${0.18 * fade})`);
        beam.addColorStop(0.75, `rgba(200,255,80,${0.55 * fade})`); beam.addColorStop(1, `rgba(240,255,150,${0.9 * fade})`);
        ctx.save(); ctx.translate(tx0, ty0); ctx.rotate(angle); ctx.beginPath();
        ctx.moveTo(0, -1.2 * pscale); ctx.lineTo(tailDist, -0.4 * pscale); ctx.lineTo(tailDist, 0.4 * pscale); ctx.lineTo(0, 1.2 * pscale);
        ctx.closePath(); ctx.fillStyle = beam; ctx.fill(); ctx.restore();
      }
      ctx.restore();
    };

    const testHover = (mx, my) => {
      const { W, H } = stateRef.current;
      if (!W) return null;
      for (let i = 1; i < baseNodes.length; i++) {
        const n = baseNodes[i];
        const animated = { x: n.x + Math.sin(t * 0.7 + i * 1.3) * 0.07, y: n.y + Math.cos(t * 0.9 + i * 0.85) * 0.07, z: n.z + Math.sin(t * 0.5 + i * 0.6) * 0.05 };
        const rp = rotatePoint(animated.x, animated.y, animated.z, rotX, rotY);
        const p = project(rp.x, rp.y, rp.z, W, H);
        if (!p) continue;
        // Also fix the hover radius check here to use sizeScale
        const r = n.r * p.sizeScale * 3.5;
        if ((mx - p.x) ** 2 + (my - p.y) ** 2 < r * r) return i - 1;
      }
      return null;
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const { W, H } = stateRef.current;
      if (!W) return;
      targetRotY = ((mx / W) - 0.5) * 1.1;
      targetRotX = ((my / H) - 0.5) * 0.55;
      mouseX = mx; mouseY = my;
      const hit = testHover(mx, my);
      hoveredIdx = hit;
      const tip = tooltipRef.current;
      if (tip) {
        if (hit !== null) {
          tip.textContent = clubs[hit]?.name || "";
          tip.style.opacity = "1";
          tip.style.left = (mx + 18) + "px";
          tip.style.top = (my - 10) + "px";
        } else {
          tip.style.opacity = "0";
        }
      }
    };

    const onMouseLeave = () => {
      targetRotY = 0; targetRotX = 0; hoveredIdx = null;
      if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      t += 0.008; rotY += (targetRotY - rotY) * 0.04; rotX += (targetRotX - rotX) * 0.04;
      const { W, H } = stateRef.current;
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);

      const corePulse = 1 + Math.sin(t * 2.2) * 0.06;
      const projNodes = baseNodes.map((n, i) => {
        const ax = n.x + (n.isCore ? 0 : Math.sin(t * 0.65 + i * 1.31) * 0.08);
        const ay = n.y + (n.isCore ? 0 : Math.cos(t * 0.88 + i * 0.79) * 0.08);
        const az = n.z + (n.isCore ? 0 : Math.sin(t * 0.52 + i * 0.61) * 0.06);
        const rp = rotatePoint(ax, ay, az, rotX, rotY + t * 0.06);
        const p = project(rp.x, rp.y, rp.z, W, H);
        return p ? { ...p, n, i } : null;
      });

      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        const px = p.bx + Math.cos(t * 0.38 + p.phase) * 0.12;
        const py = p.by + Math.sin(t * 0.31 + p.phase) * 0.12;
        const rp = rotatePoint(px, py, p.bz, rotX * 0.25, (rotY + t * 0.03) * 0.4);
        const proj = project(rp.x, rp.y, rp.z, W, H);
        if (!proj) continue;
        const alpha = 0.18 + Math.sin(t * 0.9 + p.phase) * 0.1;
        ctx.beginPath(); ctx.arc(proj.x, proj.y, Math.max(0.5, 0.3 * proj.sizeScale), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(191,255,71,${alpha})`; ctx.fill();
      }
      ctx.restore();

      const coreProj = projNodes[0];
      if (coreProj) {
        pulses?.forEach((pulse) => {
          pulse.t += pulse.speed * 0.010;
          if (pulse.t > 1.18) pulse.t = -0.05;
          const progress = Math.max(0, Math.min(1, pulse.t));
          if (pulse.t < 0 || pulse.t > 1) return;
          const nodeProj = projNodes[pulse.nodeIdx];
          if (!nodeProj) return;
          drawLaserPulse(coreProj.x, coreProj.y, nodeProj.x, nodeProj.y, progress, coreProj.sizeScale, nodeProj.sizeScale);
        });
      }

      const sorted = projNodes.filter(Boolean).sort((a, b) => a.scale - b.scale);
      for (const pn of sorted) {
        const { x, y, sizeScale, n, i } = pn;
        if (n.isCore) continue;
        drawNode(x, y, sizeScale, n.r * sizeScale, false, hoveredIdx === i - 1, (1 + Math.sin(t * 1.9 + i * 0.7) * 0.07) - 1);
      }

      if (coreProj) {
        const cr = baseNodes[0].r * coreProj.sizeScale;
        const actualR = cr * coreProj.sizeScale;
        drawNode(coreProj.x, coreProj.y, coreProj.sizeScale, cr, true, false, corePulse - 1);
        
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        const ringAlpha = 0.12 + (corePulse - 1) * 2.5; 
        const ringR = actualR * (1.8 + (corePulse - 1) * 4);
        const rGrad = ctx.createRadialGradient(coreProj.x, coreProj.y, actualR * 0.8, coreProj.x, coreProj.y, ringR);
        rGrad.addColorStop(0, `rgba(191,255,71,${ringAlpha})`); rGrad.addColorStop(1, `rgba(191,255,71,0)`);
        ctx.beginPath(); ctx.arc(coreProj.x, coreProj.y, ringR, 0, Math.PI * 2); ctx.fillStyle = rGrad; ctx.fill(); ctx.restore();
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, [clubs]);

  return (
    <>
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "auto", zIndex: 2, cursor: "crosshair" }} />
      <div
        ref={tooltipRef}
        style={{
          position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 10,
          background: "rgba(6,8,6,0.92)", border: "1px solid rgba(191,255,71,0.35)",
          color: "#bfff47", padding: "5px 13px", fontSize: "11px", fontWeight: 700,
          borderRadius: "2px", letterSpacing: "0.12em", fontFamily: "inherit",
          opacity: 0, transition: "opacity 0.18s", whiteSpace: "nowrap",
          textTransform: "uppercase", boxShadow: "0 0 12px rgba(191,255,71,0.2)",
        }}
      />
    </>
  );
};

const Landing = ({ currentUser, onNavigate, getRouteForRole }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [activeSection, setActiveSection] = useState("");
  const signInRoute = currentUser ? getRouteForRole(currentUser) : "/login";
  const browseRoute = currentUser ? "/app/user" : "/login";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* Fixed IntersectionObserver threshold */
  useEffect(() => {
    const sectionIds = ["services", "flow", "contact"];
    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.15, rootMargin: "-10% 0px -40% 0px" } 
      );
      io.observe(el);
      return io;
    });
    return () => observers.forEach((io) => io && io.disconnect());
  }, []);

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

  const reveal = (id) => (visibleSections.has(id) ? "lk-reveal visible" : "lk-reveal");

  return (
    <main className="lk-root">
      <nav className={`lk-nav${isScrolled ? " scrolled" : ""}`} aria-label="Public navigation">
        <div className="lk-nav-inner">
          <button className="lk-logo lk-logo-btn" type="button" onClick={() => { scrollTo("top"); setMenuOpen(false); }} aria-label="Back to top">
            Laklak
          </button>

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
            <button className="lk-btn-primary lk-nav-button" type="button" onClick={() => onNavigate(signInRoute)}>
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

        <div className={`lk-mobile-drawer${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
          <div className="lk-mobile-drawer-inner">
            {["services", "flow", "contact"].map((id) => (
              <button
                key={id}
                className={`lk-mobile-nav-link${activeSection === id ? " active" : ""}`}
                type="button"
                onClick={() => { scrollTo(id); setMenuOpen(false); }}
              >
                <span className="lk-mobile-nav-num">{id === "services" ? "01" : id === "flow" ? "02" : "03"}</span>
                {id === "flow" ? "How It Works" : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <button className="lk-btn-primary lk-btn-glow lk-mobile-cta" type="button" onClick={() => { onNavigate(signInRoute); setMenuOpen(false); }}>
              {currentUser ? "Dashboard" : "Sign In"}
              <span className="lk-btn-arrow">→</span>
            </button>
          </div>
        </div>
      </nav>

      <section className="lk-hero" id="top" style={{ position: "relative", overflow: "hidden" }}>
        {/* Pass clubs gracefully to prevent errors */}
        <NeuralWeb clubs={dbClubs || []} />

        <div className="lk-hero-bg" />
        <div className="lk-hero-grid" />
        <div className="lk-hero-glow lk-hero-glow--a" />
        <div className="lk-hero-glow lk-hero-glow--b" />
        <div className="lk-noise" aria-hidden="true" />
        <div className="lk-hero-lines" aria-hidden="true">
          <span /><span /><span />
        </div>

        <div className="lk-hero-content" style={{ position: "relative", zIndex: 3, pointerEvents: "none" }}>
          <div className="lk-hero-text" style={{ pointerEvents: "auto" }}>
            <h1>Precision Control for <em>Philippine Nightlife.</em></h1>
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
          <div className="lk-hero-visual" style={{ pointerEvents: "none" }} />
        </div>

        {/* Changed to a button element for accessibility */}
        <button 
          className="lk-scroll-indicator" 
          onClick={() => scrollTo("services")} 
          type="button"
          style={{ background: "none", border: "none", padding: 0 }}
        >
          <span className="lk-scroll-line" />
          Scroll
        </button>
      </section>

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

      <section className="lk-intro" id="services" data-reveal="intro">
        <div className={reveal("intro")}>
          <p className="lk-section-label"><span />What Laklak Handles</p>
          <h2>One operating layer for reservation-heavy nights.</h2>
        </div>
        <p className={reveal("intro")} style={{ transitionDelay: "0.1s" }}>
          Laklak keeps guest requests, operator decisions, and door activity in one
          connected flow so teams can move faster when the room fills up.
        </p>
      </section>

      <section className="lk-services" aria-label="Laklak services">
        {/* Optional chaining added */}
        {services?.map((service, index) => (
          <article className="lk-service-card" key={service.title} data-reveal={`svc-${index}`}>
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

      <section className="lk-work" id="flow" data-reveal="flow">
        <div className={`lk-work-copy ${reveal("flow")}`}>
          <p className="lk-section-label"><span />Booking Flow</p>
          <h2>From table request to door check-in.</h2>
          <p>
            The public side stays simple for guests. The operator side gives venue teams
            a calm, fast surface for every status change.
          </p>
          <div className="lk-status-demo">
            <span className="lk-status lk-status--pending">Pending</span>
            <span className="lk-status-arrow">→</span>
            <span className="lk-status lk-status--confirmed">Confirmed</span>
            <span className="lk-status-arrow">→</span>
            <span className="lk-status lk-status--attended">Attended</span>
          </div>
        </div>

        <div className={`lk-work-list ${reveal("flow")}`} style={{ transitionDelay: "0.1s" }}>
          {/* Optional chaining added */}
          {workflow?.map((item, i) => (
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

      <section className="lk-stats" aria-label="Laklak platform numbers" data-reveal="stats">
        {/* Optional chaining added */}
        {metrics?.map((metric, i) => (
          <div className={`lk-stat ${reveal("stats")}`} key={metric.label} style={{ transitionDelay: `${i * 0.1}s` }}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </section>

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

      <section className="lk-contact" id="contact" data-reveal="contact">
        <div className={`lk-contact-inner ${reveal("contact")}`}>
          <p className="lk-section-label"><span />Ready When Doors Open</p>
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

      <footer className="lk-footer">
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
          <div className="lk-footer-brand">
            <button className="lk-logo lk-logo-btn lk-footer-logo" type="button" onClick={() => scrollTo("top")}>
              Lak<span className="lk-logo-accent">lak</span>
            </button>
            <p className="lk-footer-tagline">Philippine Nightlife OS</p>
            <p className="lk-footer-desc">
              Table booking, operator control, and QR door check-in — built for clubs that run late.
            </p>
            <div className="lk-footer-socials">
              {/* Full SVGs Restored */}
              {[
                { label: "Twitter", path: "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" },
                { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" },
                { label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
              ].map(({ label, path }) => (
                <button key={label} className="lk-social-btn" type="button" aria-label={label}>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d={path} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="lk-footer-cols">
            {[
              { label: "Product", links: [{ text: "Features", action: () => scrollTo("services") }, { text: "Pricing", href: "#pricing" }] },
              { label: "Platform", links: [{ text: "Table Booking", action: () => scrollTo("services") }, { text: "Dashboard", action: () => onNavigate(signInRoute) }] },
              { label: "Company", links: [{ text: "About", href: "#about" }, { text: "Contact", action: () => scrollTo("contact") }] },
              { label: "Legal", links: [{ text: "Privacy Policy", href: "#privacy" }, { text: "Terms", href: "#terms" }] },
            ].map(({ label, links }) => (
              <div className="lk-footer-col" key={label}>
                <p className="lk-footer-col-label">{label}</p>
                {/* Optional chaining added */}
                {links?.map(({ text, href, action }) =>
                  action ? (
                    <button key={text} className="lk-footer-link" type="button" onClick={action}>{text}</button>
                  ) : (
                    <a key={text} href={href} className="lk-footer-link">{text}</a>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lk-footer-divider" />

        <div className="lk-footer-bottom">
          <span className="lk-footer-copy">© 2026 Laklak. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
};

export default Landing;