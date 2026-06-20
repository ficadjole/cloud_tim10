import { FaBolt, FaCheckCircle, FaHome, FaRegTrashAlt, FaTimesCircle } from "react-icons/fa";
import { AiOutlineLoading } from "react-icons/ai";
import { IoIosRefresh } from "react-icons/io";
import { MdOutlineAddHomeWork } from "react-icons/md";
import type { ConsumerRow } from "../../../models/residental_object/ResidentalObjectTypes";
import {
  actionButtonClass,
  cardClass,
  getMeterSummary,
  getObjectTypeLabel,
  panelClass,
} from "../../../utils/dashboard/dashboardHelpers";

interface ObjectsPanelProps {
  consumers: ConsumerRow[];
  loading: boolean;
  error: string;
  success: string;
  busyId: string | null;
  onRefresh: () => void;
  onCreateNew: () => void;
  onSelect: (consumer: ConsumerRow) => void;
  onRequestDelete: (consumer: ConsumerRow) => void;
}

export default function ObjectsPanel({
  consumers,
  loading,
  error,
  success,
  busyId,
  onRefresh,
  onCreateNew,
  onSelect,
  onRequestDelete,
}: ObjectsPanelProps) {
  return (
    <section className={`${panelClass} lg:col-span-8`}>
      <div className={cardClass}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
              Kontrolni panel
            </p>
            <h2 className="mt-1 text-2xl text-[#363636] montserrat_bold">Objekti i potrošači</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className={`${actionButtonClass} px-3 py-2.5 text-lg`}
              title="Osveži listu potrošača"
            >
              {loading ? <AiOutlineLoading /> : <IoIosRefresh />}
            </button>
            <button
              type="button"
              onClick={onCreateNew}
              disabled={loading}
              className={`${actionButtonClass} px-10 py-2.5 text-lg`}
              title="Dodaj novi objekat"
            >
              {loading ? <AiOutlineLoading /> : <MdOutlineAddHomeWork />}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
            <FaTimesCircle className="mt-0.5 shrink-0 text-base text-red-400" />
            <p className="text-xs leading-relaxed text-red-600 montserrat_medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-green-100 bg-green-50 px-3 py-2.5">
            <FaCheckCircle className="mt-0.5 shrink-0 text-base text-green-400" />
            <p className="text-xs leading-relaxed text-green-600 montserrat_medium">{success}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="max-h-[252px] overflow-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#FAFAFA]">
                <tr className="border-b border-gray-200 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                  <th className="px-4 py-3">Objekat</th>
                  <th className="px-4 py-3">Adresa</th>
                  <th className="px-4 py-3">Brojila</th>
                  <th className="px-4 py-3 text-right">Obriši</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-[#AFAFAF] montserrat_medium" colSpan={5}>
                      Učitavanje potrošača...
                    </td>
                  </tr>
                )}

                {!loading && consumers.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-[#AFAFAF] montserrat_medium" colSpan={5}>
                      Nema potrošača za prikaz.
                    </td>
                  </tr>
                )}

                {!loading &&
                  consumers.map((consumer) => (
                    <tr
                      key={consumer.id}
                      onClick={() => onSelect(consumer)}
                      className="cursor-pointer border-b border-gray-100 transition-colors duration-200 hover:bg-[#87BFFC]/10 last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                            <FaHome className="text-base text-[#469FFE]" />
                          </div>
                          <div>
                            <p className="text-sm text-[#363636] montserrat_semibold">{consumer.name}</p>
                            <p className="text-xs text-[#AFAFAF] montserrat_medium">
                              {getObjectTypeLabel(consumer.type)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#363636] montserrat_medium">{consumer.fullAddress}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-[#87BFFC]/25 px-3 py-1.5 text-xs text-blue-500 montserrat_medium">
                          <FaBolt />
                          {getMeterSummary(consumer)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onRequestDelete(consumer);
                          }}
                          disabled={busyId === consumer.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-400 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-100 active:scale-[0.98] disabled:opacity-50"
                          aria-label="Obriši potrošača"
                        >
                          <FaRegTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
