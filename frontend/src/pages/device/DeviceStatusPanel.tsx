import { useEffect, useState, useCallback } from "react";
import { deviceApi } from "../../api_services/device/DeviceAPIService";
import type { DeviceWithStatus } from "../../types/device/DeviceTypes";

const ONLINE_THRESHOLD_SECONDS = 20; // mora se poklapati sa DeviceStatusLimits.OfflineThreshold na backendu
const REFRESH_INTERVAL_MS = 5000;

export default function DeviceStatusPanel() {
  const [devices, setDevices] = useState<DeviceWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDevices = useCallback(async () => {
    const [devicesRes, statusesRes] = await Promise.all([
      deviceApi.getDevices(),
      deviceApi.getDeviceStatuses(),
    ]);

    if (!devicesRes.success || !devicesRes.data) {
      setError(devicesRes.message ?? "Greška pri učitavanju brojila");
      setLoading(false);
      return;
    }

    const statusMap = new Map(
      (statusesRes.data ?? []).map((s) => [s.deviceId, s])
    );

    const merged: DeviceWithStatus[] = devicesRes.data.map((d) => {
      const status = statusMap.get(d.deviceId) ?? null;
      let secondsSinceHeartbeat: number | null = null;
      let isOnline = false;

      if (status) {
        secondsSinceHeartbeat =
          (Date.now() - new Date(status.lastHeartbeat).getTime()) / 1000;
        isOnline = secondsSinceHeartbeat <= ONLINE_THRESHOLD_SECONDS;
      }

      return { ...d, status, isOnline, secondsSinceHeartbeat };
    });

    setDevices(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadDevices]);

  if (loading) return <div className="text-sm text-gray-400 p-6">Učitavanje brojila…</div>;

  return (
    <div className="w-full font-sans">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Status brojila</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Pregled rada svih registrovanih pametnih brojila
          </p>
        </div>
        <span className="text-2xl text-gray-400">📡</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-4 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Naziv</th>
              <th className="px-4 py-3 font-medium">Lokacija</th>
              <th className="px-4 py-3 font-medium">Tip</th>
              <th className="px-4 py-3 font-medium">Trenutno opterećenje</th>
              <th className="px-4 py-3 font-medium">Poslednji signal</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Nema registrovanih brojila.
                </td>
              </tr>
            )}
            {devices.map((d) => (
              <tr key={d.deviceId} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        d.isOnline ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className={d.isOnline ? "text-green-600" : "text-red-500"}>
                      {d.isOnline ? "Online" : "Offline"}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-800">{d.name}</td>
                <td className="px-4 py-3 text-gray-600">{d.location}</td>
                <td className="px-4 py-3 text-gray-600">{d.type}</td>
                <td className="px-4 py-3 text-gray-600">
                  {d.status ? `${d.status.currentLoadKW.toFixed(2)} kW` : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {d.secondsSinceHeartbeat !== null
                    ? d.secondsSinceHeartbeat < 60
                      ? `pre ${Math.round(d.secondsSinceHeartbeat)} sek`
                      : `pre ${Math.round(d.secondsSinceHeartbeat / 60)} min`
                    : "Nema podataka"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}