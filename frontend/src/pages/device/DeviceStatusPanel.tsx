import { useEffect, useState, useCallback } from "react";
import { deviceApi } from "../../api_services/device/DeviceAPIService";
import type { DeviceStatusDto, SmartMeterDto } from "../../types/device/DeviceTypes";

const ONLINE_THRESHOLD_SECONDS = 20;

const formatHeartbeat = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function DeviceStatusPanel() {
  const [statuses, setStatuses] = useState<DeviceStatusDto[]>([]);
  const [meters, setMeters] = useState<SmartMeterDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [statusRes, meterRes] = await Promise.all([
      deviceApi.getDeviceStatuses(),
      deviceApi.getSmartMeters(),
    ]);

    if (statusRes.success && statusRes.data) {
      const unique = Array.from(
        new Map(statusRes.data.map(s => [s.deviceId, s])).values()
      );
      setStatuses(unique);
    }
    if (meterRes.success && meterRes.data) setMeters(meterRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) return <div className="text-sm text-gray-400 p-4">Učitavanje statusa...</div>;

  if (statuses.length === 0) return <div className="text-sm text-gray-400 p-4">Nema dostupnih uređaja.</div>;

  return (
    <div className="w-full">
      <h2 className="text-md font-bold text-gray-800 mb-3">Pregled statusa brojila</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Serijski broj</th>
              <th className="px-4 py-3 text-left">Tip</th>
              <th className="px-4 py-3 text-right">Opterećenje</th>
              <th className="px-4 py-3 text-right">Zadnji signal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {statuses.map((s) => {
              const meter = meters.find((m) => m.id === s.deviceId);
              const isOnline =
                (Date.now() - new Date(s.lastHeartbeat).getTime()) / 1000 <=
                ONLINE_THRESHOLD_SECONDS;

              return (
                <tr key={s.deviceId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isOnline ? "bg-green-500" : "bg-red-500 animate-pulse"
                      }`} />
                      {isOnline ? "ONLINE" : "OFFLINE"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-700 font-medium">
                    {meter?.serialNumber ?? s.deviceId}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {s.deviceType}
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-right font-medium">
                    {s.currentLoadKW.toFixed(2)} kW
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs text-right">
                    {formatHeartbeat(s.lastHeartbeat)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}