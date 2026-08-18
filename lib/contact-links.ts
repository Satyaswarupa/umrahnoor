export function toTelLink(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function toWhatsappLink(phone: string, prefillMessage?: string): string {
  const digits = phone.replace(/\D/g, "");
  const text = prefillMessage
    ? `?text=${encodeURIComponent(`Hello ${prefillMessage}, I found you on UmrahJao and I'm interested in your Umrah packages.`)}`
    : "";
  return `https://wa.me/${digits}${text}`;
}
