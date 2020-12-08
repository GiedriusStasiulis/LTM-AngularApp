import { ComponentState } from './component-state';

export class SettingsComponentState extends ComponentState
{
    userId: string;
    settingsChanged: boolean;
    settingsSaved: boolean;
}