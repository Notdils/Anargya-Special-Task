/**
 * Foto berbentuk satu keping cermin (poligon 7 sudut, sesuai desain Figma).
 * shape 0/1/2 = bentuk dasar / dicerminkan kiri-kanan / dicerminkan atas-bawah,
 * supaya tiap pembicara punya keping yang berbeda.
 * Selama file foto belum ada, keping tampil sebagai kaca hijau.
 */
const W = 370;
const H = 470;
const PAD = 2; // ruang untuk garis tepi
const BASE: [number, number][] = [
  [0.159, 0],
  [0.931, 0.024],
  [1, 0.796],
  [0.786, 0.954],
  [0.346, 1],
  [0.05, 0.962],
  [0, 0.446],
];

function points(shape: 0 | 1 | 2) {
  return BASE.map(([x, y]) => {
    const px = shape === 1 ? 1 - x : x;
    const py = shape === 2 ? 1 - y : y;
    return `${(PAD + px * (W - PAD * 2)).toFixed(1)},${(PAD + py * (H - PAD * 2)).toFixed(1)}`;
  }).join(" ");
}

type Props = { id: string; src: string; alt: string; shape: 0 | 1 | 2; className?: string };

export default function MirrorImage({ id, src, alt, shape, className = "" }: Props) {
  const pts = points(shape);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={alt}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <polygon points={pts} />
        </clipPath>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#12452a" />
          <stop offset="1" stopColor="#050f0a" />
        </linearGradient>
        <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity=".05" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width={W} height={H} fill={`url(#${id}-glass)`} />
        <image href={src} width={W} height={H} preserveAspectRatio="xMidYMid slice" />
      </g>
      <polygon points={pts} fill={`url(#${id}-gloss)`} stroke="#fff" strokeOpacity=".7" strokeWidth="1.5" strokeLinejoin="miter" />
    </svg>
  );
}
