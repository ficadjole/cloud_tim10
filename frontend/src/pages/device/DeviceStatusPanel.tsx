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

  if (loading)
    return (
      <div className="text-sm text-[#636363] montserrat_medium p-4">
        Učitavanje statusa...
      </div>
    );

  if (statuses.length === 0)
    return (
      <div className="text-sm text-[#636363] montserrat_medium p-4">
        Nema dostupnih uređaja.
      </div>
    );

  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium">
          Mreža
        </p>
        <h2 className="mt-1 text-2xl text-[#363636] montserrat_bold">
          Status brojila
        </h2>
        <p className="mt-1 text-sm text-[#636363] montserrat_medium">
          Pregled online/offline statusa i opterećenja svih registrovanih brojila
        </p>
      </div>

      <div className="rounded-2xl border border-[#469FFE]/10 bg-white/60 backdrop-blur-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#469FFE]/10">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
                Serijski broj
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
                Tip
              </th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
                Opterećenje
              </th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] text-[#469FFE] montserrat_semibold">
                Zadnji signal
              </th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((s) => {
              const meter = meters.find((m) => m.id === s.deviceId);
              const isOnline =
                (Date.now() - new Date(s.lastHeartbeat).getTime()) / 1000 <=
                ONLINE_THRESHOLD_SECONDS;

              return (
                <tr
                  key={s.deviceId}
                  className="border-t border-[#469FFE]/5 hover:bg-[#469FFE]/4 transition-all duration-200"
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] montserrat_semibold ${
                      isOnline
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isOnline ? "bg-green-500" : "bg-red-500 animate-pulse"
                      }`} />
                      {isOnline ? "ONLINE" : "OFFLINE"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[#363636] montserrat_medium">
                    {meter?.serialNumber ?? s.deviceId}
                  </td>
                  <td className="px-4 py-3 text-[#636363] montserrat_medium text-xs">
                    {s.deviceType}
                  </td>
                  <td className="px-4 py-3 text-[#363636] montserrat_medium text-right">
                    {s.currentLoadKW.toFixed(2)} kW
                  </td>
                  <td className="px-4 py-3 text-[#636363] montserrat_medium text-xs text-right">
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