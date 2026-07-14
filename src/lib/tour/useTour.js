import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { runTour } from './driver-tour'
import { updateTours } from '../../api/toursApi'

function flatten(chapters) {
  const steps = []
  chapters.forEach((ch, ci) => {
    ch.steps.forEach((s, si) => {
      steps.push({ ...s, chapterEnd: si === ch.steps.length - 1 ? ci : null })
    })
  })
  return steps
}

function firstIncompleteChapter(chapters, completed = []) {
  const done = new Set(completed)
  for (let i = 0; i < chapters.length; i++) if (!done.has(i)) return i
  return null // all done
}

// tour: { id, chapters }. progress: { completedChapters, done } for THIS tour.
export function useTour(tour, progress) {
  const navigate = useNavigate()
  const activeRef = useRef(null)

  const startAtChapter = useCallback((chapterIndex) => {
    const steps = flatten(tour.chapters)
    // Flat index of the first step of chapterIndex = total steps in all prior chapters.
    const startIndex = tour.chapters
      .slice(0, chapterIndex)
      .reduce((n, c) => n + c.steps.length, 0)
    activeRef.current?.destroy()
    activeRef.current = runTour({
      steps,
      startIndex,
      navigate,
      currentPath: () => window.location.pathname,
      onChapterComplete: (ci) => {
        if (ci == null) return
        updateTours({ tourId: tour.id, completedChapters: [ci] }).catch(() => {})
      },
      onExit: () => {
        updateTours({ tourId: tour.id, done: true }).catch(() => {})
        activeRef.current = null
      },
    })
  }, [tour, navigate])

  const resume = useCallback(() => {
    const next = firstIncompleteChapter(tour.chapters, progress?.completedChapters)
    startAtChapter(next == null ? 0 : next)
  }, [tour, progress, startAtChapter])

  const startFromBeginning = useCallback(() => startAtChapter(0), [startAtChapter])

  const nextIncompleteChapter = firstIncompleteChapter(tour.chapters, progress?.completedChapters)
  const isComplete = progress?.done || nextIncompleteChapter == null

  return { startAtChapter, resume, startFromBeginning, nextIncompleteChapter, isComplete }
}
