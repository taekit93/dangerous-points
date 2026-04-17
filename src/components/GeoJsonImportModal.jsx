import { useState, useEffect, useRef, useCallback } from 'react'
import { parseGeoJson, geoJsonToObstacles } from '../utils/geojson'
import { DEFAULT_CATEGORIES, DANGER_LEVELS, DANGER_COLORS, DANGER_BG_COLORS } from '../constants/categories'

const MODAL_STYLES = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1000,
  },
  panel: {
    background: '#fff',
    borderRadius: '12px 12px 0 0',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp 0.25s cubic-bezier(0.4,0,0.2,1)',
  },
}

function getParseResultMappingText(obstacles) {
  if (obstacles.length === 0) return null
  const first = obstacles[0]
  const mapped = []
  if (first.title) mapped.push('title')
  if (first.category && first.category !== '기타') mapped.push('category')
  if (mapped.length === 0) return null
  return `properties에서 자동 매핑: ${mapped.map((k) => `${k}`).join(', ')}`
}

function computeTypeBreakdown(obstacles) {
  const breakdown = { point: 0, line: 0, polygon: 0 }
  for (const o of obstacles) {
    if (o.type === 'point') breakdown.point++
    else if (o.type === 'line') breakdown.line++
    else if (o.type === 'polygon') breakdown.polygon++
  }
  return breakdown
}

function autoFillMetadata(obstacles) {
  if (obstacles.length === 0) return {}
  if (obstacles.length === 1) {
    const obs = obstacles[0]
    return {
      title: obs.title || '',
      category: obs.category || DEFAULT_CATEGORIES[0],
      dangerLevel: obs.dangerLevel || '',
      description: obs.description || '',
    }
  }
  // 여러 Feature: 값이 모두 같으면 채움, 다르면 빈칸
  const titles = [...new Set(obstacles.map((o) => o.title))]
  const categories = [...new Set(obstacles.map((o) => o.category))]
  const dangerLevels = [...new Set(obstacles.map((o) => o.dangerLevel))]
  const descriptions = [...new Set(obstacles.map((o) => o.description))]
  return {
    title: titles.length === 1 ? titles[0] : '',
    category: categories.length === 1 ? categories[0] : DEFAULT_CATEGORIES[0],
    dangerLevel: dangerLevels.length === 1 ? dangerLevels[0] : '',
    description: descriptions.length === 1 ? descriptions[0] : '',
  }
}

