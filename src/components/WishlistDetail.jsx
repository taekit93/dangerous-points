import { useState } from 'react'
import styles from './WishlistDetail.module.css'

/**
 * WishlistDetail — 장소 상세 정보 + 방문 기록 + 후기
 *
 * Props:
 *   item        : WishlistDetailItem          — 상세 데이터
 *   onVisit     : (id: string) => void        — "방문 완료" → visitCount++
 *   onAddReview : (id: string, review) => void — 후기 등록
 *   onDelete    : (id: string) => void        — 장소 삭제
 *   onClose     : () => void                  — 패널 닫기
 */
export default function WishlistDetail({ item, onVisit, onAddReview, onDelete, onClose }) {
  const [reviewText, setReviewText] = useState('')
  const [reviewVisitNum, setReviewVisitNum] = useState('')

  function handleVisit() {
    onVisit(item.id)
  }

  function handleReviewSubmit(e) {
    e.preventDefault()
    if (!reviewText.trim()) return
    onAddReview(item.id, {
      text: reviewText.trim(),
      visitNum: reviewVisitNum ? Number(reviewVisitNum) : undefined,
    })
    setReviewText('')
    setReviewVisitNum('')
  }

  function handleDelete() {
    if (window.confirm(`"${item.name}" 장소를 삭제하시겠습니까?`)) {
      onDelete(item.id)
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <h2 className={styles.title}>{item.name}</h2>
            <div className={styles.badges}>
              <span className={styles.categoryBadge}>{item.category}</span>
              <span
                className={`${styles.visitBadge} ${
                  item.visitCount === 0 ? styles.visitBadgeUnvisited : ''
                }`}
              >
                {item.visitCount === 0 ? '미방문' : `${item.visitCount}회 방문`}
              </span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* 본문 */}
        <div className={styles.body}>
          {/* 주소 */}
          {item.address && (
            <div className={styles.address}>
              <span className={styles.addressIcon} aria-hidden="true">📍</span>
              <span>{item.address}</span>
            </div>
          )}

          {/* 방문 카드 */}
          <div className={`${styles.visitCard} ${item.visitCount === 0 ? styles.visitCardUnvisited : ''}`}>
            <div className={styles.visitCardInfo}>
              <span className={`${styles.visitCount} ${item.visitCount === 0 ? styles.visitCountZero : ''}`}>
                {item.visitCount}회
              </span>
              <span className={styles.visitCardLabel}>
                {item.visitCount === 0 ? '아직 방문하지 않았습니다' : '방문 완료'}
              </span>
            </div>
            <button className={styles.visitBtn} onClick={handleVisit}>
              방문 완료
            </button>
          </div>

          {/* 후기 섹션 */}
          <section className={styles.reviewSection}>
            <h3 className={styles.reviewSectionTitle}>후기</h3>

            {/* 후기 작성 폼 */}
            <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
              <textarea
                className={styles.reviewTextarea}
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="후기를 작성해 주세요 (선택)"
              />
              <div className={styles.reviewFormRow}>
                <select
                  className={styles.reviewSelect}
                  value={reviewVisitNum}
                  onChange={(e) => setReviewVisitNum(e.target.value)}
                  aria-label="방문 번호 선택"
                >
                  <option value="">방문 번호 선택 (선택)</option>
                  {Array.from({ length: item.visitCount }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}번째 방문
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className={styles.reviewSubmitBtn}
                  disabled={!reviewText.trim()}
                >
                  등록
                </button>
              </div>
            </form>

            {/* 후기 목록 */}
            {item.reviews.length === 0 ? (
              <div className={styles.reviewEmpty}>아직 작성된 후기가 없습니다.</div>
            ) : (
              <ul className={styles.reviewList}>
                {item.reviews.map((review) => (
                  <li key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewMeta}>
                      {review.visitNum != null && (
                        <span className={styles.reviewVisitNum}>{review.visitNum}번째 방문</span>
                      )}
                      <span className={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className={styles.reviewText}>{review.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* 하단 버튼 */}
        <div className={styles.footer}>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
