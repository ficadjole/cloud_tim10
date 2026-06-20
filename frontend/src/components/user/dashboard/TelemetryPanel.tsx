import { FaBolt, FaChartLine, FaPlug, FaSignal, FaTimesCircle } from "react-icons/fa";
import { AiOutlineLoading } from "react-icons/ai";
import type { BarChartPoint, TelemetryPoint, TelemetrySummary } from "../../../types/dashboard/dashboardTypes";
import { cardClass, formatNumber, panelClass } from "../../../utils/dashboard/dashboardHelpers";
import BarChart from "./BarChart";
import LineChart from "./LineChart";

interface TelemetryPanelProps {
  telemetrySummary: TelemetrySummary;
  telemetryError: string;
  telemetryLoading: boolean;
  isSignalRConnected: boolean;
  consumptionChartData: BarChartPoint[];
  telemetryHistory: TelemetryPoint[];
}

export default function TelemetryPanel({
  telemetrySummary,
  telemetryError,
  telemetryLoading,
  isSignalRConnected,
  consumptionChartData,
  telemetryHistory,
}: TelemetryPanelProps) {
  return (
    <section className={`${panelClass} lg:col-span-11`}>
      <div className={cardClass}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
              Telemetrija i analitika
            </p>
            <h2 className="mt-1 text-2xl text-[#363636] montserrat_bold">Potrošnja i stanje mreže</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-[#469FFE] montserrat_medium">
            {telemetryLoading ? <AiOutlineLoading className="animate-spin" /> : <FaSignal />}
            {isSignalRConnected ? "SignalR live" : "Polling fallback"}
          </div>
        </div>

        {telemetryError && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
            <FaTimesCircle className="mt-0.5 shrink-0 text-base text-red-400" />
            <p className="text-xs leading-relaxed text-red-600 montserrat_medium">{telemetryError}</p>
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-blue-100 bg-[#87BFFC]/20 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-widest text-blue-500 montserrat_medium">Trenutna tarifa</p>
              <FaBolt className="text-[#469FFE]" />
            </div>
            <p className="mt-2 text-2xl text-[#363636] montserrat_bold">{telemetrySummary.currentTariff}</p>
            <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">
              {telemetrySummary.currentTariff === "NT" ? "Niža tarifa je aktivna" : "Viša tarifa je aktivna"}
            </p>
          </div>

          <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-widest text-green-600 montserrat_medium">Napon</p>
              <FaChartLine className="text-green-500" />
            </div>
            <p className="mt-2 text-2xl text-[#363636] montserrat_bold">
              {formatNumber(telemetrySummary.averageVoltage, "V", 1)}
            </p>
            <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">Prosek aktivnih faza</p>
          </div>

          <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-widest text-orange-500 montserrat_medium">Opterećenje</p>
              <FaBolt className="text-orange-400" />
            </div>
            <p className="mt-2 text-2xl text-[#363636] montserrat_bold">
              {formatNumber(telemetrySummary.totalLoad, "kW", 2)}
            </p>
            <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">Ukupno za brojila</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Konekcija</p>
              <FaPlug className="text-[#469FFE]" />
            </div>
            <p className="mt-2 text-2xl text-[#363636] montserrat_bold">
              {telemetrySummary.online}/{telemetrySummary.totalTracked}
            </p>
            <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">
              Online, {telemetrySummary.connectionLabel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-1">
            <div className="mb-3">
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                Dnevna potrošnja VT/NT
              </p>
              <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">Prosek po danu iz poslednjih računa</p>
            </div>
            <BarChart data={consumptionChartData} />
          </div>

          <div className="xl:col-span-1">
            <div className="mb-3">
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">Trend napona</p>
              <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">
                Prosečan napon kroz poslednje uzorke
              </p>
            </div>
            <LineChart
              data={telemetryHistory}
              valueKey="averageVoltage"
              color="#22C55E"
              emptyMessage="Čekam merenja za trend napona."
            />
          </div>

          <div className="xl:col-span-1">
            <div className="mb-3">
              <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                Trend opterećenja
              </p>
              <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">Ukupno trenutno opterećenje</p>
            </div>
            <LineChart
              data={telemetryHistory}
              valueKey="totalLoad"
              color="#469FFE"
              emptyMessage="Čekam merenja za trend opterećenja."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
