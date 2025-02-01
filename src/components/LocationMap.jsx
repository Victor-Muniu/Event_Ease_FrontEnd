import React from "react";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import { X } from "lucide-react";
const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 0,
  lng: 0,
};

function LocationMap({ coordinates, onClose }) {
  const [mapCenter, setMapCenter] = React.useState(center);

  React.useEffect(() => {
    if (coordinates && coordinates.length === 2) {
      const [lat, lng] = coordinates;
      setMapCenter({ lat, lng });
    }
  }, [coordinates]);

  return (
    <div className="map-modal-overlay">
      <div className="map-modal">
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>
        <LoadScript googleMapsApiKey="AIzaSyACa2rCuLZPavENqi6yMFJ7GbwLFrDdG2M">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={15}
          >
            <Marker position={mapCenter} />
          </GoogleMap>
        </LoadScript>
      </div>
      <style jsx>{`
        .map-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .map-modal {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          position: relative;
        }

        .close-button {
          position: absolute;
          top: -1rem;
          right: -1rem;
          background: white;
          border: none;
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 1001;
        }
      `}</style>
    </div>
  );
}

export default LocationMap;
