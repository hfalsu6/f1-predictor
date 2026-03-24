"use client";

import { useEffect, useRef, useState } from "react";
import { CIRCUIT_IMAGES } from "@/constants/f1";
import type { CircuitDetail } from "@/constants/circuits";
import type { Race } from "@/types/f1";

/* ─── Seeded PRNG for deterministic environment ───────────────────────────── */
function mkRng(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return () => {
    h ^= h << 13; h ^= h >> 7; h ^= h << 17;
    return (h >>> 0) / 4294967296;
  };
}

/* ─── Elevation colour (blue → cyan → lime → orange → red) ──────────────── */
function elevRGB(t: number): [number, number, number] {
  const stops: [number, number, number][] = [
    [0.11, 0.30, 0.84],
    [0.02, 0.70, 0.82],
    [0.51, 0.79, 0.08],
    [0.97, 0.44, 0.08],
    [0.86, 0.14, 0.14],
  ];
  const ts = [0, 0.25, 0.55, 0.78, 1];
  const c  = Math.max(0, Math.min(1, t));
  for (let i = 1; i < ts.length; i++) {
    if (c <= ts[i]) {
      const u = (c - ts[i - 1]) / (ts[i] - ts[i - 1]);
      return stops[i - 1].map((v, j) => v + u * (stops[i][j] - v)) as [number, number, number];
    }
  }
  return [0.86, 0.14, 0.14];
}

/* ─── Turn-number sprite ──────────────────────────────────────────────────── */
function makeTurnSprite(num: number, THREE: typeof import("three")) {
  const S   = 96;
  const c   = document.createElement("canvas");
  c.width   = c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, S, S);
  ctx.fillStyle = "rgba(8,3,3,0.92)";
  ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.38)"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = `bold ${Math.round(S * 0.40)}px monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(String(num), S / 2, S / 2 + 1);
  const mat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false });
  return new THREE.Sprite(mat);
}

