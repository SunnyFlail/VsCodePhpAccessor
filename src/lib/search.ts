import { ConfigurationTarget, workspace, WorkspaceConfiguration } from "vscode";
import { ConfigKeys } from "./enums";

export class Search {
    private config: WorkspaceConfiguration;

    public constructor(config: WorkspaceConfiguration)
    {
        this.config = config;
    }

    public async getComposerPath(): Promise<string>
    {
        let pathToComposerJson: string | undefined = this.config.get(ConfigKeys.pathToComposerJson);

        if ((typeof pathToComposerJson !== 'undefined') && String(pathToComposerJson).length > 0) {
            return String(pathToComposerJson);
        }

        const files = await workspace.findFiles('*/composer.json');

        if (!Array.isArray(files) || files.length < 1) {
            throw new Error("Couldn't find composer.json");
        }

        pathToComposerJson = String(files[0].path);

        this.config.update(ConfigKeys.pathToComposerJson, pathToComposerJson, ConfigurationTarget.WorkspaceFolder);

        return pathToComposerJson;
    }
}