import { cookies } from "next/headers";
import { resolveLanguage, type Language } from "@/lib/public-content";

export async function resolveRequestLanguage(rawLang?: string): Promise<Language> {
  if (rawLang === "en" || rawLang === "bn") {
    return rawLang;
  }

  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get("portfolio-language")?.value;
  return resolveLanguage(cookieLanguage);
}