/* ─── Environment builder ─────────────────────────────────────────────────── */
function buildEnvironment(
  scene: import("three").Scene,
  THREE: typeof import("three"),
  elevationChange: number,
  circuitId: string,
) {
  const rng     = mkRng(circuitId);
  const hilly   = elevationChange > 50;
  const flat    = elevationChange < 12;
  const urban   = flat; // flat circuits tend to be urban/street

  /* ── Cartoonish mountains in the far background ─────────────────── */
  const numMtns = hilly ? 10 : flat ? 2 : 6;
  for (let i = 0; i < numMtns; i++) {
    const angle  = rng() * Math.PI * 2;
    const dist   = 30 + rng() * 18;
    const x      = Math.cos(angle) * dist;
    const z      = Math.sin(angle) * dist;
    const w      = 2.5 + rng() * 5;
    const h      = 2 + rng() * (hilly ? 9 : 4);
    const segs   = 5 + Math.floor(rng() * 3); // low-poly
    const geo    = new THREE.ConeGeometry(w, h, segs);
    const col    = new THREE.Color().setHSL(0.75 + rng() * 0.08, 0.25, 0.08 + rng() * 0.08);
    const mat    = new THREE.MeshStandardMaterial({ color: col, roughness: 1, flatShading: true });
    const mesh   = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2 - 0.25, z);
    scene.add(mesh);

    // Snow cap for tall mountains
    if (h > 7) {
      const capGeo = new THREE.ConeGeometry(w * 0.35, h * 0.22, segs);
      const capMat = new THREE.MeshStandardMaterial({ color: 0xeeeeff, roughness: 1, flatShading: true });
      const cap    = new THREE.Mesh(capGeo, capMat);
      cap.position.set(x, h * 0.91 - 0.25, z);
      scene.add(cap);
    }
  }

  /* ── Buildings (urban clusters) ─────────────────────────────────── */
  const numBuildings = urban ? 24 : hilly ? 4 : 12;
  for (let i = 0; i < numBuildings; i++) {
    const angle = rng() * Math.PI * 2;
    const dist  = 12 + rng() * 14;
    const x     = Math.cos(angle) * dist;
    const z     = Math.sin(angle) * dist;
    const w     = 0.35 + rng() * (urban ? 1.0 : 0.5);
    const d     = 0.35 + rng() * (urban ? 1.0 : 0.5);
    const h     = 0.5 + rng() * (urban ? 3.5 : 1.2);
    const geo   = new THREE.BoxGeometry(w, h, d);
    // Dark purplish-grey buildings
    const hue   = 0.7 + rng() * 0.1;
    const col   = new THREE.Color().setHSL(hue, 0.2, 0.06 + rng() * 0.06);
    const mat   = new THREE.MeshStandardMaterial({ color: col, roughness: 0.9, metalness: 0.1 });
    const mesh  = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2 - 0.2, z);
    // Slight random rotation
    mesh.rotation.y = rng() * Math.PI * 2;
    scene.add(mesh);

    // Window lights (small bright faces)
    if (h > 1.5) {
      const wGeo = new THREE.BoxGeometry(w * 1.02, h * 1.02, d * 1.02);
      const wMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.1, 0.6, 0.15 + rng() * 0.12),
        transparent: true, opacity: 0.15,
        wireframe: true,
      });
      const wMesh = new THREE.Mesh(wGeo, wMat);
      wMesh.position.copy(mesh.position);
      wMesh.rotation.copy(mesh.rotation);
      scene.add(wMesh);
    }
  }

  /* ── Trees ───────────────────────────────────────────────────────── */
  const numTrees = hilly ? 30 : flat ? 8 : 18;
  for (let i = 0; i < numTrees; i++) {
    const angle    = rng() * Math.PI * 2;
    const dist     = 10 + rng() * 18;
    const x        = Math.cos(angle) * dist;
    const z        = Math.sin(angle) * dist;
    const trunkH   = 0.28 + rng() * 0.28;
    const foliageH = 0.6 + rng() * 0.9;
    const foliageR = 0.18 + rng() * 0.22;

    // Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.07, trunkH, 5),
      new THREE.MeshStandardMaterial({ color: 0x3d1a08, roughness: 1 }),
    );
    trunk.position.set(x, trunkH / 2 - 0.2, z);
    scene.add(trunk);

    // Foliage (two tiers for bushier look)
    for (let tier = 0; tier < 2; tier++) {
      const scale = 1 - tier * 0.28;
      const fGeo  = new THREE.ConeGeometry(foliageR * scale, foliageH * scale, 6);
      const fCol  = new THREE.Color().setHSL(0.30 + rng() * 0.08, 0.55, 0.09 + rng() * 0.06);
      const fMat  = new THREE.MeshStandardMaterial({ color: fCol, roughness: 1, flatShading: true });
      const fMesh = new THREE.Mesh(fGeo, fMat);
      fMesh.position.set(x, trunkH + foliageH * (0.4 + tier * 0.35) - 0.2, z);
      scene.add(fMesh);
    }
  }

  /* ── Grandstand hints along outer edge ──────────────────────────── */
  const numStands = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < numStands; i++) {
    const angle = rng() * Math.PI * 2;
    const dist  = 9 + rng() * 5;
    const x     = Math.cos(angle) * dist;
    const z     = Math.sin(angle) * dist;
    const w     = 1.5 + rng() * 3;
    const h     = 0.5 + rng() * 0.8;
    const d     = 0.5;
    const geo   = new THREE.BoxGeometry(w, h, d);
    const col   = new THREE.Color().setHSL(0.0, 0.5, 0.08 + rng() * 0.04);
    const mat   = new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 });
    const mesh  = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2 - 0.1, z);
    mesh.lookAt(0, mesh.position.y, 0); // face the circuit
    scene.add(mesh);
  }
}

/* ─── Elevation curtain (wall from ground up to track) ───────────────────── */
function buildCurtain(
  pts3d: import("three").Vector3[],
  elevAmp: number,
  THREE: typeof import("three"),
): import("three").Mesh {
  const N   = pts3d.length;
  const pos = new Float32Array(N * 2 * 3);
  const col = new Float32Array(N * 2 * 3);

  for (let i = 0; i < N; i++) {
    const p  = pts3d[i];
    const t  = p.y / Math.max(elevAmp, 0.01); // normalised elevation
    const [r, g, b] = elevRGB(t);

    // Bottom vertex
    pos[i * 6 + 0] = p.x; pos[i * 6 + 1] = 0;   pos[i * 6 + 2] = p.z;
    col[i * 6 + 0] = 0.04; col[i * 6 + 1] = 0.01; col[i * 6 + 2] = 0.04;

    // Top vertex (elevated)
    pos[i * 6 + 3] = p.x; pos[i * 6 + 4] = p.y; pos[i * 6 + 5] = p.z;
    col[i * 6 + 3] = r;   col[i * 6 + 4] = g;   col[i * 6 + 5] = b;
  }

  const idx: number[] = [];
  for (let i = 0; i < N - 1; i++) {
    const b0 = i * 2, t0 = i * 2 + 1, b1 = (i + 1) * 2, t1 = (i + 1) * 2 + 1;
    idx.push(b0, t0, b1, t0, t1, b1);
  }
  // Close the loop
  idx.push((N - 1) * 2, (N - 1) * 2 + 1, 0, (N - 1) * 2 + 1, 1, 0);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
  }));
}

