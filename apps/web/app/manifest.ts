import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyFit Marketing Manager",
    short_name: "MyFit",
    description: "Osobní AI marketingový manažer pro MyFit.",
    start_url: "/today",
    display: "standalone",
    background_color: "#efe1ce",
    theme_color: "#0a0b0e",
    lang: "cs",
  };
}
