import { C } from "../../theme";
import "./Gauge.scss";

export default function Gauge({ value }) {
  const r = 80, cx = 100, cy = 100;
  const a = Math.PI * (1 - value / 100);
  const x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
  const color = value >= 80 ? C.green : value >= 60 ? C.blue : value >= 45 ? C.amber : "#EF4444";
  return (
    <svg viewBox="0 0 200 120" className="gauge">
      <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke={C.line} strokeWidth="14" strokeLinecap="round" />
      <path d={`M20 100 A80 80 0 0 1 ${x} ${y}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      <text x="100" y="86" textAnchor="middle" fontSize="38" fontWeight="800" fill={C.ink}>{value}</text>
      <text x="100" y="106" textAnchor="middle" fontSize="12" fill={C.mut}>из 100 баллов</text>
    </svg>
  );
}