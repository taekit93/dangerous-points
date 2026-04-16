import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FilterBar from '../components/FilterBar'

const defaultProps = {
  selectedCategories: [],
  selectedDangerLevels: [],
  obstacles: [],
  onCategoryChange: vi.fn(),
  onDangerLevelChange: vi.fn(),
}

describe('FilterBar', () => {
  it('기본 카테고리 칩들이 렌더링된다', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByText('공사중')).toBeInTheDocument()
    expect(screen.getByText('도로파손')).toBeInTheDocument()
    expect(screen.getByText('기타')).toBeInTheDocument()
  })

  it('위험도 칩들이 렌더링된다', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByText('위험')).toBeInTheDocument()
    expect(screen.getByText('주의')).toBeInTheDocument()
    expect(screen.getByText('안전')).toBeInTheDocument()
  })

  it('카테고리 칩 클릭 시 onCategoryChange가 호출된다', () => {
    const onCategoryChange = vi.fn()
    render(<FilterBar {...defaultProps} onCategoryChange={onCategoryChange} />)
    fireEvent.click(screen.getByText('공사중'))
    expect(onCategoryChange).toHaveBeenCalledWith(['공사중'])
  })

  it('이미 선택된 카테고리 클릭 시 해제된다', () => {
    const onCategoryChange = vi.fn()
    render(
      <FilterBar
        {...defaultProps}
        selectedCategories={['공사중']}
        onCategoryChange={onCategoryChange}
      />
    )
    fireEvent.click(screen.getByText('공사중'))
    expect(onCategoryChange).toHaveBeenCalledWith([])
  })

  it('obstacles에 커스텀 카테고리가 있으면 칩으로 표시된다', () => {
    const obstacles = [{ category: '전봇대' }]
    render(<FilterBar {...defaultProps} obstacles={obstacles} />)
    expect(screen.getByText('전봇대')).toBeInTheDocument()
  })

  it('필터가 있을 때 초기화 버튼이 표시된다', () => {
    render(
      <FilterBar
        {...defaultProps}
        selectedCategories={['공사중']}
      />
    )
    expect(screen.getByText('초기화')).toBeInTheDocument()
  })

  it('필터가 없을 때 초기화 버튼이 없다', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.queryByText('초기화')).not.toBeInTheDocument()
  })
})
