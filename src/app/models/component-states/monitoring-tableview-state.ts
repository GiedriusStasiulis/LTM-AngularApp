import { ComponentState } from './component-state';

export class MonitoringTableviewState extends ComponentState
{
    selectedDeviceId: string;
    deviceStatusText: string;
    deviceConnected: boolean;
    alwaysScrollToBottom: boolean;
    showDecimalValues: boolean;
    showSignalNames: boolean;
}