import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GeoJsonImportModal from '../components/GeoJsonImportModal'

const VALID_FEATURE_COLLECTION = JSON.stringify({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [126.978, 37.566] },
      properties: { title: '테스트 장애물', category: '도로파손' },
    },
  ],
})

const MULTI_FEATURE_COLLECTION = JSON.stringify({
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [126.978, 37.566] }, properties: {} },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [126.979, 37.567] }, properties: {} },
  ],
})

describe('GeoJsonImportModal', () => {
  let onClose
  let onImport

  beforeEach(() => {
    onClose = vi.fn()
    onImport = vi.fn()
  })

  it('isOpen=false이면 렌더링하지 않는다', () => {
    render(<GeoJsonImportModal isOpen={false} onClose={onClose} onImport={onImport} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('isOpen=true이면 모달이 렌더링된다', () => {
    render(<GeoJsonImportModal isOpen={true} onClose={onClose} onImport={onImport} />)
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('GeoJSON 가져오기')).toBeTruthy()
  })

  it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
    render(<GeoJsonImportModal isOpen={true} onClose={onClose} onImport={onImport} />)
    fireEvent.click(screen.getByLabelText('닫기'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('취소 버튼 클릭 시 onClose가 호출된다', () => {
    render(<GeoJsonImportModal isOpen={true} onClose={onClose} onImport={onImport} />)
    fireEvent.click(screen.getByText('취소'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('오버레이 클릭 시 onClose가 호출된다', () => {
    render(<GeoJsonImportModal isOpen={true} onClose={onClose} onImport={onImport} />)
    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('ESC 키 입력 시 onClose가 호출된다', () => {
    render(<GeoJsonImportModal isOpen={true} onClose={onClose} onImport={onImport} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('텍스트 탭과 파일 탭을 전환할 수 있다', () => {
    render(<GeoJsonImportModal isOpen={true} onClose={onClose} onImport={onImport} />)
    const fileTab = screen.getByRole('tab', { name: '파일 업로드' })
    fireEvent.click(fileTab)
    expect(fileTab.getAttribute('aria-selected')).toBe('true')
  })

  it('텍스트 입력 후 파싱하기 클릭 시 파싱 결과가 표시된다', async () => {
    render(<GeoJsonImportModal isOpen={true} onClose={onClose} onImport={onImport} />)
    const textarea = screen.getByLabelText('GeoJSON 텍스트 입력')
    fireEvent.change(textarea, { target: { value: VALID_FEATURE_COLLECTION } })
    fireEvent.click(screen.getByText('파싱하기'))
    await waitFor(() => {
      expect(screen.getByText(/1개의 Feature 발견/)).toBeTruthy()
    })
  })

  it('잘못된 JSON 파싱 시 에러 메시지가 표시된다', async () => {
    render(<GeoJsonImportModal isOpen={true} onClose={onClose} onImport={onImport} />)
    const textarea = screen.getByLabelText('GeoJSON 텍스트 입력')
    fireEvent.change(textarea, { target: { value: '{invalid json' } })
    fireEvent.click(screen.getByText('파싱하기'))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy()
    })
  })

  it('파싱 성공 후 위험도 선택하면 등록 버튼이 활성화된다', async () => {
    render(<GeoJsonImportModal isOpen={true} onClose={onClose} onImport={onImport} />)
    const textarea = screen.getByLabelText('GeoJSON 텍스트 입력')
    fireEvent.change(textarea, { target: { value: VALID_FEATURE_COLLECTION } })
    fireEvent.click(screen.getByText('파싱하기'))
    await waitFor(() => screen.getByText(/1개의 Feature 발견/))

    const dangerRadio = screen.getByDisplayValue('위험')
    fireEvent.click(dangerRadio)

    await waitFor(() => {
      const submitBtn = screen.getByText('1개 장애물 등록')
      expect(submitBtn).not.toBeDisabled()
    })
  })

  it('위험도 선택 후 등록 버튼 클릭 시 onImport가 호출된다', async () => {
    render(<GeoJsonImportModal isOpen={true} onClose={onClose} onImport={onImport} />)
    const textarea = screen.getByLabelText('GeoJSON 텍스트 입력')
    fireEvent.change(textarea, { target: { value: VALID_FEATURE_COLLECTION } })
    fireEvent.click(screen.getByText('파싱하기'))
    await waitFor(() => screen.getByText(/1개의 Feature 발견/))

    const dangerRadio = screen.getByDisplayValue('주의')
    fireEvent.click(dangerRadio)

    await waitFor(() => {
      const submitBtn = screen.getByText('1개 장애물 등록')
      expect(submitBtn).not.toBeDisabled()
    })

    fireEvent.click(screen.getByText('1개 장애물 등록'))
    expect(onImport).toHaveBeenCalledTimes(1)
    expect(onImport.mock.calls[0][0]).toHaveLength(1)
    expect(onImport.mock.calls[0][0][0].type).toBe('point')
  })

  it('여러 Feature일 때 제목 자동생성 안내가 표시된다', async () => {
    render(<GeoJsonImportModal isOpen={true} onClose={onClose} onImport={onImport} />)
    const textarea = screen.getByLabelText('GeoJSON 텍스트 입력')
    fireEvent.change(textarea, { target: { value: MULTI_FEATURE_COLLECTION } })
    fireEvent.click(screen.getByText('파싱하기'))
    await waitFor(() => screen.getByText(/2개의 Feature 발견/))
    expect(screen.getByText(/자동 생성됩니다/)).toBeTruthy()
  })

  it('Point/LineString/Polygon 타입 배지가 표시된다', async () => {
    const mixedGeoJson = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [126.978, 37.566] }, properties: {} },
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[126.978, 37.566], [126.979, 37.567]] }, properties: {} },
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[126.98, 37.568], [126.981, 37.569], [126.982, 37.568], [126.98, 37.568]]] }, properties: {} },
      ],
    })
    render(<GeoJsonImportModal isOpen={true} onClose={onClose} onImport={onImport} />)
    const textarea = screen.getByLabelText('GeoJSON 텍스트 입력')
    fireEvent.change(textarea, { target: { value: mixedGeoJson } })
    fireEvent.click(screen.getByText('파싱하기'))
    await waitFor(() => screen.getByText(/3개의 Feature 발견/))
    expect(screen.getByText(/Point 1개/)).toBeTruthy()
    expect(screen.getByText(/LineString 1개/)).toBeTruthy()
    expect(screen.getByText(/Polygon 1개/)).toBeTruthy()
  })
})
