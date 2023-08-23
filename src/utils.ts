import { App, normalizePath } from "obsidian";

export function generateMarkdownLink(app: App, subpath: string, alias?: string) {
    const useMarkdownLinks = (app.vault as any).getConfig("useMarkdownLinks");
    const path = normalizePath(subpath);

    if (useMarkdownLinks) {
        if (alias) {
            return `[${alias}](${path.replace(/ /g, "%20")})`;
        } else {
            return `[${subpath}](${path})`;
        }
    } else {
        if (alias) {
            return `[[${path}|${alias}]]`;
        } else {
            return `[[${path}]]`;
        }
    }
}