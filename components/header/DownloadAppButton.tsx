export default function DownloadAppButton({ className }: { className?: string }) {
  return (
    <a
      href="https://github.com/Satyaswarupa/umrahchal-app/releases/download/1.0.1/umrahjao.apk"
      download
      className={className}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M12 3v12m0 0l-4-4m4 4l4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
      Download App
    </a>
  );
}
