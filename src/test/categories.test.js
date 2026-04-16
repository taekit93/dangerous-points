import { describe, it, expect } from 'vitest'
import { DEFAULT_CATEGORIES, DANGER_LEVELS, DANGER_COLORS, DANGER_BG_COLORS } from '../constants/categories'

describe('categories constants', () => {
  it('DEFAULT_CATEGORIES에 6개 카테고리가 있다', () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(6)
    expect(DEFAULT_CATEGORIES).toContain('공사중')
    expect(DEFAULT_CATEGORIES).toContain('기타')
  })

  it('DANGER_LEVELS에 3개 위험도가 있다', () => {
    expect(DANGER_LEVELS).toEqual(['위험', '주의', '안전'])
  })

  it('DANGER_COLORS에 각 위험도별 색상이 있다', () => {
    expect(DANGER_COLORS['위험']).toBe('#FF4444')
    expect(DANGER_COLORS['주의']).toBe('#FFA500')
    expect(DANGER_COLORS['안전']).toBe('#44BB44')
  })

  it('DANGER_BG_COLORS에 각 위험도별 배경색이 있다', () => {
    expect(DANGER_BG_COLORS['위험']).toBe('#FFF0F0')
    expect(DANGER_BG_COLORS['주의']).toBe('#FFF8E6')
    expect(DANGER_BG_COLORS['안전']).toBe('#F0FFF0')
  })
})
