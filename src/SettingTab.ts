import { PluginSettingTab, Setting, ButtonComponent, ToggleComponent, Modal, DropdownComponent, moment, setIcon } from "obsidian";
import Plugin from "./main";

import RuleSetting from "./RuleSetting";
import FolderSettingModal from "./RuleSettingModal"
import { LinkSuggesterRule } from "./LinkSuggesterRule";
import RuleSettingModal from "./RuleSettingModal";

export default class SettingTab extends PluginSettingTab {
    public plugin: Plugin;
    public rulesContainer: HTMLDivElement;

    constructor(plugin: Plugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.containerEl.addClass("link-suggester")
        this.containerEl.addClass("settings")
    };

    private createSettingGroup(title: string, subTitle?: string, withButton: boolean = false): HTMLDivElement {
        const settingHeader = this.containerEl.createEl('div')
        const settingHeaderContainer = settingHeader.createEl("div", { cls: "header-container" });
        const settingHeaderTextContainer = settingHeaderContainer.createEl("div", { cls: "text-container" });
        settingHeaderTextContainer.createEl('h4', { text: title, cls: "section-header" });
        if (subTitle) settingHeaderTextContainer.createEl('div', { text: subTitle, cls: "setting-item-description" });

        const settingsContainer = this.containerEl.createEl("div");
        if (withButton) {
            const settingsContainerShowButtonContainer = settingHeaderContainer.createEl("div", { cls: "setting-item-control" });
            const settingsContainerShowButton = new ButtonComponent(settingsContainerShowButtonContainer);
            settingsContainerShowButton.buttonEl.addClass("setting-item-control");
            settingsContainer.hide();
            settingsContainerShowButton.setCta();
            settingsContainerShowButton.setIcon("chevrons-up-down");

            const toggleState = () => {
                if (settingsContainer.isShown()) {
                    settingsContainer.hide();
                    settingsContainerShowButton.setIcon("chevrons-up-down");
                    settingsContainerShowButton.setCta();
                } else {
                    settingsContainer.show();
                    settingsContainerShowButton.setIcon("chevrons-down-up");
                    settingsContainerShowButton.removeCta();
                }
            }
            settingsContainerShowButton.onClick(() => toggleState());
        }
        return settingsContainer
    }

    public buildRules() {
        this.rulesContainer.replaceChildren();
        this.plugin.initialRules.forEach(rule => {
            const linkSuggesterRule: LinkSuggesterRule = { ...rule }
            new RuleSetting(this, linkSuggesterRule);
        });
    }

    display() {
        let { containerEl } = this;
        containerEl.empty();

        /* 
        -----------------------------------------
        Global Settings 
        -----------------------------------------
        */

        /* 
        -----------------------------------------
        Commands Settings 
        -----------------------------------------
        */

        const rulesSettings = this.createSettingGroup(
            'Rules',
            "All rules",
            true
        )
        new Setting(rulesSettings)
            .setName("Add New Rule Setting")
            .setDesc("Add a new target phrase for which you want to create and suggester .")
            .addButton((button: ButtonComponent): ButtonComponent => {
                return button
                    .setTooltip("Add New Rule")
                    .setButtonText("Add new")
                    .setCta()
                    .onClick(async () => {
                        let modal = new RuleSettingModal(this);
                        modal.open();
                    });
            }).settingEl.addClass("no-border");

        this.rulesContainer = rulesSettings.createDiv();
        this.buildRules();

    }
}