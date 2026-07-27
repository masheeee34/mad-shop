import Image from "next/image";

export function QRCode({ value, size = 120, className }: { value: string; size?: number; className?: string }) {
  // On utilise l'API de génération de QR Code de goqr.me pour éviter d'ajouter une dépendance npm
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
  
  return (
    <div className={className}>
      <Image 
        src={qrUrl}
        alt={`QR Code pour ${value}`}
        width={size}
        height={size}
        className="rounded-sm mix-blend-multiply"
        unoptimized
      />
    </div>
  );
}
