import { App, Plugin } from 'obsidian';
import { LinkSuggesterRule } from './LinkSuggesterRule';
import { LinkSuggest } from './suggest/link-suggest';
import SettingTab from './SettingTab';
import { Settings, DEFAULT_SETTINGS } from './Settings';

export default class LinkSuggester extends Plugin {
	settings: Settings;
	public initialRules: Array<LinkSuggesterRule> = []

	async onload() {
		await this.loadSettings();

		this.settings.rules.forEach(rule => {
			const linkSuggesterRule: LinkSuggesterRule = { ...rule };
			this.initialRules.push(linkSuggesterRule);
		});

		this.addSettingTab(new SettingTab(this));

		this.registerEditorSuggest(new LinkSuggest(this.app, this))
		console.log("Link suggester loaded")

	}

	onunload() {
		console.log("Link suggester unloaded")
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		this.settings.rules = this.initialRules;
		await this.saveData(this.settings);
	}
}