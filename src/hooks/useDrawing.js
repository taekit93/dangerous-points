import { useState, useCallback } from 'react'

export function useDrawing() {
  const [drawMode, setDrawModeState] = useState('point')
  const [coords, setCoords] = useState([])

  const setDrawMode = useCallback((mode) => {
    setDrawModeState(mode)
    setCoords([])
  }, [])

  const addCoord = useCallback((coord) => {
    setCoords((prev) => [...prev, coord])
  }, [])

  const undoCoord = useCallback(() => {
    setCoords((prev) => prev.slice(0, -1))
  }, [])

  const resetDrawing = useCallback(() => {
    setCoords([])
  }, [])

  return {
    drawMode,
    coords,
    setDrawMode,
    addCoord,
    undoCoord,
    resetDrawing,
  }
}
