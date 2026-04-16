import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ObstacleForm from '../components/ObstacleForm'

const createFormState = {
  mode: 'create',
  lat: 37.5665,
  lng: 126.9780,
}

const editFormState = {
  mode: 'edit',
  lat: 37.5665,
  lng: 126.9780,
  obstacle: {
    id: 'abc',
    title: '기존 제목',
    category: '공사중',
    dangerLevel: '위험',
    description: '설명입니다',
    createdAt: '2026-04-16T00:00:00.000Z',
    updatedAt: '2026-04-16T00:00:00.000Z',
  },
}

describe('ObstacleForm', () => {
  it('등록 모드에서 "장애물 등록" 타이틀이 표시된다', () => {
    render(<ObstacleForm formState={createFormState} onSave={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('장애물 등록')).toBeInTheDocument()
  })

  it('수정 모드에서 기존 데이터가 초기값으로 채워진다', () => {
    render(<ObstacleForm formState={editFormState} onSave={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByDisplayValue('기존 제목')).toBeInTheDocument()
    expect(screen.getByDisplayValue('설명입니다')).toBeInTheDocument()
  })

  it('제목이 없을 때 제출 시 에러 메시지가 표시된다', () => {
    render(<ObstacleForm formState={createFormState} onSave={vi.fn()} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('등록'))
    expect(screen.getByText('제목을 입력해 주세요.')).toBeInTheDocument()
  })

  it('위험도를 선택하지 않으면 에러 메시지가 표시된다', () => {
    render(<ObstacleForm formState={createFormState} onSave={vi.fn()} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('장애물 제목을 입력하세요'), {
      target: { value: '제목' },
    })
    fireEvent.click(screen.getByText('등록'))
    expect(screen.getByText('위험도를 선택해 주세요.')).toBeInTheDocument()
  })

  it('유효한 폼 제출 시 onSave가 호출된다', () => {
    const onSave = vi.fn()
    render(<ObstacleForm formState={createFormState} onSave={onSave} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('장애물 제목을 입력하세요'), {
      target: { value: '테스트 제목' },
    })
    fireEvent.click(screen.getByLabelText ? screen.getByText('위험') : screen.getByText('위험'))
    const dangerLabel = screen.getByText('위험')
    fireEvent.click(dangerLabel)
    fireEvent.click(screen.getByText('등록'))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: '테스트 제목', dangerLevel: '위험' })
    )
  })

  it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = vi.fn()
    render(<ObstacleForm formState={createFormState} onSave={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('닫기'))
    expect(onClose).toHaveBeenCalled()
  })

  it('카테고리 직접 입력 선택 시 커스텀 입력 필드가 나타난다', () => {
    render(<ObstacleForm formState={createFormState} onSave={vi.fn()} onClose={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '직접입력' } })
    expect(screen.getByPlaceholderText('카테고리를 입력하세요')).toBeInTheDocument()
  })

  it('line 타입 formState에서 "선" 레이블과 좌표 개수가 표시된다', () => {
    const lineFormState = {
      mode: 'create',
      type: 'line',
      coordinates: [{ lat: 37.5, lng: 126.9 }, { lat: 37.6, lng: 127.0 }],
      lat: 37.5,
      lng: 126.9,
    }
    render(<ObstacleForm formState={lineFormState} onSave={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('선')).toBeInTheDocument()
    expect(screen.getByText('좌표 2개')).toBeInTheDocument()
  })

  it('polygon 타입 formState에서 "면" 레이블과 좌표 개수가 표시된다', () => {
    const polygonFormState = {
      mode: 'create',
      type: 'polygon',
      coordinates: [
        { lat: 37.5, lng: 126.9 },
        { lat: 37.6, lng: 127.0 },
        { lat: 37.7, lng: 127.1 },
      ],
      lat: 37.5,
      lng: 126.9,
    }
    render(<ObstacleForm formState={polygonFormState} onSave={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('면')).toBeInTheDocument()
    expect(screen.getByText('좌표 3개')).toBeInTheDocument()
  })

  it('line 타입 제출 시 onSave에 type과 coordinates가 포함된다', () => {
    const onSave = vi.fn()
    const lineFormState = {
      mode: 'create',
      type: 'line',
      coordinates: [{ lat: 37.5, lng: 126.9 }, { lat: 37.6, lng: 127.0 }],
      lat: 37.5,
      lng: 126.9,
    }
    render(<ObstacleForm formState={lineFormState} onSave={onSave} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('장애물 제목을 입력하세요'), {
      target: { value: '선 장애물' },
    })
    fireEvent.click(screen.getByText('위험'))
    fireEvent.click(screen.getByText('등록'))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'line',
        coordinates: lineFormState.coordinates,
        title: '선 장애물',
      })
    )
  })

  it('point 타입(기본) 제출 시 onSave에 type: point가 포함된다', () => {
    const onSave = vi.fn()
    render(<ObstacleForm formState={createFormState} onSave={onSave} onClose={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('장애물 제목을 입력하세요'), {
      target: { value: '점 장애물' },
    })
    fireEvent.click(screen.getByText('위험'))
    fireEvent.click(screen.getByText('등록'))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'point' })
    )
  })
})
