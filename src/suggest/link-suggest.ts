import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, MarkdownView, TFile } from "obsidian";
import { LinkSuggesterRule } from "src/LinkSuggesterRule";
import LinkSuggester from "src/main";
import { QueryType } from "src/QueryType";
import { generateMarkdownLink } from "src/utils";

interface ILinkCompletion {
    fileName: string;
}

export class LinkSuggest extends EditorSuggest<ILinkCompletion>{

    private pageQueryString: string = "";
    private pageQueryType: keyof typeof QueryType = "DataviewJS";

    constructor(
        private app: App,
        private plugin: LinkSuggester) {
        super(app)
    }

    getSuggestions(context: EditorSuggestContext): ILinkCompletion[] | Promise<ILinkCompletion[]> {
        const dvApi = this.app.plugins.plugins.dataview?.api
        const query = `return ${this.pageQueryString}.where(p => p.file.name.toLowerCase().includes("${context.query.toLowerCase()}"))`

        const results = (new Function("dv", query))(dvApi, query)

        return results.values.map((page: any) => { return { fileName: page.file.name } })
    }

    onTrigger(cursor: EditorPosition, editor: Editor, file: TFile | null): EditorSuggestTriggerInfo | null {
        const rules = this.plugin.settings.rules
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            const trigger = rule.targetPhrase
            const startPos = this.context?.start || {
                line: cursor.line,
                ch: cursor.ch - trigger.length,
            };

            if (!editor.getRange(startPos, cursor).startsWith(trigger)) {
                continue;
            }
            this.pageQueryString = rule.queryString;
            this.pageQueryType = rule.queryType
            const precedingChar = editor.getRange(
                {
                    line: startPos.line,
                    ch: startPos.ch - 1,
                },
                startPos
            );


            // Short-circuit if `@` as a part of a word (e.g. part of an email address)
            if (precedingChar && /[`a-zA-Z0-9]/.test(precedingChar)) {
                return null;
            }

            const query = editor.getRange(startPos, cursor).substring(trigger.length)

            return {
                start: startPos,
                end: cursor,
                query: query,
            };
        }
        return null
    }

    renderSuggestion(value: ILinkCompletion, el: HTMLElement): void {
        el.setText(value.fileName);
    }

    selectSuggestion(suggestion: ILinkCompletion, event: MouseEvent | KeyboardEvent): void {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
            return;
        }

        const includeAlias = event.shiftKey;
        let renderStr = suggestion.fileName;
        let makeIntoLink = true;

        if (makeIntoLink) {
            renderStr = generateMarkdownLink(
                this.app,
                renderStr
            );
        }

        if (this.context) activeView.editor.replaceRange(renderStr, this.context.start, this.context.end);
    }
}