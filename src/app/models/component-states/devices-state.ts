import { ComponentState } from './component-state';

export class DevicesComponentState extends ComponentState
{
    selectedDeviceId: string;
    deviceStatusText: string;
    deviceConnected: boolean;
    alwaysScrollToBottom: boolean;
    selectedAdditionalColumns: any[];
    selectedFilterColumn: any;    
}