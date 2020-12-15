import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ComponentState } from 'src/app/models/component-states/component-state';
import { ComponentStateType } from 'src/app/models/component-states/component-state-type-enum';
import { DevicesComponentState } from 'src/app/models/component-states/devices-state';

@Injectable()
export class ComponentStateService {

  private componentState: ComponentState = new ComponentState();
  public devicesComponentState$ = new BehaviorSubject<DevicesComponentState>(undefined);

  saveComponentState(_componentType: ComponentStateType, _componentState: ComponentState)
  {
    sessionStorage.setItem(`${_componentType}`, JSON.stringify(_componentState));

    switch(_componentType)
    {
      case ComponentStateType.DevicesComponentState:

      this.devicesComponentState$.next(<DevicesComponentState>_componentState);
        break;
    }
  }

  loadComponentState(_componentType: ComponentStateType) : any
  {
    var loadedComponentState = sessionStorage.getItem(`${_componentType}`)
    this.componentState = JSON.parse(loadedComponentState);

    return this.componentState;
  }
}