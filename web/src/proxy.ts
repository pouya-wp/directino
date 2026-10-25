import { NextResponse, type NextRequest } from "next/server";

const locales = ["fa", "en"];

// Persian speakers land on /fa, everyone else on /en.
function pickLocale(request: NextRequest) {
  const header = request.headers.get("accept-language") ?? "";
  return /(^|,)\s*fa\b/i.test(header) ? "fa" : "en";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  request.nextUrl.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\..*).*)"],
};
