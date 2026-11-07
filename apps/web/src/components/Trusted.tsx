import Link from "next/link";
const names = ["Hushline", "Kernel Labs", "Airgap", "Northwind", "Cobalt", "Ledgerly", "Fieldnote", "Quiet Co."];

export function Trusted() {
  const row = [...names, ...names];
  return (
    <section className="border-y border-black/10 py-10">
      <p className="mb-8 text-center text-[15px] font-semibold">Integrated by progressive dev teams.</p>
      <div className="overflow-hidden">
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-16 px-8">
          {row.map((n, i) => (
            <span key={i} className="text-2xl font-bold tracking-tight text-black/25">
              {n}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-8 text-center">
        <Link href="/customers" className="inline-flex items-center gap-2 text-[15px] font-semibold hover:text-accent">
          Read integration stories <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
