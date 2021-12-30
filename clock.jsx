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
  return <App />
}

const App = () => {
  useEffect(() => {
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

    function springHand(el, deg) {
      dynamics.animate(
        el,
        {
          rotateZ: deg,
        },
        { frequency: 500, type: dynamics.spring },
      )
    }

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
      const min = time.getMinutes()
      const s = time.getSeconds()
      const hour = time.getHours()

      let minDeg = 180 + (360 / 60) * min
      let sDeg = 180 + (360 / 60) * s
      let hourDeg = 180 + (360 / 12) * hour

      let secondsPass = 0
      let minutesPass = 0
      let isFirstChangeSecond = false
      let isFirstChangeMinute = false

      function setTime() {
        springHand($minute, minDeg)
        springHand($hour, hourDeg)
        springHand($second, sDeg)

        secondsPass++
        sDeg += 360 / 60
        if (secondsPass % (60 - (isFirstChangeSecond ? 0 : s)) == 0) {
          isFirstChangeSecond = true
          secondsPass = 0
          minDeg += 6
          minutesPass++
        }
        if (
          minutesPass &&
          minutesPass % (60 - (isFirstChangeMinute ? 0 : min)) == 0
        ) {
          minutesPass = 0
          isFirstChangeMinute = true
          hourDeg += 360 / 12
        }
      }

      setTime()
      timer = setInterval(setTime, 1000)
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState == 'hidden') {
        animateEls.map(($) => {
          dynamics.stop($)
        })
        timer = clearInterval(timer)
      }

      if (document.visibilityState == 'visible') {
        init()
      }
    })
    init()
  }, [])

  return (
    <div className="wrap">
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
