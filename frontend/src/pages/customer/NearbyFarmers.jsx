import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { farmerAPI } from '../../services/api';
import { SkeletonGrid } from '../../components/common/SkeletonCard';

export default function NearbyFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locError, setLocError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [maxDist, setMaxDist] = useState(20);

  const fetchNearby = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await farmerAPI.nearby({ lat, lng, maxDistance: maxDist * 1000 });
      setFarmers(res.data.data || []);
    } catch {
      toast.error('Failed to load nearby farmers');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        fetchNearby(latitude, longitude);
      },
      () => {
        setLocError('Location access denied. Please allow location permission.');
      }
    );
  };

  useEffect(() => {
    if (coords) fetchNearby(coords.lat, coords.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxDist]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900">Nearby Farmers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Find local farmers and fresh produce close to you
          </p>
        </motion.div>

        {/* Controls */}
        <div className="card p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <button onClick={getLocation} className="btn-primary">
            📍 Use My Location
          </button>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 whitespace-nowrap">Max distance:</label>
            <select
              value={maxDist}
              onChange={(e) => setMaxDist(Number(e.target.value))}
              className="input-field w-28"
            >
              {[5, 10, 20, 50, 100].map((d) => (
                <option key={d} value={d}>{d} km</option>
              ))}
            </select>
          </div>
          {coords && (
            <span className="text-xs text-gray-400">
              📌 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </span>
          )}
        </div>

        {locError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {locError}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : !coords ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">🗺️</p>
            <p className="font-semibold text-gray-600 text-base">Share your location</p>
            <p className="text-sm mt-1">Click "Use My Location" to see nearby farmers</p>
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">🌾</p>
            <p className="font-semibold text-gray-600 text-base">No farmers found nearby</p>
            <p className="text-sm mt-1">Try increasing the max distance</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {farmers.map((farmer, i) => (
                <motion.div
                  key={farmer._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="card p-5 hover:shadow-card-hover transition-all"
                >
                  {/* Farmer Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      {farmer.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {farmer.farmName || farmer.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>⭐ {farmer.rating?.toFixed(1) || '—'}</span>
                        <span>·</span>
                        <span>
                          {farmer.distance != null
                            ? `${farmer.distance.toFixed(1)} km away`
                            : farmer.address || ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {farmer.farmDescription && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {farmer.farmDescription}
                    </p>
                  )}

                  {/* Sample Products */}
                  {farmer.recentProducts?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 font-semibold uppercase mb-2">
                        Products
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {farmer.recentProducts.slice(0, 4).map((p) => (
                          <span
                            key={p._id}
                            className="text-xs bg-green-50 text-primary px-2 py-0.5 rounded-full"
                          >
                            {p.productName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/marketplace?farmer=${farmer._id}`}
                    className="btn-secondary text-xs py-2 text-center block"
                  >
                    View Products →
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
