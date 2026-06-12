/**
 * State machine for step navigation (manual only).
 */
class AnimationController {
  /**
   * @param {object} options
   * @param {typeof SCENES} options.scenes
   * @param {(step: number, scene: object) => void} [options.onStepChange]
   */
  constructor(options) {
    this.scenes = options.scenes;
    this.onStepChange = options.onStepChange ?? (() => {});
    this.currentStep = 0;
  }

  get scene() {
    return this.scenes[this.currentStep];
  }

  get lastIndex() {
    return this.scenes.length - 1;
  }

  next() {
    const nextStep = this.currentStep >= this.lastIndex ? 0 : this.currentStep + 1;
    this.goTo(nextStep, true);
  }

  prev() {
    const prevStep = this.currentStep <= 0 ? this.lastIndex : this.currentStep - 1;
    this.goTo(prevStep, true);
  }

  reset() {
    this.goTo(0, false);
  }

  goTo(step, notify = true) {
    const clamped = Math.max(0, Math.min(step, this.lastIndex));
    if (clamped === this.currentStep && notify) {
      this._notify();
      return;
    }
    this.currentStep = clamped;
    if (notify) {
      this._notify();
    }
  }

  _notify() {
    this.onStepChange(this.currentStep, this.scene);
  }
}
