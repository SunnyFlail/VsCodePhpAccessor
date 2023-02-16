import { TextDocument, TextEditor, EndOfLine, Position, TextEditorEdit } from "vscode";
import { IWriterGenerationStrategy, IWriterPositionStrategy } from "./strategies/writer";

export default class Writer<T>
{
    private editor: TextEditor;
    private document: TextDocument;
    private generator: IWriterGenerationStrategy;
    private positionFinder: IWriterPositionStrategy;

    public constructor (
        editor: TextEditor,
        document: TextDocument,
        generator: IWriterGenerationStrategy,
        positionFinder: IWriterPositionStrategy,
    ) {
        this.editor = editor;
        this.document = document;
        this.generator = generator;
        this.positionFinder = positionFinder;
    }

    public save(items: Array<T>): void {
        if (this.editor.document !== this.document) {
            throw new Error(`You need to be on same file!`);
        }

        const tabSize: number = Number(this.editor.options.tabSize);
        const eol: string = EndOfLine[this.document.eol] === "LF" ? "\n" : "\r\n";
        const position: Position | undefined = this.positionFinder.findWriteablePosition(items);

        if (!position) {
            throw new Error(`Couldn't find a place to write in ${this.document.fileName}.`);
        }

        const code: string = this.generator.generate(items, tabSize, eol);

        this.editor.edit(
            (edit: TextEditorEdit) => {
                edit.insert(position, eol + eol + code);
            }
        );
    }
}