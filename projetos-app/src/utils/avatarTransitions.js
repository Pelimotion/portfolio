// avatarTransitions.js
export function squeezeTransition(group) {
  if (!group) return Promise.resolve()

  return new Promise(resolve => {
    const FRAMES = 12   // ~200ms a 60fps
    let frame = 0

    const animate = () => {
      frame++
      const t = frame / FRAMES

      if (t <= 0.5) {
        // Squish in
        const s = 1 - easeIn(t * 2) * 0.98
        group.scale.setScalar(Math.max(0.02, s))
      } else {
        // Pop out — com overshoot
        const s = easeOutBack((t - 0.5) * 2)
        group.scale.setScalar(s)
      }

      if (frame >= FRAMES) {
        group.scale.setScalar(1)
        resolve()
        return
      }
      requestAnimationFrame(animate)
    }
    animate()
  })
}

function easeIn(t) { return t * t * t }
function easeOutBack(t) {
  const c = 1.70158 + 1
  return 1 + c * Math.pow(t - 1, 3) + (c - 1) * Math.pow(t - 1, 2)
}
