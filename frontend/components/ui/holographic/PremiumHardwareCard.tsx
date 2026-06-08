import './hardware.css';

export function PremiumHardwareCard() {
  return (
    <div className="device-container">
      <div className="device-3d">
        <div className="side-face side-front" />
        <div className="side-face side-right" />
        <div className="top-face">
          <span className="text-white text-4xl font-bold tracking-[0.2em] opacity-85">NETO</span>
        </div>
      </div>
    </div>
  );
}
