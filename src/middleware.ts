import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/lib/i18n/locales";

export default createMiddleware({ locales, defaultLocale });

export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
