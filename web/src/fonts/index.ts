import localFont from "next/font/local";

// Persian body: Peyda (FontIran). Keep FontLicense.txt next to the files and add the license code there.
export const peyda = localFont({
  variable: "--font-peyda",
  display: "swap",
  src: [
    { path: "./peyda/PeydaWeb-Thin.woff2", weight: "100" },
    { path: "./peyda/peydaWeb-extralight.woff2", weight: "200" },
    { path: "./peyda/peydaWeb-light.woff2", weight: "300" },
    { path: "./peyda/PeydaWeb-Regular.woff2", weight: "400" },
    { path: "./peyda/PeydaWeb-Medium.woff2", weight: "500" },
    { path: "./peyda/PeydaWeb-SemiBold.woff2", weight: "600" },
    { path: "./peyda/PeydaWeb-Bold.woff2", weight: "700" },
    { path: "./peyda/PeydaWeb-ExtraBold.woff2", weight: "800" },
    { path: "./peyda/PeydaWeb-Black.woff2", weight: "900" },
  ],
});

// Persian display: Gofteh, Heavy only, with Persian numerals.
export const gofteh = localFont({
  variable: "--font-gofteh",
  display: "swap",
  src: [{ path: "./gofteh/GoftehFaNumWeb-Heavy.woff2", weight: "900" }],
});
