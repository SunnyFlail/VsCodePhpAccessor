import { ConfigurationTarget, TextDocument, TextEditor, WorkspaceConfiguration, workspace, window, Position, EndOfLine, TextEditorEdit, commands} from "vscode";
import ExtensionSettings from "./client/settings";
import { CommandType, ConfigKeys } from "./enums";
import { Search } from "./search";

type NamespaceDictionary = {
    [key: string]: string;
};

export default class BoilerplateGenerator
{
    private search: Search;
    private settings: ExtensionSettings;

    public constructor(search: Search, settings: ExtensionSettings) {
        this.search = search;
        this.settings = settings;
    }

    public async generate(document: TextDocument, editor: TextEditor, type: CommandType)
    {
        if (document.uri.scheme !== 'file') {
            throw new Error("File isn't located locally!");
        }

        const rootPath = workspace.rootPath;
        
        if (rootPath === undefined) {
            throw new Error("Couldn't resolve project root path!");
        }

        const fileName = getFileName(document);
        const localPath: string = document.fileName.replace(rootPath, '');
        const composerPath = await this.search.getComposerPath();
        const localComposerPath = composerPath.replace(rootPath, '');
        const composerDirFromRoot = getFileDirectoryFromRoot(localComposerPath, 'composer.json');
        const fileDirFromComposer = getFileDirectoryFromRoot(localPath, fileName).replace(composerDirFromRoot, '');
        const namespaces = await this.getWorkspaceNamespaces(composerPath);
        const namespace = this.resolveNamespace(namespaces, fileDirFromComposer);
        const className = fileName.split('.')[0];

        const tabSize: number = Number(editor.options.tabSize);
        const boilerPlate = this.getBoilerPlate(namespace, className, type);

        editor.edit(
            (edit: TextEditorEdit) => {
                edit.insert(new Position(0, 0), boilerPlate);
            }
        );

        function getFileName(document: TextDocument): string
        {
            const path = document.fileName;
            let split = path.split('\\');

            if (split.length > 1) {
                return split[split.length - 1];
            }

            split = path.split('/');

            return split[split.length - 1];
        }

        function getFileDirectoryFromRoot(filePath: string, fileName: string): string
        {
            filePath = filePath.replace(fileName, '');

            if (filePath.charAt(filePath.length - 1) in ['/', '\\']) {
                filePath = filePath.slice(0, filePath.length - 1);
            }

            return filePath;
        }
    }

    private resolveNamespace(namespaces: NamespaceDictionary, fileDirFromComposer: string): string
    {
        fileDirFromComposer = preparePath(fileDirFromComposer);

        return findAndPrepareMatchingNamespace(namespaces, fileDirFromComposer);


        function findAndPrepareMatchingNamespace(namespaces: NamespaceDictionary, fileDirFromComposer: string): string
        {
            for (const [namespace, path] of Object.entries(namespaces)) {
                if (fileDirFromComposer.startsWith(path)) {
                    fileDirFromComposer = fileDirFromComposer.replace(path, '');
                    const finalNamespace = fileDirFromComposer.split('/');
                    finalNamespace.unshift(...namespace.split('\\'));

                    return finalNamespace.filter(val => val.length > 0).join('\\');
                }
            }

            throw new Error("Couldn't resolve file namespace");
        }

        function preparePath(path: string): string
        {
            if (path.indexOf('\\')) {
                return path.replace(/\\/, '/');
            }

            return path;
        }
    }

    private async getWorkspaceNamespaces(composerPath: string): Promise<NamespaceDictionary>
    {
        const composer: TextDocument = await workspace.openTextDocument(composerPath);
        const contents: object = JSON.parse(composer.getText());
        const namespaces = findNamespaces(contents);

        if (!namespaces) {
            throw new Error(`${composerPath} doesn't specify a PSR-4 namespace`);
        }

        return namespaces;

        function findNamespaces(contents: object): NamespaceDictionary | null
        {
            if (!('autoload' in contents)) {
                return null;
            }
            //@ts-ignore
            if (!('psr-4' in contents.autoload)) {
                return null;
            }
            //@ts-ignore
            return contents.autoload['psr-4'];
        }
    }

    private getBoilerPlate(namespace: string, className: string, type: CommandType): string
    {
        const tab = this.settings.tab;
        const eol = this.settings.eol;

        const typeName = getType(type);

        return [
            `<?php`,
            ``,
            `namespace ${namespace};`,
            ``,
            `${typeName} ${className}`,
            `{`,
            `${tab}`,
            `}`,
            ``
        ].join(eol);

        function getType(type: CommandType): string
        {
            switch (type) {
                case CommandType.ClassBoilerplate:
                    return 'class';
                case CommandType.InterfaceBoilerplate:
                    return 'interface';
                case CommandType.TraitBoilerplate:
                    return 'trait';
            }

            throw new Error(`Unknown boilerplate type ${CommandType[type].replace('BoilerPlate', '')}`);
        }
    }
}