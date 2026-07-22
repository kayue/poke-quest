import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import HanziWriter from 'hanzi-writer'

export interface HanziQuizHandle {
  /** Play the full stroke-order animation, then resume the quiz. */
  animate: () => void
  /** Clear the child's drawing and restart the quiz for this character. */
  reset: () => void
}

interface Props {
  char: string
  size?: number
  /** Show the faint grey outline to trace over. Off for the legendary boss so
   *  the child writes from memory (harder). Defaults to true. */
  showOutline?: boolean
  /** Play the full stroke-order animation once before the quiz begins, so the
   *  child sees what to write — used when there's no outline. Defaults to false. */
  demoFirst?: boolean
  onComplete: (mistakes: number) => void
  onCorrectStroke?: () => void
  /** Fired on every wrong stroke. `mistakesOnStroke` is how many times the
   *  *current* stroke has been missed (1 = first miss on this stroke). */
  onMistake?: (mistakesOnStroke: number) => void
  /** Fired when the interactive quiz starts accepting input — i.e. after the
   *  `demoFirst` animation finishes (or immediately when there's no demo). */
  onQuizReady?: () => void
  onLoadError?: () => void
}

/** Renders a single Traditional Chinese character as a hanzi-writer
 *  stroke-order quiz inside a 田字格 practice grid. */
export const HanziQuiz = forwardRef<HanziQuizHandle, Props>(function HanziQuiz(
  {
    char,
    size = 300,
    showOutline = true,
    demoFirst = false,
    onComplete,
    onCorrectStroke,
    onMistake,
    onQuizReady,
    onLoadError,
  },
  ref,
) {
  const targetRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<HanziWriter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Keep the latest callbacks without forcing the writer to be recreated.
  const cbs = useRef({ onComplete, onCorrectStroke, onMistake, onQuizReady, onLoadError })
  cbs.current = { onComplete, onCorrectStroke, onMistake, onQuizReady, onLoadError }

  const startQuiz = useCallback((writer: HanziWriter) => {
    writer.quiz({
      leniency: 2, // forgiving for small fingers
      showHintAfterMisses: 1,
      onCorrectStroke: () => cbs.current.onCorrectStroke?.(),
      onMistake: (strokeData) => cbs.current.onMistake?.(strokeData.mistakesOnStroke),
      onComplete: (summary) => cbs.current.onComplete(summary.totalMistakes),
    })
    cbs.current.onQuizReady?.()
  }, [])

  useEffect(() => {
    const el = targetRef.current
    if (!el) return
    el.innerHTML = ''
    setLoading(true)
    setError(false)
    let cancelled = false

    const writer = HanziWriter.create(el, char, {
      width: size,
      height: size,
      padding: 6,
      showOutline,
      showCharacter: false,
      strokeColor: '#2a2540',
      radicalColor: '#e0533d',
      outlineColor: '#cdc6e0',
      drawingColor: '#f0a417',
      highlightColor: '#ffd23f',
      drawingWidth: 28,
      strokeAnimationSpeed: 1.2,
      delayBetweenStrokes: 140,
      onLoadCharDataSuccess: () => setLoading(false),
      onLoadCharDataError: () => {
        setError(true)
        setLoading(false)
        cbs.current.onLoadError?.()
      },
    })
    writerRef.current = writer
    if (demoFirst) {
      // Show the child what to write, then hand over to the quiz.
      writer.animateCharacter({
        onComplete: () => {
          if (!cancelled) startQuiz(writer)
        },
      })
    } else {
      startQuiz(writer)
    }

    return () => {
      cancelled = true
      try {
        writer.cancelQuiz()
      } catch {
        /* no-op */
      }
      el.innerHTML = ''
      writerRef.current = null
    }
  }, [char, size, showOutline, demoFirst, startQuiz])

  useImperativeHandle(ref, () => ({
    animate: () => {
      const w = writerRef.current
      if (!w) return
      w.cancelQuiz()
      w.animateCharacter({ onComplete: () => startQuiz(w) })
    },
    reset: () => {
      const w = writerRef.current
      if (!w) return
      w.cancelQuiz()
      startQuiz(w)
    },
  }))

  return (
    <div className="hanzi-box" style={{ width: size, height: size }}>
      <div className="hanzi-grid" aria-hidden />
      <div ref={targetRef} className="hanzi-target" />
      {loading && !error && <div className="hanzi-status">載入中… ✏️</div>}
      {error && (
        <div className="hanzi-status err">
          這個字暫時無法載入
          <br />
          <span>(couldn't load this character)</span>
        </div>
      )}
    </div>
  )
})