/* ─── Component ───────────────────────────────────────────────────────────── */
interface Props { race: Race; detail: CircuitDetail; }

export function CircuitCanvas3D({ race, detail }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const roRef        = useRef<ResizeObserver | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [showElev, setShowElev]       = useState(true);
  const showElevRef  = useRef(true);

  /* Sync toggle → ref without re-mounting scene */
  useEffect(() => { showElevRef.current = showElev; }, [showElev]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false, animId = 0;
    let renderer: import("three").WebGLRenderer | null = null;

    (async () => {
      try {
      const THREE = await import("three");
      if (cancelled) return;

      const url     = CIRCUIT_IMAGES[race.circuitId];
      if (!url) { setLoading(false); return; }
      const res = await fetch(url).catch(() => null);
      if (!res?.ok || cancelled) { setLoading(false); return; }
      const svgText = await res.text().catch(() => null);
      if (!svgText || cancelled) { setLoading(false); return; }

      /* ── Parse SVG ─────────────────────────────────────────────── */
      const hidden = document.createElement("div");
      hidden.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1000px;height:1000px;visibility:hidden;";
      document.body.appendChild(hidden);
      hidden.innerHTML = svgText;
      const svgEl    = hidden.querySelector("svg") as SVGSVGElement | null;
      const allPaths = svgEl ? Array.from(svgEl.querySelectorAll("path")) : [];
      if (!svgEl || !allPaths.length) { document.body.removeChild(hidden); setLoading(false); return; }

      const mainPath = allPaths.reduce((b, p) =>
        (p as SVGPathElement).getTotalLength() > (b as SVGPathElement).getTotalLength() ? p : b
      ) as SVGPathElement;
      const totalLen = mainPath.getTotalLength();
      const bbox     = mainPath.getBBox();
      const N        = 300;
      const raw2d    = Array.from({ length: N }, (_, i) => {
        const pt = mainPath.getPointAtLength((i / N) * totalLen);
        return { x: pt.x, y: pt.y };
      });
      document.body.removeChild(hidden);
      if (cancelled) return;

      /* ── 3-D coordinates ────────────────────────────────────────── */
      const cX = bbox.x + bbox.width  / 2;
      const cZ = bbox.y + bbox.height / 2;
      const scaleXZ = 13 / Math.max(bbox.width, bbox.height);

      const prof    = detail.elevationProfile;
      const minE    = Math.min(...prof), maxE = Math.max(...prof);
      const rng     = maxE - minE || 1;
      const elevAmp = Math.min(Math.max(detail.elevationChange / 10, 0.3), 4.0);

      const pts3d = raw2d.map(({ x, y }, i) => {
        const t   = i / N;
        const ei  = t * (prof.length - 1);
        const ei0 = Math.floor(ei), ei1 = Math.min(ei0 + 1, prof.length - 1);
        const ef  = ei - ei0;
        const en  = ((prof[ei0] * (1 - ef) + prof[ei1] * ef) - minE) / rng;
        return new THREE.Vector3((x - cX) * scaleXZ, en * elevAmp, (y - cZ) * scaleXZ);
      });

      /* ── Scene ──────────────────────────────────────────────────── */
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x060209);
      scene.fog = new THREE.FogExp2(0x060209, 0.014);

      const W = canvas.clientWidth || 900, H = canvas.clientHeight || 480;
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(W, H, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const camera = new THREE.PerspectiveCamera(46, W / H, 0.1, 300);

      /* ── Ground ─────────────────────────────────────────────────── */
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(120, 120),
        new THREE.MeshStandardMaterial({ color: 0x050103, roughness: 1 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.21;
      scene.add(ground);
      const grid = new THREE.GridHelper(90, 70, 0x1a0505, 0x0c0101);
      grid.position.y = -0.19;
      scene.add(grid);

      /* ── Flat track (baseline at Y=0) ───────────────────────────── */
      const flatCurve = new THREE.CatmullRomCurve3(
        pts3d.map(p => new THREE.Vector3(p.x, 0, p.z)), true, "catmullrom", 0.4
      );
      const flatGroup = new THREE.Group();

      // Flat white centre
      const flatMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xdddddd, emissiveIntensity: 0.7,
        roughness: 0.1, transparent: true, opacity: 0.55,
      });
      flatGroup.add(new THREE.Mesh(new THREE.TubeGeometry(flatCurve, N * 2, 0.10, 8, true), flatMat));

      // Flat red glow
      const flatGlowMat = new THREE.MeshBasicMaterial({ color: 0xe00700, transparent: true, opacity: 0.15 });
      flatGroup.add(new THREE.Mesh(new THREE.TubeGeometry(flatCurve, N, 0.28, 8, true), flatGlowMat));

      scene.add(flatGroup);

      /* ── Elevated track ─────────────────────────────────────────── */
      const elevCurve = new THREE.CatmullRomCurve3(pts3d, true, "catmullrom", 0.4);
      const elevGroup = new THREE.Group();

      // White inner tube
      elevGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(elevCurve, N * 3, 0.10, 8, true),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xdddddd, emissiveIntensity: 0.8, roughness: 0.1 }),
      ));

      // Red glow
      elevGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(elevCurve, N * 2, 0.27, 8, true),
        new THREE.MeshBasicMaterial({ color: 0xe00700, transparent: true, opacity: 0.30 }),
      ));
      elevGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(elevCurve, N, 0.58, 6, true),
        new THREE.MeshBasicMaterial({ color: 0xe00700, transparent: true, opacity: 0.07 }),
      ));

      // Elevation curtain (wall from ground to elevated track)
      elevGroup.add(buildCurtain(pts3d, elevAmp, THREE));

      // Vertical marker lines (thin pillars showing height)
      for (let i = 0; i < N; i += 10) {
        const p = pts3d[i];
        if (p.y < 0.05) continue; // skip near-flat sections
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(p.x, 0, p.z),
          new THREE.Vector3(p.x, p.y, p.z),
        ]);
        const t  = p.y / elevAmp;
        const [r, g, b] = elevRGB(t);
        const lineMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(r, g, b), transparent: true, opacity: 0.5,
        });
        elevGroup.add(new THREE.Line(lineGeo, lineMat));
      }

      scene.add(elevGroup);

      /* ── OA / DRS zones ─────────────────────────────────────────── */
      const is2026 = parseInt(race.season, 10) >= 2026;
      const oaHex  = is2026 ? 0x00ffcc : 0x00e566;

      function addDrsZones(toGroup: import("three").Group, curve: import("three").CatmullRomCurve3, ptsArr: import("three").Vector3[], yOffset: number) {
        for (const zone of detail.drsZonePositions) {
          const si = Math.floor(zone.start * N), ei = Math.ceil(zone.end * N);
          const zPts = [];
          for (let i = si; i <= ei; i++) {
            const p = ptsArr[i % N];
            zPts.push(new THREE.Vector3(p.x, p.y + yOffset, p.z));
          }
          if (zPts.length >= 2) {
            const zc = new THREE.CatmullRomCurve3(zPts, false);
            const oaMesh = new THREE.Mesh(
              new THREE.TubeGeometry(zc, Math.max(8, ei - si), 0.19, 8, false),
              new THREE.MeshBasicMaterial({ color: oaHex, transparent: true, opacity: 0.82, depthTest: false, depthWrite: false }),
            );
            oaMesh.renderOrder = 5;
            toGroup.add(oaMesh);
          }
        }
      }

      // DRS on flat track (for flat view)
      const flatDrsGroup = new THREE.Group();
      addDrsZones(flatDrsGroup, flatCurve, pts3d.map(p => new THREE.Vector3(p.x, 0, p.z)), 0.02);
      scene.add(flatDrsGroup);

      // DRS on elevated track (for elevation view)
      const elevDrsGroup = new THREE.Group();
      addDrsZones(elevDrsGroup, elevCurve, pts3d, 0.02);
      elevGroup.add(elevDrsGroup);

      /* ── Turn number sprites ────────────────────────────────────── */
      const spritesElev = new THREE.Group();
      const spritesFlat = new THREE.Group();

      for (let i = 0; i < detail.turns; i++) {
        const frac  = (i + 0.5) / detail.turns;
        const idx   = Math.floor(frac * N) % N;
        const prevI = ((idx - 4) + N) % N, nextI = (idx + 4) % N;
        const tang  = new THREE.Vector3(pts3d[nextI].x - pts3d[prevI].x, 0, pts3d[nextI].z - pts3d[prevI].z).normalize();
        const norm  = new THREE.Vector3(-tang.z, 0, tang.x);

        const sp = makeTurnSprite(i + 1, THREE);
        sp.scale.set(0.75, 0.75, 1);

        // Elevated position
        const ePos = pts3d[idx].clone().addScaledVector(norm, 1.5);
        ePos.y += 0.4;
        sp.position.copy(ePos);
        spritesElev.add(sp);

        // Flat position clone
        const sp2 = makeTurnSprite(i + 1, THREE);
        sp2.scale.set(0.75, 0.75, 1);
        const fPos = new THREE.Vector3(pts3d[idx].x, 0.4, pts3d[idx].z).addScaledVector(norm, 1.5);
        sp2.position.copy(fPos);
        spritesFlat.add(sp2);
      }

      scene.add(spritesElev);
      scene.add(spritesFlat);

      /* ── Environment ─────────────────────────────────────────────── */
      buildEnvironment(scene, THREE, detail.elevationChange, race.circuitId);

      /* ── Lights ─────────────────────────────────────────────────── */
      scene.add(new THREE.AmbientLight(0x220606, 3));
      const pt = new THREE.PointLight(0xe00700, 4, 60); pt.position.set(0, 12, 0); scene.add(pt);
      const dir = new THREE.DirectionalLight(0xffffff, 0.5); dir.position.set(10, 20, 10); scene.add(dir);

      /* ── Camera orbit at exactly 45° ────────────────────────────── */
      const ORB_R = 22, ORB_H = 22;
      let orbitAngle = 0, paused = false;
      canvas.addEventListener("mouseenter", () => { paused = true; });
      canvas.addEventListener("mouseleave", () => { paused = false; });

      /* Resize */
      const ro = new ResizeObserver(() => {
        const el = canvas.parentElement;
        if (!el || !renderer) return;
        const w = el.clientWidth, h = el.clientHeight;
        if (w > 0 && h > 0) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
      });
      if (canvas.parentElement) ro.observe(canvas.parentElement);
      roRef.current = ro;

      setLoading(false);

      /* ── Render loop ─────────────────────────────────────────────── */
      const clock = new THREE.Clock();
      function frame() {
        animId = requestAnimationFrame(frame);
        const dt = clock.getDelta();
        if (!paused) orbitAngle += dt * 0.29;
        camera.position.set(ORB_R * Math.cos(orbitAngle), ORB_H, ORB_R * Math.sin(orbitAngle));
        camera.lookAt(0, 0, 0);

        // Toggle elevation visibility
        const ev = showElevRef.current;
        elevGroup.visible    = ev;
        flatGroup.visible    = true;         // baseline always visible
        flatDrsGroup.visible = !ev;          // flat DRS only when elevation OFF
        spritesElev.visible  = ev;
        spritesFlat.visible  = !ev;

        // Dim flat track when elevation ON (it's just the reference baseline)
        (flatGroup.children[0] as import("three").Mesh & { material: import("three").MeshStandardMaterial }).material.opacity = ev ? 0.22 : 0.60;
        (flatGroup.children[1] as import("three").Mesh & { material: import("three").MeshBasicMaterial }).material.opacity   = ev ? 0.07 : 0.22;

        renderer!.render(scene, camera);
      }
      frame();

      } catch (err) {
        console.error("[CircuitCanvas3D]", err);
        setError(String(err));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animId);
      renderer?.dispose();
      roRef.current?.disconnect();
    };
  }, [race.circuitId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {loading && !error && (
        <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", background: "#060209" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "rgba(224,7,0,0.3)", animation: "pulse-dot 1.4s ease-in-out infinite" }}>route</span>
        </div>
      )}
      {error && (
        <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#060209", gap: "8px", padding: "20px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "rgba(224,7,0,0.5)" }}>error</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(255,255,255,0.3)", textAlign: "center", letterSpacing: "0.05em" }}>
            {error}
          </span>
        </div>
      )}

      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

      {/* Elevation toggle button */}
      {!loading && (
        <button
          onClick={() => setShowElev(e => !e)}
          style={{
            position: "absolute", bottom: 44, left: 14, zIndex: 10,
            display: "flex", alignItems: "center", gap: "7px",
            background: showElev ? "rgba(224,7,0,0.12)" : "rgba(6,2,9,0.85)",
            border: `1px solid ${showElev ? "rgba(224,7,0,0.45)" : "rgba(255,255,255,0.12)"}`,
            borderRadius: "7px", padding: "6px 11px",
            cursor: "pointer", userSelect: "none",
            transition: "all 0.2s ease",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "14px", color: showElev ? "#e00700" : "rgba(255,255,255,0.4)" }}>
            landscape
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: showElev ? "#e00700" : "rgba(255,255,255,0.4)" }}>
            {showElev ? "Elevation ON" : "Elevation OFF"}
          </span>
        </button>
      )}
    </div>
  );
}
