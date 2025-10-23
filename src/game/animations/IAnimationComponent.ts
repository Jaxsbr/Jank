import { IComponent } from '../ecs/IComponent';

export interface IAnimationComponent extends IComponent {
  update(deltaTime: number): void;
}