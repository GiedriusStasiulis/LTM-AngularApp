import { ComponentState } from './component-state';

export class DevicesComponentState extends ComponentState
{
    deviceId: string;
    deviceConnected: boolean;
    sessionId: string;
    alwaysScrollToBottom: boolean;
}