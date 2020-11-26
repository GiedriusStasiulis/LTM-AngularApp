import { Injectable } from '@angular/core';
import { ComponentState } from 'src/app/models/component-states/component-state';
import { ComponentStateType } from 'src/app/models/component-states/component-state-type-enum';

@Injectable()
export class ComponentStateService {

  private componentState: ComponentState = new ComponentState();

  saveComponentState(_componentType: ComponentStateType, _componentState: ComponentState)
  {
    sessionStorage.setItem(`${_componentType}`, JSON.stringify(_componentState));
  }

  loadComponentState(_componentType: ComponentStateType) : any
  {
    var loadedComponentState = sessionStorage.getItem(`${_componentType}`)
    this.componentState = JSON.parse(loadedComponentState);

    return this.componentState;
  }
}