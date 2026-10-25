import type { Locale } from "../dictionaries";
import { en, type AppDict } from "./en";
import { fa } from "./fa";

export type { AppDict };

const dicts = { en, fa } as const;

export const getAppDict = (locale: Locale): AppDict => dicts[locale];
