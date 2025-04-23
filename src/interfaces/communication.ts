
export interface ShowMessage {
    type: 'info' | 'error' | 'question' | 'warning';
    title: string;
    message: string;
}
