import {QuickPickItem as IQuickPickItem} from "vscode";
import { AbstractAccessor } from "./methods";

export default class ListItem implements IQuickPickItem
{
    public label: string;
    public description?: string;
    public detail?: string;
    public picked: boolean = true;
    public alwaysShow?: boolean;

    public readonly accessor: AbstractAccessor;

    public constructor(
        label: string,
        description: string,
        accessor: AbstractAccessor
    ){
        this.label = label;
        this.description = description;
        this.accessor = accessor;
    }

}