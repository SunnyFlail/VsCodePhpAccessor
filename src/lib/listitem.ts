import {QuickPickItem as IQuickPickItem} from "vscode";
import { AbstractAccessor } from "./accessor";

export default class ListItem <T> 
{
    public label: string;
    public description?: string;
    public detail?: string;
    public picked: boolean = true;
    public alwaysShow?: boolean;

    public readonly context: T;

    public constructor(
        label: string,
        description: string,
        context: T
    ){
        this.label = label;
        this.description = description;
        this.context = context;
    }
}