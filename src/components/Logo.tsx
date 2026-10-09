export default function Logo({ className = "" }: { className?: string }) {
  return <img src="/images/logo.png" alt="Anargya — ITS Formula EV Team" className={`object-contain ${className}`} />;
}
