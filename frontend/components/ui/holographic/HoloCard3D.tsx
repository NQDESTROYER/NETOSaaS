import './holo.css';

export function HoloCard3D() {
  return (
    <div className="card-container">
      <div className="card-3d">
        <div className="side-right" />
        <div className="side-top" />
        <div className="holo-card">
          <span className="text-white text-6xl font-extrabold tracking-[0.2em] z-10">NETO</span>
        </div>
      </div>
    </div>
  );
}
