import { TextDocument, TextEditor, EndOfLine, Position, TextEditorEdit } from "vscode";
import { Regexes } from "./enums";
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
        const eol: string = EndOfLine[this.editor.document.eol] === "LF" ? "\n" : "\r\n";
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
        const document: TextDocument = this.editor.document;
        const eof: number = document.lineCount - 1;
        let lastPropertyLine = -1;
        
        for (let currentLine = 0; currentLine < eof; currentLine ++) {
            const text = document.lineAt(currentLine).text;

            if (RegExp(Regexes.property).test(text)) {
                lastPropertyLine = currentLine;
            }
        }

        if (lastPropertyLine > 0) {
            const lineEnd = document.lineAt(lastPropertyLine).text.length;
            
            return new Position(lastPropertyLine, lineEnd);
        }

        return new Position(eof - 1, 0);
    }

}