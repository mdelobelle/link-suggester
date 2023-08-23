import { LinkSuggesterRule } from "./LinkSuggesterRule";

export interface Settings {
    rules: LinkSuggesterRule[];
}

export const DEFAULT_SETTINGS: Settings = {
    rules: []
}