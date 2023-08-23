import { QueryType } from "./QueryType";

export class LinkSuggesterRule {
    constructor(
        public id: number = 0,
        public description: string = "",
        public targetPhrase: string = "",
        public queryType: keyof typeof QueryType = "DataviewJS",
        public queryString: string = ""
    ) {

    }

    static copyProperty(target: LinkSuggesterRule, source: LinkSuggesterRule) {
        target.id = source.id;
        target.description = source.description;
        target.targetPhrase = source.targetPhrase;
        target.queryType = source.queryType;
        target.queryString = source.queryString;
    };
}