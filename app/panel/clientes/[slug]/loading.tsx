export default function Loading() {
  return (
    <div className="loading-wrap" aria-label="Cargando">
      <div className="loading-bar" />
      <div className="skel" style={{ height: 44, width: '40%' }} />
      <div className="skel" style={{ height: 120 }} />
      <div className="skel" style={{ height: 220 }} />
    </div>
  );
}
