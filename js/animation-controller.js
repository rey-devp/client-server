/**
 * State machine for step navigation and autoplay.
 */
class AnimationController {
  /**
   * @param {object} options
   * @param {typeof SCENES} options.scenes
   * @param {number} [options.intervalMs]
   * @param {(step: number, scene: object) => void} [options.onStepChange]
   */
  constructor(options) {
    this.scenes = options.scenes;
    this.intervalMs = options.intervalMs ?? 2800;
    this.onStepChange = options.onStepChange ?? (() => {});

    this.currentStep = 0;
    this.isPlaying = false;
    this.autoplayEnabled = true;
    this._timerId = null;
  }

  get scene() {
    return this.scenes[this.currentStep];
  }

  get lastIndex() {
    return this.scenes.length - 1;
  }

  play() {
    if (this.isPlaying) {
      return;
    }
    this.isPlaying = true;
    if (this.autoplayEnabled) {
      this._startTimer();
    }
    this._notify();
  }

  pause() {
    this.isPlaying = false;
    this._clearTimer();
    this._notify();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setAutoplay(enabled) {
    this.autoplayEnabled = Boolean(enabled);
    if (this.isPlaying) {
      this._clearTimer();
      if (this.autoplayEnabled) {
        this._startTimer();
      }
    }
  }

  /**
   * Manual navigation pauses autoplay timer.
   */
  next(manual = true) {
    if (manual) {
      this._pauseForManual();
    }
    const nextStep = this.currentStep >= this.lastIndex ? 0 : this.currentStep + 1;
    this.goTo(nextStep, false);
    if (!manual && this.isPlaying && this.autoplayEnabled) {
      this._startTimer();
    }
  }

  prev(manual = true) {
    if (manual) {
      this._pauseForManual();
    }
    const prevStep = this.currentStep <= 0 ? this.lastIndex : this.currentStep - 1;
    this.goTo(prevStep, false);
    if (!manual && this.isPlaying && this.autoplayEnabled) {
      this._startTimer();
    }
  }

  reset() {
    this.pause();
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

  _pauseForManual() {
    this._clearTimer();
    this.isPlaying = false;
  }

  _startTimer() {
    this._clearTimer();
    this._timerId = window.setInterval(() => {
      this.next(false);
    }, this.intervalMs);
  }

  _clearTimer() {
    if (this._timerId !== null) {
      window.clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  _notify() {
    this.onStepChange(this.currentStep, this.scene);
  }
}
