import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaFileInvoiceDollar,
  FaHome,
  FaRegTrashAlt,
  FaTimesCircle,
  FaUserCircle,
} from "react-icons/fa";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { residentalObjectApi } from "../../api_services/residental_objects/ResidentalObjectAPIService";
import { smartMeterApi } from "../../api_services/smart_meters/SmartMeterAPIService";
import { billApi } from "../../api_services/bills/BillAPIService";
import type { ConsumerRow } from "../../models/residental_object/ResidentalObjectTypes";
import ConsumerDetailsModal from "../../components/user/ConsumerDetailsModal";
import CreateConsumerModal from "../../components/user/CreateConsumerModal";
import CreateSmartMeterModal from "../../components/user/CreateSmartMeterModal";
import DeleteConsumerModal from "../../components/user/DeleteConsumerModal";
import DeleteSmartMeterModal from "../../components/user/DeleteSmartMeterModal";
import EditSmartMeterModal from "../../components/user/EditSmartMeterModal";
import type { SmartMeterDto } from "../../models/smart_meter/SmartMeterTypes";
import type { BillDto } from "../../models/bill/BillTypes";
import { IoIosLogOut, IoIosRefresh } from "react-icons/io";
import { AiOutlineLoading } from "react-icons/ai";
import { MdOutlineAddHomeWork } from "react-icons/md";

const panelClass =
  "rounded-2xl bg-linear-to-b from-[#FAFAFA] to-white/1 backdrop-blur-2xl border border-white/40 p-4 shadow-lg";

const cardClass = "rounded-2xl bg-[#FAFAFA] border border-gray-200 p-6";

const actionButtonClass =
  "z-30 montserrat_semibold bg-[#469FFE] hover:bg-[#2b7bdc] rounded-md text-white relative after:content-[''] after:-z-20 after:absolute after:h-1 after:w-1 after:bg-[#2b7bdc] after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md hover:after:scale-[300] hover:after:transition-all hover:after:duration-700 after:transition-all after:duration-700 transition-all duration-700 [text-shadow:3px_5px_2px_#1f5fb0] hover:[text-shadow:2px_2px_2px_#b5e0ff] disabled:opacity-50 cursor-pointer";

const getObjectTypeLabel = (type: string | number) => {
  const normalized = String(type);

  if (normalized === "0") return "Kuća";
  if (normalized === "1") return "Stan";
  if (normalized === "2") return "Vikendica";

  return normalized || "Objekat";
};

const buildDeviceGuid = (objectId: string) => `frontend-${objectId}`;

const getMeterSummary = (consumer: ConsumerRow) => {
  const meterCount = consumer.smartMeters?.length ?? consumer.connectedMeterIds?.length ?? 0;

  if (meterCount > 1) return `${meterCount} brojila`;
  if (meterCount === 1) return consumer.smartMeters?.[0]?.serialNumber || consumer.smartMeters?.[0]?.id || "1 brojilo";

  return consumer.connectedMeterId ?? "Nije povezano";
};

const isMeterActive = (meter: SmartMeterDto) => {
  if (typeof meter.isActive === "boolean") return meter.isActive;

  const status = String(meter.status ?? "").toLowerCase();
  return status === "1" || status === "paired" || status === "active";
};

const formatCurrency = (value: number) =>
  `${Number(value).toLocaleString("sr-RS", { maximumFractionDigits: 2 })} RSD`;

const formatPeriod = (value: string) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("sr-RS", { month: "2-digit", year: "numeric" });
};

const isBillUnpaid = (bill: BillDto) => String(bill.status ?? "").toLowerCase() === "unpaid";
const isBillPaid = (bill: BillDto) => String(bill.status ?? "").toLowerCase() === "paid";
const checkoutSuccessUrl = "http://localhost:5173/payment-success";
const checkoutCancelUrl = "http://localhost:5173/payment-failed";
const pendingPaymentBillKey = "pendingPaymentBill";

