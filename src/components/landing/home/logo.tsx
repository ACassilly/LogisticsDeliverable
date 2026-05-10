import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-start ${className}`}>
      <div
        className="flex items-center justify-start"
        style={{ width: "300px", height: "40px" }}
      >
        <Image
          src="/images/logo/logo.svg"
          alt="Portlandia Logistics"
          width={200}
          height={20}
          priority
          className="block"
        />
      </div>
    </div>
  );
}
