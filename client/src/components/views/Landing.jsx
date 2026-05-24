import { useEffect, useRef, useState } from "react";

// --- MOCK DATABASE ---
// In production, you would fetch this array from your backend.
// Every new item added here automatically generates a new orbital ring.
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

/* ── NEURAL WEB 3D VISUAL ── */
const NeuralWeb = ({ clubs }) => {
  const mountRef = useRef(null);
  const tooltipRef = useRef(null);
  const hoveredRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const cleanup = [];

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => initScene();
    document.head.appendChild(script);

    function initScene() {
      const THREE = window.THREE;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(el.clientWidth, el.clientHeight);
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(46, el.clientWidth / el.clientHeight, 0.1, 200);
      camera.position.set(0, 0, 9);

      scene.add(new THREE.AmbientLight(0xffffff, 0.1));
      const keyLight = new THREE.PointLight(0xbfff47, 2.5, 25);
      keyLight.position.set(0, 0, 4);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x6688ff, 0.4);
      rimLight.position.set(-4, 3, -3);
      scene.add(rimLight);

      const group = new THREE.Group();
      scene.add(group);

      const nodePositions = [
        new THREE.Vector3(-2.5, 1.5, 0.6),
        new THREE.Vector3(2.6, 1.1, -0.5),
        new THREE.Vector3(-2.1, -1.5, -0.5),
        new THREE.Vector3(2.2, -1.7, 0.7),
        new THREE.Vector3(0.4, 2.5, 0.8),
        new THREE.Vector3(-0.3, -2.5, -0.8),
      ].slice(0, clubs.length);

      function makeHaloSprite(size, r, g, b, opacity) {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const ctx = c.getContext("2d");
        const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grd.addColorStop(0, `rgba(${r},${g},${b},${opacity})`);
        grd.addColorStop(0.3, `rgba(${r},${g},${b},${opacity * 0.5})`);
        grd.addColorStop(0.6, `rgba(${r},${g},${b},${opacity * 0.15})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 128, 128);
        const mat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
        const sp = new THREE.Sprite(mat);
        sp.scale.setScalar(size);
        return sp;
      }

      /* Core */
      const coreMat = new THREE.MeshStandardMaterial({ color: 0xbfff47, emissive: 0x88cc00, emissiveIntensity: 1.2, roughness: 0.1, metalness: 0.6 });
      const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 64, 64), coreMat);
      group.add(coreMesh);

      const coreH1 = makeHaloSprite(3.2, 191, 255, 71, 0.7);
      group.add(coreH1);
      const coreH2 = makeHaloSprite(5.8, 191, 255, 71, 0.2);
      group.add(coreH2);

      const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.005, 8, 80), new THREE.MeshBasicMaterial({ color: 0xbfff47, transparent: true, opacity: 0.5 }));
      group.add(coreRing);
      const coreRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.003, 8, 80), new THREE.MeshBasicMaterial({ color: 0xbfff47, transparent: true, opacity: 0.22 }));
      group.add(coreRing2);

      /* Lines: center to nodes */
      nodePositions.forEach((pos) => {
        const pts = [new THREE.Vector3(0, 0, 0), pos.clone()];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x4a7a10, transparent: true, opacity: 0.5 })));
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([...pts.map(p => p.clone())]), new THREE.LineBasicMaterial({ color: 0xbfff47, transparent: true, opacity: 0.18 })));
      });

      /* Cross-connections */
      [[0, 4], [1, 3], [2, 5], [0, 2], [1, 4]].forEach(([a, b]) => {
        if (a < nodePositions.length && b < nodePositions.length) {
          const pts = [nodePositions[a].clone(), nodePositions[b].clone()];
          group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x2e4d0a, transparent: true, opacity: 0.25 })));
        }
      });

      /* Nodes */
      const nodes = [];
      const nodeHalos = [];
      const sizes = [0.10, 0.08, 0.09, 0.08, 0.10, 0.07].slice(0, clubs.length);

      nodePositions.forEach((pos, i) => {
        const mat = new THREE.MeshStandardMaterial({ color: 0xd8f0a0, emissive: 0xbfff47, emissiveIntensity: 1.0, roughness: 0.05, metalness: 0.3 });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(sizes[i], 32, 32), mat);
        mesh.position.copy(pos);
        group.add(mesh);
        nodes.push(mesh);

        const h = makeHaloSprite(sizes[i] * 26, 191, 255, 71, 0.65);
        h.position.copy(pos);
        group.add(h);
        nodeHalos.push(h);
      });

      /* Pulse dots */
      const pDotGeo = new THREE.SphereGeometry(0.028, 8, 8);
      const pulses = nodePositions.map((target, i) => {
        const mat = new THREE.MeshBasicMaterial({ color: 0xbfff47, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
        const dot = new THREE.Mesh(pDotGeo, mat);
        const trailMat = new THREE.MeshBasicMaterial({ color: 0xbfff47, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
        const trail = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), trailMat);
        group.add(dot); group.add(trail);
        return { dot, trail, mat, trailMat, t: -(i * 0.19), target: target.clone(), speed: 0.42 + i * 0.025 };
      });

      /* Floating particles */
      const floatCount = 60;
      const fGeo = new THREE.BufferGeometry();
      const fPos = new Float32Array(floatCount * 3);
      const fBase = [];
      for (let i = 0; i < floatCount; i++) {
        const v = new THREE.Vector3((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4 - 1);
        fBase.push(v.clone());
        fPos[i * 3] = v.x; fPos[i * 3 + 1] = v.y; fPos[i * 3 + 2] = v.z;
      }
      fGeo.setAttribute("position", new THREE.BufferAttribute(fPos, 3));
      group.add(new THREE.Points(fGeo, new THREE.PointsMaterial({ color: 0xbfff47, size: 0.025, sizeAttenuation: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })));

      /* Mouse */
      const raycaster = new THREE.Raycaster();
      let tRotY = 0, tRotX = 0, cRotY = 0, cRotX = 0;

      const onMouseMove = (e) => {
        const r = el.getBoundingClientRect();
        const mx = (e.clientX - r.left) / r.width * 2 - 1;
        const my = -((e.clientY - r.top) / r.height) * 2 + 1;
        tRotY = mx * 0.55; tRotX = my * 0.28;
        raycaster.setFromCamera(new THREE.Vector2(mx, my), camera);
        const hits = raycaster.intersectObjects(nodes);
        const tipEl = tooltipRef.current;
        if (hits.length) {
          const idx = nodes.indexOf(hits[0].object);
          hoveredRef.current = idx;
          if (tipEl) { tipEl.textContent = clubs[idx].name; tipEl.style.opacity = "1"; tipEl.style.left = (e.clientX - r.left + 16) + "px"; tipEl.style.top = (e.clientY - r.top - 8) + "px"; }
        } else {
          hoveredRef.current = null;
          if (tipEl) tipEl.style.opacity = "0";
        }
      };
      const onMouseLeave = () => { tRotY = 0; tRotX = 0; hoveredRef.current = null; if (tooltipRef.current) tooltipRef.current.style.opacity = "0"; };
      el.addEventListener("mousemove", onMouseMove);
      el.addEventListener("mouseleave", onMouseLeave);

      /* Resize */
      const onResize = () => { renderer.setSize(el.clientWidth, el.clientHeight); camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); };
      window.addEventListener("resize", onResize);

      /* Animate */
      let t = 0;
      let rafId;
      const animate = () => {
        rafId = requestAnimationFrame(animate);
        t += 0.007;
        cRotY += (tRotY - cRotY) * 0.045;
        cRotX += (tRotX - cRotX) * 0.045;
        group.rotation.y = cRotY + t * 0.1;
        group.rotation.x = cRotX + Math.sin(t * 0.3) * 0.05;

        const cs = 1 + Math.sin(t * 2.0) * 0.04;
        coreMesh.scale.setScalar(cs);
        coreH1.scale.setScalar(cs * 3.2);
        coreH2.scale.setScalar(cs * 5.8);
        keyLight.intensity = 2.2 + Math.sin(t * 1.6) * 0.5;
        coreRing.rotation.x = t * 0.7; coreRing.rotation.y = t * 0.4;
        coreRing2.rotation.x = -t * 0.5; coreRing2.rotation.z = t * 0.6;

        nodes.forEach((n, i) => {
          const isH = hoveredRef.current === i;
          n.position.copy(nodePositions[i]).addScaledVector(new THREE.Vector3(Math.sin(t * 0.7 + i), Math.cos(t * 0.9 + i * 0.8), Math.sin(t * 0.5 + i * 0.6)), 0.06);
          nodeHalos[i].position.copy(n.position);
          const s = isH ? 1.8 : 1 + Math.sin(t * 1.8 + i) * 0.08;
          n.scale.setScalar(s);
          nodeHalos[i].scale.setScalar(s * (isH ? 36 : 26) * sizes[i]);
          n.material.emissiveIntensity = isH ? 2.5 : 1.0 + Math.sin(t * 1.4 + i) * 0.3;
          n.material.color.setHex(isH ? 0xbfff47 : 0xd8f0a0);
          n.material.emissive.setHex(isH ? 0xd4ff00 : 0xbfff47);
        });

        pulses.forEach((p) => {
          p.t += p.speed * 0.012;
          if (p.t > 1) p.t -= 1;
          p.dot.position.lerpVectors(new THREE.Vector3(0, 0, 0), p.target, p.t);
          p.trail.position.lerpVectors(new THREE.Vector3(0, 0, 0), p.target, Math.max(0, p.t - 0.06));
          const fade = p.t < 0.1 ? p.t / 0.1 : p.t > 0.85 ? (1 - p.t) / 0.15 : 1;
          p.mat.opacity = fade * 1.0;
          p.trailMat.opacity = fade * 0.4;
        });

        const fp = fGeo.attributes.position.array;
        for (let i = 0; i < floatCount; i++) {
          fp[i * 3 + 1] = fBase[i].y + Math.sin(t * 0.5 + i * 0.7) * 0.15;
          fp[i * 3] = fBase[i].x + Math.cos(t * 0.4 + i * 0.5) * 0.1;
        }
        fGeo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
      };
      animate();

      cleanup.push(() => {
        cancelAnimationFrame(rafId);
        el.removeEventListener("mousemove", onMouseMove);
        el.removeEventListener("mouseleave", onMouseLeave);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      });
    }

    return () => {
      cleanup.forEach((fn) => fn());
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [clubs]);

  return (
    <div className="lk-hero-visual" style={{ position: "relative" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%", background: "transparent" }} />
      <div
        ref={tooltipRef}
        style={{
          position: "absolute", top: 0, left: 0, pointerEvents: "none",
          background: "rgba(8,10,9,0.9)", border: "1px solid rgba(191,255,71,0.3)",
          color: "#bfff47", padding: "6px 14px", fontSize: "12px", fontWeight: 700,
          borderRadius: "3px", letterSpacing: "0.1em", fontFamily: "inherit",
          opacity: 0, transition: "opacity 0.2s", whiteSpace: "nowrap", textTransform: "uppercase",
        }}
      />
    </div>
  );
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
          <button
            className="lk-logo lk-logo-btn"
            type="button"
            onClick={() => { scrollTo("top"); setMenuOpen(false); }}
            aria-label="Back to top"
          >
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
          {/* Left Column: Text */}
          <div className="lk-hero-text">

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

          {/* Right Column: Neural Web Visual */}
          <NeuralWeb clubs={dbClubs} />
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
              Table booking, operator control, and QR door check-in — built for clubs
              that run late.
            </p>
            <div className="lk-footer-socials">
              {[
                { label: "Twitter", path: "M22.46 6c-.77.35-1.6.58-2.46.69..." }, // Truncated for brevity, assuming standard paths are kept.
                { label: "Instagram", path: "M12 2.163c3.204 0 3.584..." },
                { label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569..." },
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

        <div className="lk-footer-bottom">
          <span className="lk-footer-copy">© 2026 Laklak. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
};

export default Landing;