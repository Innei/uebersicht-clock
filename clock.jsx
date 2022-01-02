// This is a simple example Widget to get you started with Übersicht.
// For the full documentation please visit:
// https://github.com/felixhageloh/uebersicht

import dynamics from 'dynamics.js'
import { React } from 'uebersicht'
const { useEffect } = React

// You can modify this widget as you see fit, or simply delete this file to
// remove it.

// this is the shell command that gets executed every time this widget refreshes
export const command = 'whoami'

// the refresh frequency in milliseconds
export const refreshFrequency = 1000000

// the CSS style for this widget, written using Emotion
// https://emotion.sh/
export const className = `
position: absolute;
left: -200px;
bottom: -180px;
height: 600px;
width: 600px;
transform: scale(.5);
background: radial-gradient(45.23% 49.09% at 50% 50%, #1FA9EC 0%, rgba(56, 129, 160, 0.02) 100%);
padding: 0 20px;
user-select: none;
pointer-events: none;

--white: #fff;
--gray: #E5E5E5;

.top-time {
  font-family: Helvetica, Arial, sans-serif;
  position: absolute;
  top: 80px;
  color: var(--white);
  left: 50%;
  transform: translateX(-50%);
  font-size: 36px;
}

.wrap {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clock-wrap {
  height: 300px;
  width: 300px;
  border-radius: 50%;
  position: relative;
}
.clock-wrap::before {
  position: absolute;
  content: '';
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  border-radius: 50%;
  border: 1px solid transparent;
  border-bottom-color: var(--white);
  animation: rotate 10s infinite linear;
}
.clock-root {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9;
}
.clock-root .point {
  height: 10px;
  width: 10px;

  background-color: var(--white);
  border-radius: 50%;
}


.hand-wrap {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  animation: fade-in 0.5s 1.5s forwards;
}

.hand::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: var(--height);
  width: 1px;
  background-color: var(--white);
}
.hand::after {
  content: '';
  position: absolute;
  left: 0;
  top: var(--height);
  height: var(--size);
  width: var(--size);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  z-index: 2;
  background-color: var(--white);
}
.minute-hand {
  background-color: var(--white);
  --size: 15px;
  --height: 130px;
}
.hour-hand {
  background-color: var(--white);
  --size: 10px;
  --height: 100px;
}
.second-hand {
  background-color: var(--white);
  --size: 12px;
  --height: 150px;
}

svg {
  overflow: visible;
}

circle {
  fill: transparent;
  stroke-width: 2px;
  stroke: var(--gray);
  stroke-dasharray: 936px;
  stroke-dashoffset: -936px;
  animation: stroke 3s 0.3s ease-in forwards;
}

@keyframes scale {
  from {
    transform: scale(0.3);
  }
  to {
    transform: scale(1);
  }
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes stroke {
  from {
    stroke-dashoffset: -936px;
  }
  50% {
    stroke-width: 0.5px;
    stroke-dashoffset: 0;
  }
  99% {
    stroke-dashoffset: 936px;
  }
  to {
    opacity: 0;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`

// render gets called after the shell command has executed. The command's output
// is passed in as a string.
export const render = ({ output }) => {
  /**
   * @type {HTMLDivElement}
   */
  const $minute = document.querySelector('.minute-hand')
  /**
   * @type {HTMLDivElement}
   */
  const $hour = document.querySelector('.hour-hand')
  /**
   * @type {HTMLDivElement}
   */
  const $second = document.querySelector('.second-hand')
  const animateEls = [$hour, $minute, $second]

  // 摆动指针
  function springHand(el, deg) {
    dynamics.animate(
      el,
      {
        rotateZ: deg,
      },
      { frequency: 500, type: dynamics.spring },
    )
  }
  // 初始动画
  function doAnimate() {
    const $root = document.querySelector('.clock-root .point')
    dynamics.animate(
      $root,
      {
        scale: 3,
      },
      {
        type: dynamics.spring,
        frequency: 550,
        friction: 120,
        duration: 1500,
        delay: 100,
      },
    )
  }
  let timer

  function init() {
    doAnimate()

    const time = new Date()
    const minute = time.getMinutes()
    const second = time.getSeconds()
    const hour = time.getHours()

    let minuteDeg = 180 + (360 / 60) * minute + (360 / 3600) * second
    let secondDeg = 180 + (360 / 60) * second
    let hourDeg =
      180 + (360 / 12) * hour + (360 / 720) * second + (360 / 43200) * minute

    const $time = document.getElementById('time')
    // 每秒动画
    function setTime() {
      springHand($minute, minuteDeg)
      springHand($hour, hourDeg)
      springHand($second, secondDeg)

      secondDeg += 360 / 60
      minuteDeg += 360 / 3600
      hourDeg += 360 / 43200

      const second = ((30 + secondDeg / 6) | 0) % 60
      const minute = ((30 + minuteDeg / 6) | 0) % 60
      const hour = ((6 + hourDeg / 30) | 0) % 12

      $time.innerText = `${hour}:${minute.toString().padStart(2, '0')}:${second
        .toString()
        .padStart(2, '0')}`
    }

    setTime()
    timer = setInterval(setTime, 1000)
  }
  // 重置函数
  function reset() {
    animateEls.map(($) => {
      dynamics.stop($)
    })
    timer = clearInterval(timer)
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState == 'hidden') {
      reset()
    }

    if (document.visibilityState == 'visible') {
      init()
    }
  })

  setTimeout(() => {
    init()
  })
  // 5 分钟同步
  setTimeout(() => {
    reset()
    init()
  }, 300000)

  return (
    <div className="wrap">
      <div id="time" className="top-time"></div>
      <div className="clock-wrap">
        <svg>
          <circle cx="150" cy="150" r="150"></circle>
        </svg>
        <div className="clock-root">
          <div className="point"></div>
        </div>
        <div className="hand-wrap">
          <div className="hand minute-hand"></div>
        </div>
        <div className="hand-wrap">
          <div className="hand second-hand"></div>
        </div>
        <div className="hand-wrap">
          <div className="hand hour-hand"></div>
        </div>
      </div>
    </div>
  )
}
