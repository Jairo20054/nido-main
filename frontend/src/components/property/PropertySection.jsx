export default function PropertySection({ title, children, className = '' }) {
  return (
    <section className={`nido-detail-section ${className}`.trim()}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
