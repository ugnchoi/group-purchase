/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  alternateRefs: [
    {
      href: "http://localhost:3000/ko",
      hreflang: "ko",
    },
    {
      href: "http://localhost:3000/en",
      hreflang: "en",
    },
  ],
  defaultLocale: "ko",
  locales: ["ko", "en"],
};
