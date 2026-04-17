import { useState, useRef } from 'react'
import { useObstacles } from './hooks/useObstacles'
import { useDrawing } from './hooks/useDrawing'
import { useWishlist } from './hooks/useWishlist'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import Map from './components/Map'
import MarkerList from './components/MarkerList'
import ObstacleForm from './components/ObstacleForm'
import GeoJsonImportModal from './components/GeoJsonImportModal'
import WishlistForm from './components/WishlistForm'
import WishlistList from './components/WishlistList'
import WishlistDetail from './components/WishlistDetail'
import styles from './App.module.css'

export default function App() {
  const { obstacles, addObstacle, addObstacles, updateObstacle, removeObstacle } = useObstacles()
  const { drawMode, coords, setDrawMode, addCoord, undoCoord, resetDrawing } = useDrawing()
  const {
    items: wishlistItems,
    selectedItem: selectedWishlistItem,
    isFormOpen: isWishlistFormOpen,
    formPosition: wishlistFormPosition,
    handleMapClick: handleWishlistMapClick,
    saveItem: saveWishlistItem,
    deleteItem: deleteWishlistItem,
    selectItem: selectWishlistItem,
    closeForm: closeWishlistForm,
    closeDetail: closeWishlistDetail,
    incrementVisit,
    addReview,
  } = useWishlist()
  const [activeMode, setActiveMode] = useState('obstacle')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedDangerLevels, setSelectedDangerLevels] = useState([])
  const [formState, setFormState] = useState(null)
  const [activeMarkerId, setActiveMarkerId] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [showGeoJsonModal, setShowGeoJsonModal] = useState(false)
  const mapRef = useRef(null)
  const markersRef = useRef({})

  const filteredObstacles = obstacles.filter((o) => {
    const catOk = selectedCategories.length === 0 || selectedCategories.includes(o.category)
    const lvlOk = selectedDangerLevels.length === 0 || selectedDangerLevels.includes(o.dangerLevel)
    return catOk && lvlOk
  })

  function handleMapClick({ lat, lng }) {
    if (activeMode === 'wishlist') {
      handleWishlistMapClick({ lat, lng })
      return
    }
    if (drawMode === 'point') {
      setFormState({ mode: 'create', lat, lng })
      setActiveMarkerId(null)
    } else {
      addCoord({ lat, lng })
    }
  }

  function handleDrawComplete() {
    if (coords.length === 0) return
    setFormState({
      mode: 'create',
      type: drawMode,
      coordinates: coords,
      lat: coords[0].lat,
      lng: coords[0].lng,
    })
    resetDrawing()
  }

  function handleDrawCancel() {
    resetDrawing()
  }

  function handleDrawModeChange(mode) {
    setDrawMode(mode)
  }

  function handleActiveMode(mode) {
    resetDrawing()
    setDrawMode('point')
    setActiveMode(mode)
  }

  function handleMarkerClick(id) {
    setActiveMarkerId(id)
    setFormState(null)
    const obstacle = obstacles.find((o) => o.id === id)
    if (obstacle && mapRef.current) {
      const lat = obstacle.lat ?? obstacle.coordinates?.[0]?.lat
      const lng = obstacle.lng ?? obstacle.coordinates?.[0]?.lng
      if (lat != null && lng != null) {
        mapRef.current.panTo(new window.naver.maps.LatLng(lat, lng))
      }
    }
  }

  function handleSave(data) {
    if (formState.mode === 'create') {
      addObstacle(data)
    } else {
      updateObstacle(formState.obstacle.id, data)
    }
    setFormState(null)
  }

  function handleEditObstacle(id) {
    const obstacle = obstacles.find((o) => o.id === id)
    if (obstacle) {
      setFormState({ mode: 'edit', lat: obstacle.lat, lng: obstacle.lng, obstacle })
    }
    setActiveMarkerId(null)
  }

  function handleDeleteObstacle(id) {
    if (window.confirm('이 장애물을 삭제하시겠습니까?')) {
      removeObstacle(id)
      if (markersRef.current[id]) {
        const entry = markersRef.current[id]
        window.naver.maps.Event.removeListener(entry.listener)
        if (entry.marker) entry.marker.setMap(null)
        if (entry.polyline) entry.polyline.setMap(null)
        if (entry.polygon) entry.polygon.setMap(null)
        delete markersRef.current[id]
      }
      setActiveMarkerId(null)
    }
  }

  function handleSelectFromList(id) {
    handleMarkerClick(id)
    setIsSheetOpen(false)
  }

  function handleCloseInfoWindow() {
    setActiveMarkerId(null)
  }

  function handleGeoJsonImport(importedObstacles) {
    addObstacles(importedObstacles)
  }

  return (
    <div className={styles.app}>
      <Header
        count={activeMode === 'wishlist' ? wishlistItems.length : obstacles.length}
        onToggleSidebar={() => setIsSidebarOpen((p) => !p)}
        activeMode={activeMode}
        onModeChange={handleActiveMode}
        onGeoJsonImport={() => setShowGeoJsonModal(true)}
      />
      <div className={styles.body}>
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
          {activeMode === 'wishlist' ? (
            <WishlistList
              items={wishlistItems}
              onItemClick={(id) => {
                selectWishlistItem(id)
                setIsSidebarOpen(false)
              }}
            />
          ) : (
            <>
              <FilterBar
                selectedCategories={selectedCategories}
                selectedDangerLevels={selectedDangerLevels}
                obstacles={obstacles}
                onCategoryChange={setSelectedCategories}
                onDangerLevelChange={setSelectedDangerLevels}
              />
              <MarkerList
                obstacles={filteredObstacles}
                activeMarkerId={activeMarkerId}
                onSelect={handleSelectFromList}
                onDelete={handleDeleteObstacle}
              />
            </>
          )}
        </aside>

        {isSidebarOpen && (
          <div
            className={styles.backdrop}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Map
          mapRef={mapRef}
          markersRef={markersRef}
          obstacles={filteredObstacles}
          allObstacles={obstacles}
          activeMarkerId={activeMarkerId}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          onCloseInfoWindow={handleCloseInfoWindow}
          onEditObstacle={handleEditObstacle}
          onDeleteObstacle={handleDeleteObstacle}
          coords={coords}
          drawMode={drawMode}
          onDrawModeChange={handleDrawModeChange}
          onDrawComplete={handleDrawComplete}
          onDrawUndo={undoCoord}
          onDrawCancel={handleDrawCancel}
          wishlistItems={wishlistItems}
          onWishlistItemClick={selectWishlistItem}
          activeMode={activeMode}
        />

        <div className={`${styles.bottomSheet} ${isSheetOpen ? styles.sheetOpen : ''}`}>
          <button
            className={styles.sheetHandle}
            onClick={() => setIsSheetOpen((p) => !p)}
          >
            <span className={styles.handle} />
            <span>
              {activeMode === 'wishlist'
                ? `${wishlistItems.length}곳 위시리스트`
                : `${obstacles.length}개 장애물`}
            </span>
          </button>
          <div className={styles.sheetContent}>
            {activeMode === 'wishlist' ? (
              <WishlistList
                items={wishlistItems}
                onItemClick={(id) => {
                  selectWishlistItem(id)
                  setIsSheetOpen(false)
                }}
              />
            ) : (
              <>
                <FilterBar
                  selectedCategories={selectedCategories}
                  selectedDangerLevels={selectedDangerLevels}
                  obstacles={obstacles}
                  onCategoryChange={setSelectedCategories}
                  onDangerLevelChange={setSelectedDangerLevels}
                />
                <MarkerList
                  obstacles={filteredObstacles}
                  activeMarkerId={activeMarkerId}
                  onSelect={handleSelectFromList}
                  onDelete={handleDeleteObstacle}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {formState && (
        <ObstacleForm
          formState={formState}
          onSave={handleSave}
          onClose={() => setFormState(null)}
        />
      )}

      <GeoJsonImportModal
        isOpen={showGeoJsonModal}
        onClose={() => setShowGeoJsonModal(false)}
        onImport={handleGeoJsonImport}
      />

      {isWishlistFormOpen && wishlistFormPosition && (
        <WishlistForm
          position={wishlistFormPosition}
          onSave={saveWishlistItem}
          onCancel={closeWishlistForm}
        />
      )}

      {selectedWishlistItem && (
        <WishlistDetail
          item={selectedWishlistItem}
          onVisit={incrementVisit}
          onAddReview={addReview}
          onDelete={deleteWishlistItem}
          onClose={closeWishlistDetail}
        />
      )}
    </div>
  )
}