export default function GeoJsonImportModal({ isOpen, onClose, onImport }) {
  const [activeTab, setActiveTab] = useState('text')
  const [rawText, setRawText] = useState('')
  const [file, setFile] = useState(null)
  const [parseResult, setParseResult] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [parsedGeoJson, setParsedGeoJson] = useState(null)
  const [metadata, setMetadata] = useState({
    title: '',
    category: DEFAULT_CATEGORIES[0],
    dangerLevel: '',
    description: '',
  })
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [customCategory, setCustomCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // ESC 키로 닫기
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // 모달 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setActiveTab('text')
      setRawText('')
      setFile(null)
      setParseResult(null)
      setParseError(null)
      setParsedGeoJson(null)
      setMetadata({ title: '', category: DEFAULT_CATEGORIES[0], dangerLevel: '', description: '' })
      setIsCustomCategory(false)
      setCustomCategory('')
    }
  }, [isOpen])

  const processText = useCallback((text) => {
    setParseError(null)
    setParseResult(null)
    setParsedGeoJson(null)
    try {
      const geoJson = parseGeoJson(text)
      // metadata 없이 먼저 파싱하여 Feature 정보 추출
      const { obstacles: rawObstacles, skipped } = geoJsonToObstacles(geoJson, {
        title: '',
        category: '',
        dangerLevel: '',
        description: '',
      })
      const featureCount = rawObstacles.length + skipped
      const typeBreakdown = computeTypeBreakdown(rawObstacles)
      const autoFilled = autoFillMetadata(rawObstacles)
      setParseResult({ obstacles: rawObstacles, skipped, featureCount, typeBreakdown })
      setParsedGeoJson(geoJson)
      setMetadata((prev) => ({
        title: prev.title || autoFilled.title || '',
        category: prev.category !== DEFAULT_CATEGORIES[0] ? prev.category : (autoFilled.category || DEFAULT_CATEGORIES[0]),
        dangerLevel: prev.dangerLevel || autoFilled.dangerLevel || '',
        description: prev.description || autoFilled.description || '',
      }))
    } catch (err) {
      setParseError(err.message)
    }
  }, [])

  function handleParseClick() {
    if (!rawText.trim()) return
    processText(rawText)
  }

  function handleFileChange(selectedFile) {
    if (!selectedFile) return
    const ext = selectedFile.name.split('.').pop().toLowerCase()
    if (ext !== 'geojson' && ext !== 'json') {
      setParseError('.geojson 또는 .json 파일만 지원됩니다.')
      return
    }
    setFile(selectedFile)
    setParseResult(null)
    setParseError(null)
    setParsedGeoJson(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      processText(e.target.result)
    }
    reader.readAsText(selectedFile)
  }

  function handleRemoveFile() {
    setFile(null)
    setParseResult(null)
    setParseError(null)
    setParsedGeoJson(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleCategoryChange(value) {
    if (value === '직접입력') {
      setIsCustomCategory(true)
      setMetadata((prev) => ({ ...prev, category: '직접입력' }))
    } else {
      setIsCustomCategory(false)
      setMetadata((prev) => ({ ...prev, category: value }))
    }
  }

  function handleSubmit() {
    if (!parsedGeoJson || !metadata.dangerLevel || isSubmitting) return
    setIsSubmitting(true)
    const finalCategory = isCustomCategory
      ? customCategory.trim() || '기타'
      : metadata.category
    const { obstacles } = geoJsonToObstacles(parsedGeoJson, {
      ...metadata,
      category: finalCategory,
    })
    onImport(obstacles)
    setIsSubmitting(false)
    onClose()
  }

  const hasResult = parseResult !== null && parseResult.obstacles.length > 0
  const hasSkippedOnly = parseResult !== null && parseResult.obstacles.length === 0 && parseResult.skipped > 0
  const canSubmit = hasResult && metadata.dangerLevel && !isSubmitting

  const submitLabel = hasResult
    ? `${parseResult.obstacles.length}개 장애물 등록`
    : '장애물 등록'

  if (!isOpen) return null

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 640px) {
          .geojson-modal-panel {
            border-radius: 12px !important;
            animation: fadeIn 0.2s ease !important;
          }
          .geojson-modal-overlay {
            align-items: center !important;
          }
        }
        @media (max-width: 480px) {
          .geojson-modal-title { font-size: 15px !important; }
          .geojson-danger-options { gap: 6px !important; }
          .geojson-danger-option { font-size: 12px !important; }
        }
      `}</style>
      <div
        className="geojson-modal-overlay"
        style={MODAL_STYLES.overlay}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="geojson-modal-title"
      >
        <div className="geojson-modal-panel" style={MODAL_STYLES.panel}>
          {/* 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 0' }}>
            <h2
              id="geojson-modal-title"
              className="geojson-modal-title"
              style={{ fontSize: 17, fontWeight: 700, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 7 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1v9M4 6l4 4 4-4M2 12h12" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              GeoJSON 가져오기
            </h2>
            <button
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#F5F7FA', color: '#6B7280', fontSize: 12, border: 'none', cursor: 'pointer' }}
              onClick={onClose}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          {/* 바디 */}
          <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* 탭 */}
            <div
              style={{ display: 'flex', background: '#F5F7FA', border: '1px solid #E0E0E0', borderRadius: 8, padding: 3 }}
              role="tablist"
              aria-label="입력 방식 선택"
            >
              {['text', 'file'].map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`geojson-panel-${tab}`}
                  id={`geojson-tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: activeTab === tab ? '#fff' : 'transparent',
                    color: activeTab === tab ? '#2D3E50' : '#6B7280',
                    boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {tab === 'text' ? '텍스트 입력' : '파일 업로드'}
                </button>
              ))}
            </div>

            {/* 텍스트 탭 패널 */}
            <div
              id="geojson-panel-text"
              role="tabpanel"
              aria-labelledby="geojson-tab-text"
              style={{ display: activeTab === 'text' ? 'flex' : 'none', flexDirection: 'column', gap: 8 }}
            >
              <textarea
                style={{
                  fontFamily: 'monospace',
                  minHeight: 140,
                  padding: '9px 12px',
                  border: '1px solid #E0E0E0',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#1A1A2E',
                  outline: 'none',
                  resize: 'vertical',
                  background: '#F5F7FA',
                  lineHeight: 1.5,
                }}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={'GeoJSON을 여기에 붙여넣으세요.\n예시:\n{\n  "type": "FeatureCollection",\n  "features": [...]\n}'}
                aria-label="GeoJSON 텍스트 입력"
                onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#2D3E50' }}
                onBlur={(e) => { e.target.style.background = '#F5F7FA'; e.target.style.borderColor = '#E0E0E0' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#2D3E50', color: '#fff', border: 'none', cursor: rawText.trim() ? 'pointer' : 'not-allowed', opacity: rawText.trim() ? 1 : 0.5 }}
                  onClick={handleParseClick}
                  disabled={!rawText.trim()}
                >
                  파싱하기
                </button>
              </div>
            </div>

            {/* 파일 탭 패널 */}
            <div
              id="geojson-panel-file"
              role="tabpanel"
              aria-labelledby="geojson-tab-file"
              style={{ display: activeTab === 'file' ? 'block' : 'none' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".geojson,.json"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
              {!file ? (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label=".geojson 또는 .json 파일을 드래그하거나 클릭하여 선택"
                  style={{
                    border: isDragOver ? '2px dashed #3B82F6' : '2px dashed #E0E0E0',
                    background: isDragOver ? '#EFF6FF' : '#F5F7FA',
                    borderRadius: 8,
                    minHeight: 160,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    padding: 16,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragOver(false)
                    handleFileChange(e.dataTransfer.files?.[0])
                  }}
                >
                  <div style={{ background: '#fff', borderRadius: 8, padding: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="14 2 14 8 20 8" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>파일을 드래그하거나 클릭하여 선택</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>지원 형식</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['.geojson', '.json'].map((ext) => (
                      <span key={ext} style={{ fontSize: 11, fontWeight: 600, color: '#3B82F6', background: '#EFF6FF', padding: '2px 8px', borderRadius: 4 }}>{ext}</span>
                    ))}
                  </div>
                  <button
                    style={{ marginTop: 4, padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: '#2D3E50', color: '#fff', border: 'none', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  >
                    파일 선택
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#ECFDF5', border: '1px solid #10B981', borderRadius: 8, padding: '12px 14px' }}>
                  <span style={{ fontSize: 16, color: '#10B981', fontWeight: 700 }}>✓</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#1A1A2E', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: 11, color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(1)} KB`}
                  </span>
                  <button
                    style={{ width: 22, height: 22, borderRadius: '50%', background: '#D1FAE5', border: 'none', color: '#6B7280', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    onClick={handleRemoveFile}
                    aria-label="파일 제거"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* 파싱 결과 */}
            {parseError && (
              <div
                role="alert"
                style={{ background: '#FFF0F0', border: '1px solid #FF4444', borderRadius: 8, padding: '10px 14px' }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: '#FF4444', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>✕</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', marginBottom: 4 }}>파싱 오류</div>
                    <code style={{ fontSize: 11, background: 'rgba(255,68,68,0.08)', padding: '2px 5px', borderRadius: 3, color: '#CC0000', display: 'block', wordBreak: 'break-all' }}>
                      {parseError}
                    </code>
                  </div>
                </div>
              </div>
            )}

            {parseResult && parseResult.obstacles.length === 0 && !parseError && (
              <div role="alert" style={{ background: '#FFF8E6', border: '1px solid #FFA500', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: '#FFA500', fontWeight: 700, fontSize: 15 }}>⚠</span>
                  <div style={{ fontSize: 13, color: '#1A1A2E' }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>등록 가능한 Feature가 없습니다</div>
                    <div style={{ color: '#6B7280', fontSize: 12 }}>지원 형식: Point, LineString, Polygon</div>
                  </div>
                </div>
              </div>
            )}

            {parseResult && parseResult.obstacles.length > 0 && (
              <div style={{
                background: parseResult.skipped > 0 ? '#FFF8E6' : '#ECFDF5',
                border: `1px solid ${parseResult.skipped > 0 ? '#FFA500' : '#10B981'}`,
                borderRadius: 8,
                padding: '10px 14px',
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: parseResult.skipped > 0 ? '#FFA500' : '#10B981', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                    {parseResult.skipped > 0 ? '⚠' : '✓'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', marginBottom: 6 }}>
                      {parseResult.skipped > 0
                        ? `${parseResult.obstacles.length}개의 Feature 발견 (${parseResult.skipped}개 제외됨)`
                        : `${parseResult.obstacles.length}개의 Feature 발견`}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 5 }}>
                      {parseResult.typeBreakdown.point > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, background: '#EFF6FF', color: '#3B82F6', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
                          Point {parseResult.typeBreakdown.point}개
                        </span>
                      )}
                      {parseResult.typeBreakdown.line > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, background: '#F5F3FF', color: '#8B5CF6', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#8B5CF6', display: 'inline-block' }} />
                          LineString {parseResult.typeBreakdown.line}개
                        </span>
                      )}
                      {parseResult.typeBreakdown.polygon > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, background: '#FFFBEB', color: '#F59E0B', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                          Polygon {parseResult.typeBreakdown.polygon}개
                        </span>
                      )}
                    </div>
                    {parseResult.skipped > 0 && (
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        미지원 geometry {parseResult.skipped}개 제외됨 (지원: Point, LineString, Polygon)
                      </div>
                    )}
                    {(() => {
                      const mappingText = getParseResultMappingText(parseResult.obstacles)
                      return mappingText ? (
                        <div style={{ fontSize: 12, color: '#6B7280' }}>{mappingText}</div>
                      ) : null
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* 메타데이터 폼 */}
            {hasResult && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 12px' }}>
                  <div style={{ flex: 1, height: 1, background: '#E0E0E0' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    공통 메타데이터
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#E0E0E0' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* 제목 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }} htmlFor="geojson-title">
                      제목
                    </label>
                    <input
                      id="geojson-title"
                      type="text"
                      style={{ padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, color: '#1A1A2E', outline: 'none', background: '#fff' }}
                      value={metadata.title}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="장애물 제목을 입력하세요"
                    />
                    {parseResult.obstacles.length > 1 && (
                      <div style={{ fontSize: 12, color: '#6B7280', background: '#F5F7FA', border: '1px solid #E0E0E0', borderRadius: 4, padding: '6px 10px' }}>
                        Feature가 여러 개이므로 제목이 비어 있으면 <strong>"가져온 장애물 1", "가져온 장애물 2"…</strong> 형식으로 자동 생성됩니다.
                      </div>
                    )}
                  </div>

                  {/* 카테고리 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }} htmlFor="geojson-category">
                      카테고리
                    </label>
                    <select
                      id="geojson-category"
                      style={{ padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, color: '#1A1A2E', outline: 'none', background: '#fff', cursor: 'pointer' }}
                      value={isCustomCategory ? '직접입력' : metadata.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      {DEFAULT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="직접입력">직접 입력...</option>
                    </select>
                    {isCustomCategory && (
                      <input
                        type="text"
                        style={{ padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, color: '#1A1A2E', outline: 'none', background: '#fff', marginTop: 6 }}
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="카테고리를 입력하세요"
                      />
                    )}
                  </div>

                  {/* 위험도 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div
                      id="geojson-danger-label"
                      style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}
                    >
                      위험도 <span style={{ color: '#FF4444' }}>*</span>
                    </div>
                    <div
                      className="geojson-danger-options"
                      style={{ display: 'flex', gap: 8 }}
                      role="radiogroup"
                      aria-labelledby="geojson-danger-label"
                      aria-required="true"
                    >
                      {DANGER_LEVELS.map((level) => (
                        <label
                          key={level}
                          className="geojson-danger-option"
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: '8px 0',
                            borderRadius: 8,
                            border: metadata.dangerLevel === level ? `2px solid ${DANGER_COLORS[level]}` : '2px solid #E0E0E0',
                            background: metadata.dangerLevel === level ? DANGER_BG_COLORS[level] : '#F5F7FA',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600,
                            color: metadata.dangerLevel === level ? DANGER_COLORS[level] : '#6B7280',
                            transition: 'all 0.2s',
                          }}
                          aria-label={level}
                        >
                          <input
                            type="radio"
                            name="geojson-dangerLevel"
                            value={level}
                            checked={metadata.dangerLevel === level}
                            onChange={() => setMetadata((prev) => ({ ...prev, dangerLevel: level }))}
                            style={{ display: 'none' }}
                          />
                          {level}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 설명 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }} htmlFor="geojson-desc">
                      설명
                    </label>
                    <textarea
                      id="geojson-desc"
                      style={{ padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, color: '#1A1A2E', outline: 'none', resize: 'vertical', background: '#fff', lineHeight: 1.5 }}
                      value={metadata.description}
                      onChange={(e) => setMetadata((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="상세 설명 (선택)"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div style={{ display: 'flex', gap: 8, padding: '14px 20px', borderTop: '1px solid #E0E0E0', position: 'sticky', bottom: 0, background: '#fff' }}>
            <button
              style={{ flex: 1, padding: '11px 0', borderRadius: 8, fontSize: 14, fontWeight: 600, background: '#F5F7FA', color: '#6B7280', border: '1px solid #E0E0E0', cursor: 'pointer' }}
              onClick={onClose}
            >
              취소
            </button>
            <button
              style={{
                flex: 2,
                padding: '11px 0',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                background: canSubmit ? '#2D3E50' : '#E0E0E0',
                color: canSubmit ? '#fff' : '#9CA3AF',
                border: 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s',
              }}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
