import { ConfigurationTarget, TextDocument, TextEditor, WorkspaceConfiguration, workspace, window, Position, EndOfLine, TextEditorEdit, commands} from "vscode";
import { CommandType, ConfigKeys } from "./enums";

type NamespaceDictionary = {
    [key: string]: string;
};

export default class BoilerplateGenerator
{
    private config: WorkspaceConfiguration;

    public constructor(config: WorkspaceConfiguration)
    {
        this.config = config;
    }

    public async generate(document: TextDocument, editor: TextEditor, type: CommandType)
    {
        if (document.uri.scheme !== 'file') {
            throw new Error("File isn't located locally!");
        }
        const rootPath = workspace.rootPath;
        
        if (typeof rootPath === 'undefined') {
            throw new Error("Couldn't resolve project root path!");
        }

        const fileName = getFileName(document);
        const localPath: string = document.fileName.replace(rootPath, '');
        const composerPath = await this.getComposerPath();
        const localComposerPath = composerPath.replace(rootPath, '');
        const composerDirFromRoot = getFileDirectoryFromRoot(localComposerPath, 'composer.json');
        const fileDirFromComposer = getFileDirectoryFromRoot(localPath, fileName).replace(composerDirFromRoot, '');
        const namespaces = await this.getWorkspaceNamespaces(composerPath);
        const namespace = this.resolveNamespace(namespaces, fileDirFromComposer);
        const className = fileName.split('.')[0];

        const tabSize: number = Number(editor.options.tabSize);
        const eol: string = EndOfLine[document.eol] === "LF" ? "\n" : "\r\n";
        const boilerPlate = this.getBoilerPlate(namespace, className, eol, tabSize, type);

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

    private async getComposerPath(): Promise<string>
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

    private getBoilerPlate(namespace: string, className: string, eol: string, tabSize: number, type: CommandType): string
    {
        const tab = ` `.repeat(tabSize);

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