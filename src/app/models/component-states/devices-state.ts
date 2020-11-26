import { LinFrame } from '../../models/linFrame'
import { ComponentState } from './component-state';

export class DevicesComponentState extends ComponentState
{
    deviceId: string;
    deviceConnected: boolean;
    linFrames: LinFrame[]
}