import { EventEmitter } from 'events';
import { Elements } from './elements';

export interface ShowMessage {
    type: 'info' | 'error' | 'question' | 'warning';
    title: string;
    message: string;
}

export interface Global {
    emit(channel: string, ...args: unknown[]): void;
    send(channel: string, ...args: unknown[]): void;
    sendTo(window: string, channel: string, ...args: unknown[]): void;
    on(channel: string, listener: (...args: unknown[]) => void): void;
    handlers: { [key: string]: string };
    elements: Elements;
    elementSelected: boolean;
    fontSize: number;
    fontFamily: string;
    maxWidth: number;
    maxHeight: number;
    dialog: HTMLDivElement;
    dialogId: string;
    selectedElementId: string;
}