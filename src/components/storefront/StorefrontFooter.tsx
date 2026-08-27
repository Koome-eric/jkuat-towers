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
    <footer className="mt-16 -mx-6 sm:mx-0" style={{ background: palette.ink }}>
      <div className="max-w-5xl mx-auto px-6 py-12 grid sm:grid-cols-3 gap-8">
        <div>
          <p className="text-lg" style={{ fontFamily: palette.displayFont, fontWeight: 600, color: "#F3F4F6" }}>
            {shopName}
          </p>
          {aboutBusiness ? (
            <p className="text-sm mt-2 max-w-[32ch]" style={{ color: "rgba(243,244,246,0.62)" }}>
              {aboutBusiness}
            </p>
          ) : null}
        </div>

        <div>
          <p className="text-[11px] tracking-widest uppercase" style={{ color: "rgba(243,244,246,0.4)" }}>
            Hours &amp; payment
          </p>
          <p className="text-sm mt-2" style={{ color: "rgba(243,244,246,0.8)" }}>
            {openingHours || "Contact for hours"}
          </p>
          {paymentMethods.length ? (
            <p className="text-sm mt-1" style={{ color: "rgba(243,244,246,0.8)" }}>
              Accepts {paymentMethods.join(", ")}
            </p>
          ) : null}
        </div>

        <div>
          <p className="text-[11px] tracking-widest uppercase" style={{ color: "rgba(243,244,246,0.4)" }}>
            Get in touch
          </p>
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm mt-2 hover:opacity-80 transition-opacity"
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
        className="border-t px-6 py-4 max-w-5xl mx-auto flex justify-between text-[11px] font-tabular"
        style={{ borderColor: "rgba(243,244,246,0.12)", color: "rgba(243,244,246,0.4)" }}
      >
        <span>Powered by JKUAT Towers</span>
        <span>Shop the whole building →</span>
      </div>
    </footer>
  );
}
