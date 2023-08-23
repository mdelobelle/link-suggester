import { ButtonComponent, Modal, Notice, TextComponent, TextAreaComponent, DropdownComponent } from "obsidian";
import { LinkSuggesterRule } from "./LinkSuggesterRule";
import { QueryType } from "./QueryType";
import RuleSetting from "./RuleSetting";
import SettingTab from "./SettingTab";

export default class RuleSettingModal extends Modal {
    private descriptionPromptComponent: TextComponent;
    private saved: boolean = false;
    private rule: LinkSuggesterRule;
    private initialRule: LinkSuggesterRule;
    private new: boolean = true;

    constructor(
        private settingTab: SettingTab,
        private parentSetting?: RuleSetting,
        rule?: LinkSuggesterRule
    ) {
        super(settingTab.plugin.app);
        if (rule) {
            this.new = false;
            this.rule = rule;
            this.initialRule = { ...this.initialRule }
        } else {
            let newId = 1;
            this.settingTab.plugin.initialRules.forEach(iRule => {
                if (iRule.id && iRule.id >= newId) {
                    newId = iRule.id + 1;
                };
            });
            this.rule = new LinkSuggesterRule();
            this.rule.id = newId;
            this.initialRule = new LinkSuggesterRule();
            this.initialRule.id = newId;
        };
    };

    async onOpen(): Promise<void> {
        this.containerEl.addClass("link-suggester")
        if (this.rule.description == "") {
            this.titleEl.setText(`Add a rule`);
        } else {
            this.titleEl.setText(`Manage settings settings for ${this.rule.description}`);
        };

        /* Name */
        this.createDescriptionContainer();
        this.createTargetPhraseContainer();
        /* Type */
        const typeSelectContainer = this.contentEl.createDiv({ cls: "field-container" });

        this.createQueryStringContainer();
        this.contentEl.createEl("hr");

        const footer = this.contentEl.createDiv({ cls: "footer-actions" });
        footer.createDiv({ cls: "spacer" })
        this.createSaveButton(footer);
        this.createCancelButton(footer);
        /* init state*/
        this.createQueryTypeSelectContainer(typeSelectContainer);
    };

    onClose(): void {
        Object.assign(this.rule, this.initialRule);
        if (!this.new && this.parentSetting) {
            this.parentSetting.setTextContentWithname()
        } else if (this.saved) {
            new RuleSetting(this.settingTab, this.rule);
        };
    };

    private createDescriptionContainer(): void {
        const container = this.contentEl.createDiv({ cls: "field-container" })
        container.createDiv({ cls: "label", text: "Description: " });
        const input = new TextComponent(container);
        input.inputEl.addClass("with-label");
        input.inputEl.addClass("full-width");
        const description = this.rule.description;
        input.setValue(description);
        input.onChange(value => {
            this.rule.description = value;
            this.titleEl.setText(`Manage options for ${this.rule.description}`);
            RuleSettingModal.removeValidationError(input);
        });
        this.descriptionPromptComponent = input;
    };

    private createTargetPhraseContainer(): void {
        const container = this.contentEl.createDiv({ cls: "field-container" })
        container.createDiv({ cls: "label", text: "Target Phrase: " });
        const input = new TextComponent(container);
        input.setPlaceholder("&p")
        input.inputEl.addClass("with-label");
        input.inputEl.addClass("full-width");
        const targetPhrase = this.rule.targetPhrase;
        input.setValue(targetPhrase);
        input.onChange(phrase => {
            this.rule.targetPhrase = phrase;
            RuleSettingModal.removeValidationError(input);
        });
    };

    private createQueryStringContainer(): void {
        const container = this.contentEl.createDiv({ cls: "vstacked" });
        container.createEl("span", { text: "Query String" });
        container.createEl("span", { cls: "sub-text", text: "Write the query returning filtered pages to the suggester" });
        const inputContainer = container.createDiv({ cls: "field-container" });
        const input = new TextAreaComponent(inputContainer);
        input.inputEl.addClass("full-width");
        const queryString = this.rule.queryString
        input.setValue(queryString);
        input.setPlaceholder('dv.pages("#People")');
        input.onChange(value => {
            this.rule.queryString = value;
            RuleSettingModal.removeValidationError(input);
        });
    };

    private createQueryTypeSelectContainer(parentNode: HTMLDivElement): void {
        const typeSelectorContainerLabel = parentNode.createDiv({ cls: "label" });
        typeSelectorContainerLabel.setText(`Query type:`);
        parentNode.createDiv({ cls: "spacer" })
        const select = new DropdownComponent(parentNode);
        Object.keys(QueryType).forEach(t => select.addOption(t, t))
        if (this.rule.queryType) {
            select.setValue(this.rule.queryType)
        }

        select.onChange((t: keyof typeof QueryType) => {
            this.rule = { ...this.rule };
            this.rule.description = this.descriptionPromptComponent.getValue()
            this.rule.queryType = t;
            if (this.rule.queryType !== this.initialRule.queryType) {
                this.rule.queryString = ""
            }
        })
    }

    private validateFields(): boolean {
        return true
    }

    private createSaveButton(container: HTMLDivElement): void {
        const b = new ButtonComponent(container)
        b.setTooltip("Save");
        b.setIcon("checkmark");
        b.onClick(async () => {
            let error = !this.validateFields();
            if (error) {
                new Notice("Fix errors before saving.");
                return;
            };
            this.saved = true;
            const currentExistingRule = this.settingTab.plugin.initialRules.filter(p => p.id == this.rule.id)[0];
            if (currentExistingRule) {
                LinkSuggesterRule.copyProperty(currentExistingRule, this.rule);
            } else {
                this.settingTab.plugin.initialRules.push(this.rule);
            };
            LinkSuggesterRule.copyProperty(this.initialRule, this.rule)
            if (this.parentSetting) LinkSuggesterRule.copyProperty(this.parentSetting.linkSuggesterRule, this.rule);
            this.parentSetting?.setTextContentWithname()
            this.settingTab.plugin.saveSettings();
            this.close();
        });
    };

    private createCancelButton(container: HTMLDivElement): void {
        const b = new ButtonComponent(container);
        b.setIcon("cross")
            .setTooltip("Cancel")
            .onClick(() => {
                this.saved = false;
                /* reset options from settings */
                if (this.initialRule.description != "") {
                    Object.assign(this.rule, this.initialRule);
                };
                this.close();
            });
    };

    /* utils functions */

    public static setValidationError(textInput: TextComponent, message?: string) {
        textInput.inputEl.addClass("is-invalid");
        const fieldContainer = textInput.inputEl.parentElement;
        const fieldsContainer = fieldContainer?.parentElement;
        if (message && fieldsContainer) {
            let mDiv = fieldsContainer.querySelector(".field-error") as HTMLDivElement;
            if (!mDiv) mDiv = createDiv({ cls: "field-error" });
            mDiv.innerText = message;
            fieldsContainer.insertBefore(mDiv, fieldContainer);
        }
    }
    public static removeValidationError(textInput: TextComponent | TextAreaComponent) {
        if (textInput.inputEl.hasClass("is-invalid")) textInput.inputEl.removeClass("is-invalid");
        const fieldContainer = textInput.inputEl.parentElement;
        const fieldsContainer = fieldContainer?.parentElement;
        const fieldError = fieldsContainer?.querySelector(".field-error")
        if (fieldError) fieldsContainer!.removeChild(fieldError)
    };
};