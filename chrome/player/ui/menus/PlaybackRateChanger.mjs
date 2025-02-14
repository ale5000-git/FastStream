import {EventEmitter} from '../../modules/eventemitter.mjs';
import {Utils} from '../../utils/Utils.mjs';
import {WebUtils} from '../../utils/WebUtils.mjs';
import {DOMElements} from '../DOMElements.mjs';

export class PlaybackRateChanger extends EventEmitter {
  constructor() {
    super();
    this.stayOpen = false;
    this.playbackRate = 1;
    this.playbackElements = [];
  }

  openUI(dontSetStayVisible = false) {
    this.emit('open', {
      target: DOMElements.playbackRate,
    });

    DOMElements.rateMenuContainer.style.display = '';
    this.scrollToPosition();
    if (!dontSetStayVisible) {
      this.stayOpen = true;
    }
  }

  scrollToPosition() {
    const element = this.playbackElements[Math.round(this.playbackRate * 10) - 1];
    this.speedList.scrollTop = element.offsetTop - this.speedList.clientHeight / 2 + element.clientHeight / 2;
  }

  closeUI() {
    DOMElements.rateMenuContainer.style.display = 'none';
    this.stayOpen = false;
  }

  isVisible() {
    return DOMElements.rateMenuContainer.style.display !== 'none';
  }

  setupUI() {
    const els = [];
    const speedList = document.createElement('div');
    this.speedList = speedList;
    speedList.classList.add('rate-changer-list');

    DOMElements.rateMenu.appendChild(speedList);

    DOMElements.playbackRate.addEventListener('focus', (e) => {
      if (!this.isVisible()) {
        this.openUI(true);
      }
    });

    DOMElements.playbackRate.addEventListener('blur', (e) => {
      if (!this.stayOpen) {
        this.closeUI();
      }
    });

    DOMElements.playbackRate.addEventListener('click', (e) => {
      if (this.stayOpen) {
        this.closeUI();
      } else {
        this.openUI();
      }
      e.stopPropagation();
    });

    DOMElements.playerContainer.addEventListener('click', (e) => {
      this.closeUI();
    });

    WebUtils.setupTabIndex(DOMElements.playbackRate);

    for (let i = 1; i <= 80; i += 1) {
      ((i) => {
        const el = document.createElement('div');
        els.push(el);
        el.textContent = ((i + 0.1) / 10).toString().substring(0, 3);

        el.addEventListener('click', (e) => {
          this.setPlaybackRate(i / 10);
          e.stopPropagation();
        }, true);
        speedList.appendChild(el);
      })(i);
    }

    els[Math.round(this.playbackRate * 10) - 1].classList.add('rate-selected');

    this.playbackElements = els;

    DOMElements.playbackRate.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        this.shiftPlaybackRate(0.1);
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === 'ArrowUp') {
        this.shiftPlaybackRate(-0.1);
        e.preventDefault();
        e.stopPropagation();
      }
    });

    DOMElements.rateMenu.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });

    DOMElements.rateMenu.addEventListener('mouseup', (e) => {
      e.stopPropagation();
    });
  }

  shiftPlaybackRate(shift) {
    this.setPlaybackRate(Math.round((this.playbackRate + shift) * 10) / 10);
  }

  setPlaybackRate(rate, noEmit = false) {
    this.playbackRate = Utils.clamp(rate, 0.1, 8);
    this.playbackElements.forEach((el) => {
      el.classList.remove('rate-selected');
    });

    const element = this.playbackElements[Math.round(this.playbackRate * 10) - 1];
    this.scrollToPosition();
    element.classList.add('rate-selected');

    if (!noEmit) {
      this.emit('rateChanged', this.playbackRate);
    }
  }
}
