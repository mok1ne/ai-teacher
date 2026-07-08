import "./HeroArt.scss";

export default function HeroArt() {
  const books = [
    { t: "ЕГЭ", c: "#7C3AED", w: 188 },
    { t: "ОГЭ", c: "#2563EB", w: 205 },
    { t: "МАТЕМАТИКА", c: "#fff", tc: "#0F172A", w: 222, b: true },
    { t: "РУССКИЙ ЯЗЫК", c: "#fff", tc: "#0F172A", w: 238, b: true },
    { t: "ОБЩЕСТВОЗНАНИЕ", c: "#fff", tc: "#0F172A", w: 255, b: true },
  ];
  const dots = ["#F87171", "#FBBF24", "#34D399"];
  return (
    <div className="hero-art">
      <div className="hero-art__blob hero-art__blob--tr" />
      <div className="hero-art__blob hero-art__blob--bl" />
      <div className="hero-art__stage">
        <div className="hero-art__stack">
          {books.map((b, i) => (
            <div key={i} className={`hero-art__book${b.b ? " hero-art__book--bordered" : ""}`}
              style={{ "--book-w": `${b.w}px`, "--book-bg": b.c, "--book-tc": b.tc || "#fff" }}>
              {b.t}
            </div>
          ))}
        </div>
        <div className="hero-art__window">
          <div className="hero-art__bar">
            {dots.map((c) => <span key={c} className="hero-art__dot" style={{ background: c }} />)}
          </div>
          <div className="hero-art__body">
            <div className="hero-art__formula">f(x) = x² − 6x + 9</div>
            <svg viewBox="0 0 160 80" className="hero-art__graph">
              <line x1="10" y1="70" x2="150" y2="70" className="hero-art__axis" />
              <line x1="80" y1="6" x2="80" y2="74" className="hero-art__axis" />
              <path d="M30 14 Q80 96 130 14" className="hero-art__curve" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}