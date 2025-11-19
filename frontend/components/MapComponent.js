'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icon in Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom tree icon (smaller, green)
const createTreeIcon = (treeId) => {
  return L.divIcon({
    className: 'custom-tree-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: #22c55e;
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 10px;
        ">🌳</span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  })
}

// Component to handle map updates when position changes
function MapUpdater({ position, onPositionChange, editable }) {
  const map = useMap()
  
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, map.getZoom())
    }
  }, [position, map])

  useEffect(() => {
    if (!editable) return

    const handleClick = (e) => {
      const { lat, lng } = e.latlng
      if (onPositionChange) {
        onPositionChange(lat, lng)
      }
    }

    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [map, editable, onPositionChange])

  return null
}

// Draggable marker component
function DraggableMarker({ position, onPositionChange, treeId }) {
  const markerRef = useRef(null)

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current
      if (marker != null) {
        const { lat, lng } = marker.getLatLng()
        if (onPositionChange) {
          onPositionChange(lat, lng)
        }
      }
    },
  }

  return (
    <Marker
      position={position}
      draggable={true}
      ref={markerRef}
      eventHandlers={eventHandlers}
      icon={createTreeIcon(treeId)}
    />
  )
}

// Static marker component
function StaticMarker({ position, treeId }) {
  return (
    <Marker
      position={position}
      draggable={false}
      icon={createTreeIcon(treeId)}
    />
  )
}

export default function MapComponent({ position, onPositionChange, editable = false, treeId = 1 }) {
  const [isMounted, setIsMounted] = useState(false)
  const defaultPosition = [41.3111, 69.2797] // Tashkent default
  const mapPosition = position && position[0] && position[1] ? position : defaultPosition

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || typeof window === 'undefined') {
    return <div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">Xarita yuklanmoqda...</div>
  }

  return (
    <MapContainer
      center={mapPosition}
      zoom={13}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater 
        position={mapPosition} 
        onPositionChange={onPositionChange}
        editable={editable}
      />
      {editable ? (
        <DraggableMarker 
          position={mapPosition} 
          onPositionChange={onPositionChange}
          treeId={treeId}
        />
      ) : (
        <StaticMarker 
          position={mapPosition}
          treeId={treeId}
        />
      )}
    </MapContainer>
  )
}

