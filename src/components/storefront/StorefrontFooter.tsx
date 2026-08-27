export function StorefrontFooter({
  palette,
  shopName,
  aboutBusiness,
  openingHours,
  paymentMethods,
  whatsappLink,
}: {
  palette: { ink: string; displayFont: string; accent: string };
  shopName: string;
  aboutBusiness?: string | null;
  openingHours?: string | null;
  paymentMethods: string[];
  whatsappLink?: string | null;
}) {
  return (
    <footer className="mt-16 w-full" style={{ background: palette.ink }}>
      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 sm:py-12 grid gap-8 sm:grid-cols-3">
        <div className="min-w-0">
          <p className="text-lg" style={{ fontFamily: palette.displayFont, fontWeight: 600, color: "#F3F4F6" }}>
            {shopName}
          </p>
          {aboutBusiness ? (
            <p className="text-sm mt-2 max-w-[32ch] break-words" style={{ color: "rgba(243,244,246,0.62)" }}>
              {aboutBusiness}
            </p>
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] tracking-widest uppercase" style={{ color: "rgba(243,244,246,0.4)" }}>
            Hours &amp; payment
          </p>
          <p className="text-sm mt-2 break-words" style={{ color: "rgba(243,244,246,0.8)" }}>
            {openingHours || "Contact for hours"}
          </p>
          {paymentMethods.length ? (
            <p className="text-sm mt-1 break-words" style={{ color: "rgba(243,244,246,0.8)" }}>
              Accepts {paymentMethods.join(", ")}
            </p>
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] tracking-widest uppercase" style={{ color: "rgba(243,244,246,0.4)" }}>
            Get in touch
          </p>
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm mt-2 hover:opacity-80 transition-opacity break-words"
              style={{ color: palette.accent }}
            >
              Chat on WhatsApp →
            </a>
          ) : (
            <p className="text-sm mt-2" style={{ color: "rgba(243,244,246,0.5)" }}>
              Not available
            </p>
          )}
        </div>
      </div>

      <div
        className="border-t px-4 py-4 max-w-5xl mx-auto flex flex-col gap-2 text-[11px] font-tabular sm:px-6 sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "rgba(243,244,246,0.12)", color: "rgba(243,244,246,0.4)" }}
      >
        <span>Powered by JKUAT Towers</span>
        <span className="break-words">Shop the whole building →</span>
      </div>
    </footer>
  );
}
