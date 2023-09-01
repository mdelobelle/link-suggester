import { Setting } from "obsidian";
import SettingTab from "./SettingTab";
import RuleSettingModal from "./RuleSettingModal";
import { LinkSuggesterRule } from "./LinkSuggesterRule";

export default class FolderSetting extends Setting {
    private ruleDescriptionContainer: HTMLDivElement;
    private targetPhraseContainer: HTMLSpanElement;
    private queryContainer: HTMLSpanElement;

    constructor(
        private tab: SettingTab,
        public linkSuggesterRule: LinkSuggesterRule
    ) {
        super(tab.rulesContainer);
        this.setTextContentWithname();
        this.addPutBeforeButton();
        this.addPutAfterButton();
        this.addEditButton();
        this.addDeleteButton();
        this.settingEl.addClass("no-border")
    };

    public setTextContentWithname(): void {
        const rule = this.linkSuggesterRule


        this.infoEl.textContent = "";
        this.infoEl.addClass("setting-item-content")
        this.ruleDescriptionContainer = this.infoEl.createDiv("description")
        this.ruleDescriptionContainer.setText(rule.description)
        this.targetPhraseContainer = this.ruleDescriptionContainer.createSpan("target-phrase")
        this.targetPhraseContainer.setText(rule.targetPhrase)
        this.queryContainer = this.infoEl.createSpan("query-string")
        this.queryContainer.setText(rule.queryString)

    };

    private addPutBeforeButton(): void {
        if (this.linkSuggesterRule.id !== this.tab.plugin.settings.rules.first()?.id) {
            this.addButton((b) => {
                b.setIcon("chevron-up")
                    .onClick(() => {
                        const cmds = this.tab.plugin.settings.rules
                        const pos = cmds.map(c => c.id).indexOf(this.linkSuggesterRule.id);
                        [cmds[pos - 1], cmds[pos]] = [cmds[pos], cmds[pos - 1]]
                        this.tab.plugin.saveSettings();
                        this.tab.buildRules();
                    })
            })
        }
    }

    private addPutAfterButton(): void {
        if (this.linkSuggesterRule.id !== this.tab.plugin.settings.rules.last()?.id) {
            this.addButton((b) => {
                b.setIcon("chevron-down")
                    .onClick(() => {
                        const cmds = this.tab.plugin.settings.rules
                        const pos = cmds.map(c => c.id).indexOf(this.linkSuggesterRule.id);
                        [cmds[pos], cmds[pos + 1]] = [cmds[pos + 1], cmds[pos]]
                        this.tab.plugin.saveSettings();
                        this.tab.buildRules();

                    })
            })
        }
    }

    private addEditButton(): void {
        this.addButton((b) => {
            b.setIcon("pencil")
                .setTooltip("Edit")
                .onClick(() => {
                    let modal = new RuleSettingModal(this.tab, this, this.linkSuggesterRule);
                    modal.open();
                });
        });
    };

    private addDeleteButton(): void {
        this.addButton((b) => {
            b.setIcon("trash")
                .setTooltip("Delete")
                .onClick(() => {
                    const currentExistingProperty = this.tab.plugin.initialRules.filter(p => p.id == this.linkSuggesterRule.id)[0];
                    if (currentExistingProperty) {
                        this.tab.plugin.initialRules.remove(currentExistingProperty);
                    };
                    this.settingEl.parentElement?.removeChild(this.settingEl);
                    this.tab.plugin.saveSettings();
                });
        });
    };

};