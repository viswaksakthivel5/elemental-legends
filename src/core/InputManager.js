/**
 * InputManager.js
 * Handles keyboard, mouse buttons, pointer lock, mouse delta, and hotkeys.
 */

export class InputManager {
  constructor() {
    this.keys = {};
    this.mouseButtons = {};
    this.mouseDelta = { x: 0, y: 0 };
    this.mouseSensitivity = 0.0022;
    this.isPointerLocked = false;
    this.domElement = null;

    // Combat & interaction action flags (cleared after consumed or timed out)
    this.actions = {
      lightAttack: false,
      heavyAttack: false,
      dodge: false,
      skill: false,
      ultimate: false,
      interact: false,
      lockTarget: false,
      echoVision: false,
      switchFire: false,
      switchIce: false,
      switchStorm: false,
      pause: false
    };

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onContextMenu = (e) => e.preventDefault();
  }

  init(domElement) {
    this.domElement = domElement;

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    domElement.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('mousemove', this._onMouseMove);
    domElement.addEventListener('wheel', this._onWheel, { passive: true });
    domElement.addEventListener('contextmenu', this._onContextMenu);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
  }

  requestPointerLock() {
    if (this.domElement && !this.isPointerLocked) {
      try {
        const p = this.domElement.requestPointerLock();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            // Pointer lock might require direct canvas click in some browsers
          });
        }
      } catch (e) {
        console.warn('Pointer lock request error:', e);
      }
    }
  }

  exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  _onPointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
  }

  _onKeyDown(e) {
    const key = e.key.toLowerCase();
    this.keys[key] = true;

    if (key === 'escape') {
      this.actions.pause = true;
    }
    if (key === '1') {
      this.actions.switchFire = true;
    }
    if (key === '2') {
      this.actions.switchIce = true;
    }
    if (key === '3') {
      this.actions.switchStorm = true;
    }
    if (key === ' ' || key === 'shift') {
      this.actions.dodge = true;
    }
    if (key === 'q' || key === 'f') {
      this.actions.skill = true;
    }
    if (key === 'r') {
      this.actions.ultimate = true;
    }
    if (key === 'e') {
      this.actions.interact = true;
    }
    if (key === 'v' || key === 'c') {
      this.actions.echoVision = true;
    }
    if (key === 'tab') {
      e.preventDefault();
      this.actions.lockTarget = true;
    }
  }

  _onKeyUp(e) {
    const key = e.key.toLowerCase();
    this.keys[key] = false;
  }

  _onMouseDown(e) {
    this.mouseButtons[e.button] = true;

    // If not locked, first click will lock pointer
    if (!this.isPointerLocked) {
      this.requestPointerLock();
    }

    if (e.button === 0) {
      this.actions.lightAttack = true;
    } else if (e.button === 2) {
      this.actions.heavyAttack = true;
    } else if (e.button === 1) {
      this.actions.lockTarget = true;
    }
  }

  _onMouseUp(e) {
    this.mouseButtons[e.button] = false;
  }

  _onMouseMove(e) {
    if (this.isPointerLocked) {
      this.mouseDelta.x += e.movementX || 0;
      this.mouseDelta.y += e.movementY || 0;
    }
  }

  _onWheel(e) {
    if (e.deltaY > 0) {
      // Wheel down
      this.actions.switchStorm = true;
    } else if (e.deltaY < 0) {
      // Wheel up
      this.actions.switchFire = true;
    }
  }

  getMovementVector() {
    let x = 0;
    let z = 0;

    if (this.keys['w'] || this.keys['arrowup']) z -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) z += 1;
    if (this.keys['a'] || this.keys['arrowleft']) x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) x += 1;

    const len = Math.hypot(x, z);
    if (len > 0.0001) {
      x /= len;
      z /= len;
    }

    return { x, z, isMoving: len > 0.0001 };
  }

  consumeAction(actionName) {
    const val = this.actions[actionName];
    this.actions[actionName] = false;
    return val;
  }

  consumeMouseDelta() {
    const dx = this.mouseDelta.x * this.mouseSensitivity;
    const dy = this.mouseDelta.y * this.mouseSensitivity;
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return { dx, dy };
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    if (this.domElement) {
      this.domElement.removeEventListener('mousedown', this._onMouseDown);
      this.domElement.removeEventListener('wheel', this._onWheel);
      this.domElement.removeEventListener('contextmenu', this._onContextMenu);
    }
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
  }
}