type MeterDeleteTarget = {
  consumer: ConsumerRow;
  meter: SmartMeterDto;
};

const getConsumerMeterIds = (consumer: ConsumerRow) => {
  const meterIds = consumer.connectedMeterIds?.length
    ? consumer.connectedMeterIds
    : consumer.smartMeters?.map((meter) => meter.id) ?? [];

  return Array.from(new Set(meterIds.filter(Boolean)));
};

const hydrateConsumerMeters = async (consumer: ConsumerRow): Promise<ConsumerRow> => {
  const meterIds = getConsumerMeterIds(consumer);

  if (meterIds.length === 0) {
    return {
      ...consumer,
      connectedMeterId: null,
      connectedMeterIds: [],
      smartMeters: [],
      isActive: false,
    };
  }

  const smartMeters = await Promise.all(
    meterIds.map(async (meterId) => {
      const fallbackMeter = consumer.smartMeters?.find((meter) => meter.id === meterId) ?? { id: meterId };
      const response = await smartMeterApi.getById(meterId);

      return response.success && response.data ? response.data : fallbackMeter;
    })
  );

  return {
    ...consumer,
    connectedMeterId: meterIds[0] ?? null,
    connectedMeterIds: meterIds,
    smartMeters,
    isActive: smartMeters.length > 0,
  };
};

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState<ConsumerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [billsLoading, setBillsLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [billError, setBillError] = useState("");
  const [success, setSuccess] = useState("");
  const [bills, setBills] = useState<BillDto[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState<ConsumerRow | null>(null);
  const [consumerForMeter, setConsumerForMeter] = useState<ConsumerRow | null>(null);
  const [consumerForDelete, setConsumerForDelete] = useState<ConsumerRow | null>(null);
  const [meterDeleteTarget, setMeterDeleteTarget] = useState<MeterDeleteTarget | null>(null);
  const [meterForEdit, setMeterForEdit] = useState<SmartMeterDto | null>(null);

  const loadConsumers = async () => {
    setLoading(true);
    setError("");

    const response = await residentalObjectApi.getMyObjects();
    setLoading(false);

    if (!response.success) {
      setError(response.message);
      return [];
    }

    const consumersWithMeterIds = (response.data ?? []).map((consumer) => ({
      ...consumer,
      isActive: Boolean(consumer.smartMeters?.length || consumer.connectedMeterIds?.length || consumer.connectedMeterId),
    }));
    const loadedConsumers = await Promise.all(consumersWithMeterIds.map(hydrateConsumerMeters));

    setConsumers(loadedConsumers);
    return loadedConsumers;
  };

  const loadBills = async () => {
    if (!user?.id) return;

    setBillsLoading(true);
    setBillError("");

    const response = await billApi.getByOwner(user.id, 1, 10);
    setBillsLoading(false);

    if (!response.success) {
      setBillError(response.message);
      setBills([]);
      return;
    }

    setBills(response.data?.items ?? []);
  };

  useEffect(() => {
    loadConsumers();
    void loadBills();
  }, [user?.id]);

  const stats = useMemo(() => {
    const meters = consumers.flatMap((consumer) => consumer.smartMeters ?? []);
    const active = meters.filter(isMeterActive).length;

    return {
      total: meters.length,
      active,
      inactive: meters.length - active,
    };
  }, [consumers]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggle = async (consumer: ConsumerRow) => {
    setError("");
    setSuccess("");

    if (consumer.isActive) {
      setConsumers((prev) =>
        prev.map((item) =>
          item.id === consumer.id ? { ...item, isActive: false } : item
        )
      );
      setSuccess("Potrošač je deaktiviran lokalno. Backend trenutno nema posebnu deactivate rutu za brojilo.");
      return;
    }

    if (!consumer.connectedMeterId) {
      setError("Ovaj objekat nema povezano brojilo za aktivaciju.");
      return;
    }

    setBusyId(consumer.id);
    const response = await smartMeterApi.activate({
      serialNumber: consumer.connectedMeterId,
      deviceGuid: buildDeviceGuid(consumer.id),
    });
    setBusyId(null);

    if (!response.success) {
      setError(response.message);
      return;
    }

    setConsumers((prev) =>
      prev.map((item) =>
        item.id === consumer.id ? { ...item, isActive: true } : item
      )
    );
    setSuccess("Potrošač je aktiviran.");
  };

  void handleToggle;

  const handleDelete = async (consumer: ConsumerRow) => {
    setError("");
    setSuccess("");
    setBusyId(consumer.id);
    const response = await residentalObjectApi.delete(consumer.id);
    setBusyId(null);

    if (!response.success) {
      setError(response.message);
      return;
    }

    setConsumers((prev) => prev.filter((item) => item.id !== consumer.id));
    setConsumerForDelete(null);
    setSuccess("Potrošač je obrisan iz baze.");
  };

  const handleConfirmDelete = async () => {
    if (!consumerForDelete) return;

    await handleDelete(consumerForDelete);
  };

  const handleConsumerCreated = async () => {
    setSuccess("Objekat je uspešno dodat.");
    await loadConsumers();
  };

  const handleSmartMeterCreated = async () => {
    setSuccess("Brojilo je uspešno dodato.");
    const loadedConsumers = await loadConsumers();

    if (consumerForMeter) {
      const updatedConsumer = loadedConsumers.find((consumer) => consumer.id === consumerForMeter.id);
      setSelectedConsumer(updatedConsumer ?? consumerForMeter);
    }
  };

  const handleOpenBillPdf = async (bill: BillDto) => {
    setBillError("");
    setBusyId(bill.id);

    const response = await billApi.downloadPdf(bill);
    setBusyId(null);

    if (!response.success || !response.data) {
      setBillError(response.message);
      return;
    }

    const pdfUrl = URL.createObjectURL(response.data);
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
  };

  const handlePayBill = async (bill: BillDto) => {
    setBillError("");
    setPayingBillId(bill.id);

    const response = await billApi.createCheckoutSession(bill.id, {
      successUrl: checkoutSuccessUrl,
      cancelUrl: checkoutCancelUrl,
    });

    setPayingBillId(null);

    if (!response.success || !response.data?.checkoutUrl) {
      setBillError(response.message);
      return;
    }

    sessionStorage.setItem(pendingPaymentBillKey, JSON.stringify(bill));
    window.location.assign(response.data.checkoutUrl);
  };

  const handleConsumerUpdated = async (consumerId: string) => {
    setSuccess("Objekat je uspesno izmenjen.");
    const loadedConsumers = await loadConsumers();
    const updatedConsumer = loadedConsumers.find((consumer) => consumer.id === consumerId);
    setSelectedConsumer(updatedConsumer ?? null);
  };

  const handleSmartMeterUpdated = async () => {
    setSuccess("Brojilo je uspesno izmenjeno.");
    const loadedConsumers = await loadConsumers();

    if (selectedConsumer) {
      const updatedConsumer = loadedConsumers.find((consumer) => consumer.id === selectedConsumer.id);
      setSelectedConsumer(updatedConsumer ?? null);
    }
  };

  const handleConfirmRemoveMeter = async () => {
    const meterId = meterDeleteTarget?.meter.id;
    if (!meterId) return;

    setError("");
    setSuccess("");
    setBusyId(meterId);

    const response = await smartMeterApi.delete(meterId);
    setBusyId(null);

    if (!response.success) {
      setError(response.message);
      return;
    }

    setMeterDeleteTarget(null);
    setSuccess("Brojilo je uspesno uklonjeno.");
    const loadedConsumers = await loadConsumers();

    if (selectedConsumer) {
      const updatedConsumer = loadedConsumers.find((consumer) => consumer.id === selectedConsumer.id);
      setSelectedConsumer(updatedConsumer ?? null);
    }
  };

  return (
    <div className="relative min-h-screen bg-linear-to-b from-white via-[#FAFAFA] to-[#87BFFC] px-4 py-6 backdrop-blur-md">
      <ConsumerDetailsModal
        open={Boolean(selectedConsumer)}
        consumer={selectedConsumer}
        onClose={() => setSelectedConsumer(null)}
        onAddMeter={(consumer) => setConsumerForMeter(consumer)}
        onEditMeter={(meter) => setMeterForEdit(meter)}
        onRemoveMeter={(consumer, meter) => setMeterDeleteTarget({ consumer, meter })}
        onUpdated={handleConsumerUpdated}
      />
      <CreateConsumerModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleConsumerCreated}
      />
      <CreateSmartMeterModal
        open={Boolean(consumerForMeter)}
        consumer={consumerForMeter}
        onClose={() => setConsumerForMeter(null)}
        onCreated={handleSmartMeterCreated}
      />
      <DeleteConsumerModal
        open={Boolean(consumerForDelete)}
        consumer={consumerForDelete}
        loading={Boolean(consumerForDelete && busyId === consumerForDelete.id)}
        onClose={() => setConsumerForDelete(null)}
        onConfirm={handleConfirmDelete}
      />
      <DeleteSmartMeterModal
        open={Boolean(meterDeleteTarget)}
        consumer={meterDeleteTarget?.consumer ?? null}
        meter={meterDeleteTarget?.meter ?? null}
        loading={Boolean(meterDeleteTarget?.meter.id && busyId === meterDeleteTarget.meter.id)}
        onClose={() => setMeterDeleteTarget(null)}
        onConfirm={handleConfirmRemoveMeter}
      />
      <EditSmartMeterModal
        open={Boolean(meterForEdit)}
        meter={meterForEdit}
        onClose={() => setMeterForEdit(null)}
        onUpdated={handleSmartMeterUpdated}
      />

      <div className="absolute right-4 top-4">
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 rounded-md bg-[#469FFE] text-white text-sm font-semibold hover:bg-[#2b7bdc] transition-colors"
        >
          <IoIosLogOut className="inline-block mr-1 text-xl font-bold" />
        </button>
      </div>

      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center py-12">
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-12">
          <section className={`${panelClass} lg:col-span-3`}>
            <div className={`${cardClass} h-full`}>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-[11px] mb-5 font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
                    Korisnički profil
                  </p>
                  <FaUserCircle className="text-8xl text-[#469FFE]" />
                  <h1 className="mt-2 text-3xl text-[#363636] montserrat_bold">
                    {user?.name ?? "Potrošač"}
                  </h1>
                  <p className="mt-1 text-sm text-[#AFAFAF] montserrat_medium">
                    {user?.email ?? user?.username ?? "Nema email adrese"}
                  </p>
                </div>
              </div>

              <p className="text-[11px] mb-2 font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
                Brojila
              </p>
              <div className="grid grid-cols-2 gap-2.5 ">
                <div className="rounded-lg border border-blue-100 bg-[#87BFFC]/25 px-3 py-3">
                  <p className="text-[11px] text-blue-500 montserrat_medium">Ukupno</p>
                  <p className="mt-1 text-2xl text-[#363636] montserrat_bold">{stats.total}</p>
                </div>
                <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-3">
                  <p className="text-[11px] text-green-600 montserrat_medium">Uparena</p>
                  <p className="mt-1 text-2xl text-[#363636] montserrat_bold">{stats.active}</p>
                </div>
              </div>
            </div>
          </section>

          <section className={`${panelClass} lg:col-span-8`}>
            <div className={`${cardClass}`}>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
                    Kontrolni panel
                  </p>
                  <h2 className="mt-1 text-2xl text-[#363636] montserrat_bold">
                    Objekti i potrošači
                  </h2>
                </div>
                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={loadConsumers}
                    disabled={loading}
                    className={`${actionButtonClass} px-3 py-2.5 text-lg`}
                    title="Osveži listu potrošača"
                  >
                    {loading ? <AiOutlineLoading /> : <IoIosRefresh />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
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
                            onClick={() => setSelectedConsumer(consumer)}
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
                            <td className="px-4 py-4 text-sm text-[#363636] montserrat_medium">
                              {consumer.fullAddress}
                            </td>
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
                                  setConsumerForDelete(consumer);
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

          <section className={`${panelClass} lg:col-span-11`}>
            <div className={`${cardClass}`}>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
                    Računi
                  </p>
                  <h2 className="mt-1 text-2xl text-[#363636] montserrat_bold">
                    Poslednji računi
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={loadBills}
                  disabled={billsLoading}
                  className={`${actionButtonClass} px-3 py-2.5 text-lg`}
                  title="Osveži račune"
                >
                  {billsLoading ? <AiOutlineLoading /> : <IoIosRefresh />}
                </button>
              </div>

              {billError && (
                <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                  <FaTimesCircle className="mt-0.5 shrink-0 text-base text-red-400" />
                  <p className="text-xs leading-relaxed text-red-600 montserrat_medium">{billError}</p>
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="max-h-[260px] overflow-auto">
                  <table className="w-full min-w-[820px] border-collapse text-left">
                    <thead className="sticky top-0 z-10 bg-[#FAFAFA]">
                      <tr className="border-b border-gray-200 text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                        <th className="px-4 py-3">Period</th>
                        <th className="px-4 py-3">Brojilo</th>
                        <th className="px-4 py-3 text-right">Viša T</th>
                        <th className="px-4 py-3 text-right">Niža T</th>
                        <th className="px-4 py-3 text-right">Ukupno</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">PDF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billsLoading && (
                        <tr>
                          <td className="px-4 py-8 text-center text-sm text-[#AFAFAF] montserrat_medium" colSpan={7}>
                            Učitavanje računa...
                          </td>
                        </tr>
                      )}

                      {!billsLoading && bills.length === 0 && (
                        <tr>
                          <td className="px-4 py-8 text-center text-sm text-[#AFAFAF] montserrat_medium" colSpan={7}>
                            Nema računa za prikaz.
                          </td>
                        </tr>
                      )}

                      {!billsLoading &&
                        bills.map((bill) => (
                          <tr key={bill.id} className="border-b border-gray-100 last:border-b-0">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                  <FaFileInvoiceDollar className="text-base text-[#469FFE]" />
                                </div>
                                <div>
                                  <p className="text-sm text-[#363636] montserrat_semibold">
                                    {formatPeriod(bill.billingPeriod)}
                                  </p>
                                  <p className="text-xs text-[#AFAFAF] montserrat_medium break-all">{bill.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-xs text-[#AFAFAF] montserrat_medium break-all">
                              {bill.smartMeterId}
                            </td>
                            <td className="px-4 py-4 text-right text-sm text-[#363636] montserrat_medium">
                              {bill.highTariffKWh.toLocaleString("sr-RS", { maximumFractionDigits: 2 })} kWh
                            </td>
                            <td className="px-4 py-4 text-right text-sm text-[#363636] montserrat_medium">
                              {bill.lowTariffKWh.toLocaleString("sr-RS", { maximumFractionDigits: 2 })} kWh
                            </td>
                            <td className="px-4 py-4 text-right text-sm text-[#363636] montserrat_semibold">
                              {formatCurrency(bill.totalAmount)}
                            </td>
                            <td className="px-4 py-4 text-center">
                              {isBillUnpaid(bill) ? (
                                <button
                                  type="button"
                                  onClick={() => handlePayBill(bill)}
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
                                  {bill.status.toLowerCase() === "paid" ? "Plaćen" : "Neplaćen"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenBillPdf(bill)}
                                disabled={busyId === bill.id}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-[#469FFE] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-blue-100 active:scale-[0.98] disabled:opacity-50"
                                aria-label="Otvori PDF račun"
                              >
                                {busyId === bill.id ? <AiOutlineLoading /> : <FaExternalLinkAlt />}
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
        </div>
      </main>
    </div>
  );
}
