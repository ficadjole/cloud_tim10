import {
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaFileInvoiceDollar,
  FaFilter,
  FaTimesCircle,
} from "react-icons/fa";
import { AiOutlineLoading } from "react-icons/ai";
import { IoIosRefresh } from "react-icons/io";
import type { BillDto } from "../../../models/bill/BillTypes";
import type { ConsumerRow } from "../../../models/residental_object/ResidentalObjectTypes";
import type { SmartMeterDto } from "../../../models/smart_meter/SmartMeterTypes";
import type { DigitalRecordSummary } from "../../../types/dashboard/dashboardTypes";
import {
  actionButtonClass,
  allFilterValue,
  cardClass,
  digitalRecordPageSizes,
  formatCurrency,
  formatNumber,
  formatPeriod,
  getBillStatusLabel,
  getConsumerMeterIds,
  getMeterDisplayName,
  isBillPaid,
  isBillUnpaid,
  panelClass,
} from "../../../utils/dashboard/dashboardHelpers";

interface DigitalRecordPanelProps {
  consumers: ConsumerRow[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  objectId: string;
  onObjectIdChange: (value: string) => void;
  meterId: string;
  onMeterIdChange: (value: string) => void;
  meterOptions: SmartMeterDto[];
  status: string;
  onStatusChange: (value: string) => void;
  from: string;
  onFromChange: (value: string) => void;
  to: string;
  onToChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  totalCount: number;
  filteredCount: number;
  summary: DigitalRecordSummary;
  rows: BillDto[];
  meterNameById: Map<string, string>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  payingBillId: string | null;
  busyId: string | null;
  onPayBill: (bill: BillDto) => void;
  onOpenPdf: (bill: BillDto) => void;
}

export default function DigitalRecordPanel({
  consumers,
  loading,
  error,
  onRefresh,
  objectId,
  onObjectIdChange,
  meterId,
  onMeterIdChange,
  meterOptions,
  status,
  onStatusChange,
  from,
  onFromChange,
  to,
  onToChange,
  pageSize,
  onPageSizeChange,
  totalCount,
  filteredCount,
  summary,
  rows,
  meterNameById,
  currentPage,
  totalPages,
  onPageChange,
  payingBillId,
  busyId,
  onPayBill,
  onOpenPdf,
}: DigitalRecordPanelProps) {
  return (
    <section className={`${panelClass} lg:col-span-11`}>
      <div className={cardClass}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
              Istorija računa i plaćanja
            </p>
            <h2 className="mt-1 text-2xl text-[#363636] montserrat_bold">Digitalni karton</h2>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className={`${actionButtonClass} px-3 py-2.5 text-lg`}
            title="Osveži digitalni karton"
          >
            {loading ? <AiOutlineLoading /> : <IoIosRefresh />}
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
            <FaTimesCircle className="mt-0.5 shrink-0 text-base text-red-400" />
            <p className="text-xs leading-relaxed text-red-600 montserrat_medium">{error}</p>
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-6">
          <label className="lg:col-span-2">
            <span className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
              <FaFilter className="text-[#469FFE]" />
              Objekat
            </span>
            <select
              value={objectId}
              onChange={(event) => onObjectIdChange(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#363636] outline-none transition focus:border-[#469FFE] montserrat_medium"
            >
              <option value={allFilterValue}>Svi objekti</option>
              {consumers.map((consumer) => (
                <option key={consumer.id} value={consumer.id}>
                  {consumer.name}
                </option>
              ))}
            </select>
          </label>

          <label className="lg:col-span-2">
            <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
              Brojilo
            </span>
            <select
              value={meterId}
              onChange={(event) => onMeterIdChange(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#363636] outline-none transition focus:border-[#469FFE] montserrat_medium"
            >
              <option value={allFilterValue}>Sva brojila</option>
              {meterOptions.map((meter) => (
                <option key={meter.id} value={meter.id}>
                  {getMeterDisplayName(meter)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
              Status
            </span>
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#363636] outline-none transition focus:border-[#469FFE] montserrat_medium"
            >
              <option value={allFilterValue}>Svi</option>
              <option value="paid">Plaćeni</option>
              <option value="unpaid">Neplaćeni</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
              Po strani
            </span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#363636] outline-none transition focus:border-[#469FFE] montserrat_medium"
            >
              {digitalRecordPageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center justify-center col-span-6 gap-3">
            <label>
              <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                Od perioda
              </span>
              <input
                type="month"
                value={from}
                onChange={(event) => onFromChange(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#363636] outline-none transition focus:border-[#469FFE] montserrat_medium"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                Do perioda
              </span>
              <input
                type="month"
                value={to}
                onChange={(event) => onToChange(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#363636] outline-none transition focus:border-[#469FFE] montserrat_medium"
              />
            </label>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-blue-100 bg-[#87BFFC]/20 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-blue-500 montserrat_medium">Stavki</p>
            <p className="mt-2 text-2xl text-[#363636] montserrat_bold">{filteredCount}</p>
            <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">Učitano iz backend-a: {totalCount}</p>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-green-600 montserrat_medium">VT potrošnja</p>
            <p className="mt-2 text-2xl text-[#363636] montserrat_bold">{formatNumber(summary.highTariff, "kWh")}</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-blue-500 montserrat_medium">NT potrošnja</p>
            <p className="mt-2 text-2xl text-[#363636] montserrat_bold">{formatNumber(summary.lowTariff, "kWh")}</p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-red-500 montserrat_medium">Dug / ukupno</p>
            <p className="mt-2 text-2xl text-[#363636] montserrat_bold">{formatCurrency(summary.totalAmount)}</p>
            <p className="mt-1 text-xs text-red-500 montserrat_medium">Neplaćenih: {summary.unpaidCount}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="max-h-[360px] overflow-auto">
            <table className="w-full table-fixed border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#FAFAFA]">
                <tr className="border-b border-gray-200 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                  <th className="px-4 py-3">Period</th>
                  <th className="px-5 py-3">Objekat</th>
                  <th className="px-4 py-3">Brojilo</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">VT [kWh]</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">NT [kWh]</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Ukupno [kWh]</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">Cena</th>
                  <th className="px-3 py-3 text-right">Status</th>
                  <th className="px-5 py-3 text-left">PDF</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-[#AFAFAF] montserrat_medium" colSpan={9}>
                      Učitavanje digitalnog kartona...
                    </td>
                  </tr>
                )}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-[#AFAFAF] montserrat_medium" colSpan={9}>
                      Nema stavki za izabrane filtere.
                    </td>
                  </tr>
                )}

                {!loading &&
                  rows.map((bill) => {
                    const ownerObject = consumers.find((consumer) =>
                      getConsumerMeterIds(consumer).includes(bill.smartMeterId)
                    );

                    return (
                      <tr key={`digital-${bill.id}`} className="border-b border-gray-100 last:border-b-0">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                              <FaFileInvoiceDollar className="text-base text-[#469FFE]" />
                            </div>
                            <div>
                              <p className="text-sm text-[#363636] montserrat_semibold">
                                {formatPeriod(bill.billingPeriod)}
                              </p>
                              <p className="text-[0.5em] text-[#AFAFAF] montserrat_medium break-all">{bill.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#363636] montserrat_medium whitespace-nowrap">
                          {ownerObject?.name ?? "-"}
                        </td>
                        <td className="px-4 py-4 text-xs text-[#AFAFAF] montserrat_medium break-all whitespace-nowrap">
                          {meterNameById.get(bill.smartMeterId) ?? bill.smartMeterId}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-[#363636] montserrat_medium">
                          {bill.highTariffKWh.toLocaleString("sr-RS", { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-[#363636] montserrat_medium">
                          {bill.lowTariffKWh.toLocaleString("sr-RS", { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-[#363636] montserrat_semibold">
                          {(bill.highTariffKWh + bill.lowTariffKWh).toLocaleString("sr-RS", {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-[#363636] montserrat_semibold whitespace-nowrap">
                          {formatCurrency(bill.totalAmount)}
                        </td>
                        <td className="px-7 py-7 text-center">
                          {isBillUnpaid(bill) ? (
                            <button
                              type="button"
                              onClick={() => onPayBill(bill)}
                              disabled={payingBillId === bill.id}
                              className="group relative inline-flex h-8 min-w-20 items-center justify-center overflow-hidden rounded-lg border border-red-100 bg-red-50 px-3 text-xs text-red-500 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#469FFE] hover:bg-[#469FFE] hover:text-white active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 montserrat_medium"
                              aria-label={`Plati račun ${bill.id}`}
                            >
                              <span className="transition-all duration-300 ease-out group-hover:-translate-y-5 group-hover:opacity-0">
                                {payingBillId === bill.id ? "Loading" : "Neplaćen"}
                              </span>
                              <span className="absolute translate-y-5 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                                {payingBillId === bill.id ? "..." : "Plati"}
                              </span>
                            </button>
                          ) : (
                            <span
                              className={`inline-flex rounded-lg border px-3 py-1.5 text-xs montserrat_medium ${isBillPaid(bill)
                                ? "border-green-100 bg-green-50 text-green-600"
                                : "border-blue-100 bg-[#87BFFC]/25 text-blue-500"
                                }`}
                            >
                              {getBillStatusLabel(bill.status)}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex justify-begin gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenPdf(bill)}
                              disabled={busyId === bill.id}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#469FFE] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-blue-100 active:scale-[0.98] disabled:opacity-50"
                              aria-label="Otvori PDF račun"
                            >
                              {busyId === bill.id ? <AiOutlineLoading /> : <FaExternalLinkAlt />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#AFAFAF] montserrat_medium">
            Strana {currentPage} od {totalPages}, prikazano {rows.length} od {filteredCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || loading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#363636] transition hover:border-[#469FFE] hover:text-[#469FFE] disabled:opacity-40"
              aria-label="Prethodna strana"
            >
              <FaChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || loading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#363636] transition hover:border-[#469FFE] hover:text-[#469FFE] disabled:opacity-40"
              aria-label="Sledeća strana"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
