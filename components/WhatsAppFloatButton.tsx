import { toWhatsappLink } from "@/lib/contact-links";
import { SUPPORT_WHATSAPP_NUMBER } from "@/lib/site-config";

export default function WhatsAppFloatButton() {
  return (
    <a
      href={toWhatsappLink(SUPPORT_WHATSAPP_NUMBER)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with UmrahJao support on WhatsApp"
      className="neu-raised fixed bottom-4 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] transition hover:scale-105 sm:bottom-6 sm:left-6"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFF">
        <path d="M12 2.6a9.3 9.3 0 00-7.9 14.2L2.7 21.4l4.7-1.3A9.3 9.3 0 1012 2.6zm5.3 13c-.2.6-1.2 1.2-1.9 1.2-1.7 0-4.2-1.4-5.8-3.1-1.3-1.4-2.2-3.2-2.2-4.4 0-.8.5-1.6 1-1.9.3-.2.9-.2 1.1.1l1.1 1.8c.1.3.1.5-.1.8l-.5.6c-.2.2-.2.4-.1.6.5 1.1 1.6 2.2 2.7 2.7.2.1.5.1.6-.1l.6-.6c.2-.2.5-.3.8-.2l1.8 1c.3.2.3.8 0 1.5z" />
      </svg>
    </a>
  );
}
