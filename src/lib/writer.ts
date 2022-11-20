import { TextDocument, TextEditor, EndOfLine, Position, TextEditorEdit, TextLine } from "vscode";
import { Regexes, ErrorLevel } from "./enums";
import ListItem from "./listitem";

export default class Writer
{
    private editor: TextEditor;
    private document: TextDocument;

    public constructor (editor: TextEditor, document: TextDocument)
    {
        this.editor = editor;
        this.document = document;
    }

    public save(items: Array<ListItem>): boolean
    {
        if (this.editor.document !== this.document) {
            return false;
        }

        const tabSize: number = Number(this.editor.options.tabSize);
        const eol: string = EndOfLine[this.document.eol] === "LF" ? "\n" : "\r\n";
        const position: Position = this.findWriteablePosition();

        const code: string = items.map((item: ListItem) => item.accessor.generate(eol, tabSize)).join(eol + eol);

        this.editor.edit(
            (edit: TextEditorEdit) => {
                edit.insert(position, eol + eol + code);
            }
        );

        return true;
    }

    private findWriteablePosition(): Position
    {
        let currentLine: number = this.document.lineCount - 1;

        while (currentLine > 1) {
            currentLine --;
            
            if (this.document.lineAt(currentLine).text.lastIndexOf('}')) {
                return this.document.lineAt(currentLine).range.end;
            }
        }

        throw new Error(`Couldn't find a class inside ${this.document.fileName}.`);
    }

}