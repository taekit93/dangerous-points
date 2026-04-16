import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MarkerList from '../components/MarkerList'

const sampleObstacles = [
  {
    id: '1',
    title: '공사 현장',
    category: '공사중',
    dangerLevel: '위험',
    createdAt: '2026-04-16T00:00:00.000Z',
    description: '',
    lat: 37.5,
    lng: 126.9,
    updatedAt: '',
  },
  {
    id: '2',
    title: '파손된 도로',
    category: '도로파손',
    dangerLevel: '주의',
    createdAt: '2026-04-16T00:00:00.000Z',
    description: '',
    lat: 37.5,
    lng: 126.9,
    updatedAt: '',
  },
]

describe('MarkerList', () => {
  it('장애물 목록이 렌더링된다', () => {
    render(
      <MarkerList
        obstacles={sampleObstacles}
        activeMarkerId={null}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('공사 현장')).toBeInTheDocument()
    expect(screen.getByText('파손된 도로')).toBeInTheDocument()
  })

  it('장애물이 없으면 안내 메시지가 표시된다', () => {
    render(
      <MarkerList
        obstacles={[]}
        activeMarkerId={null}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('등록된 장애물이 없습니다.')).toBeInTheDocument()
  })

  it('검색어로 목록이 필터링된다', () => {
    render(
      <MarkerList
        obstacles={sampleObstacles}
        activeMarkerId={null}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    const input = screen.getByPlaceholderText('장애물 검색...')
    fireEvent.change(input, { target: { value: '공사' } })
    expect(screen.getByText('공사 현장')).toBeInTheDocument()
    expect(screen.queryByText('파손된 도로')).not.toBeInTheDocument()
  })

  it('항목 클릭 시 onSelect가 id와 함께 호출된다', () => {
    const onSelect = vi.fn()
    render(
      <MarkerList
        obstacles={sampleObstacles}
        activeMarkerId={null}
        onSelect={onSelect}
        onDelete={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('공사 현장'))
    expect(onSelect).toHaveBeenCalledWith('1')
  })
})
