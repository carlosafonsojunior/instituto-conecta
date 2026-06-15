import { Phone } from "lucide-react";

export function WhatsAppFloat() {
  const phone = "552737581758";
  const message = encodeURIComponent("Olá! Gostaria de falar com o IPASMA.");

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl animate-bounce-subtle"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <Phone size={28} strokeWidth={2.5} />
    </a>
  );
}
