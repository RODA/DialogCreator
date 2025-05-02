import { EventEmitter } from 'events';
import { Elements } from './elements';

export interface ShowMessage {
    type: 'info' | 'error' | 'question' | 'warning';
    title: string;
    message: string;
}

export interface Global {
    messenger: EventEmitter;
    elements: Elements;
    elementSelected: boolean;
    fontSize: number;
    fontFamily: string;
    maxWidth: number;
    maxHeight: number;
    dialog: HTMLDivElement;
    dialogId: string;
    selectedElementId: string;
    handlers: {
        [key: string]: {
            module: string;
            functioname: string;
        }
    }
}