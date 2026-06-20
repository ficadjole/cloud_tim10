import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt,
  FaCheckCircle,
  FaChartLine,
  FaExternalLinkAlt,
  FaFileInvoiceDollar,
  FaHome,
  FaPlug,
  FaRegTrashAlt,
  FaSignal,
  FaTimesCircle,
  FaUserCircle,
} from "react-icons/fa";
import { useAuth } from "../../hooks/auth/useAuthHook";
import { useSignalR } from "../../contexts/signalR/SignalRContext";
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
import type { DeviceStatusDto, SmartMeterDto } from "../../models/smart_meter/SmartMeterTypes";
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
const telemetryRefreshMs = 5000;
const onlineThresholdSeconds = 20;

type TelemetryPoint = {
  time: number;
  label: string;
  averageVoltage: number;
  totalLoad: number;
};

type BarChartPoint = {
  label: string;
  highTariff: number;
  lowTariff: number;
};

type MeterDeleteTarget = {
  consumer: ConsumerRow;
  meter: SmartMeterDto;
};

const toFiniteNumber = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const formatNumber = (value: number | null | undefined, unit: string, maximumFractionDigits = 2) => {
  const numeric = toFiniteNumber(value);
  if (numeric === null) return "-";

  return `${numeric.toLocaleString("sr-RS", { maximumFractionDigits })} ${unit}`;
};

const getAverageVoltage = (status: DeviceStatusDto) => {
  const voltages = [status.voltageL1, status.voltageL2, status.voltageL3]
    .map(toFiniteNumber)
    .filter((value): value is number => value !== null);

  if (voltages.length === 0) return null;
  return voltages.reduce((sum, value) => sum + value, 0) / voltages.length;
};

const getCurrentTariff = () => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 6 ? "NT" : "VT";
};

const getConnectionTypeLabel = (type: SmartMeterDto["connectionType"]) => {
  const normalized = String(type ?? "").toLowerCase();

  if (normalized === "1" || normalized === "singlephase") return "Monofazni";
  if (normalized === "2" || normalized === "multiphase") return "Trofazni";

  return type ? String(type) : "-";
};

const isStatusOnline = (status: DeviceStatusDto) => {
  if (!status.lastHeartbeat) return false;

  const heartbeatTime = new Date(status.lastHeartbeat).getTime();
  if (Number.isNaN(heartbeatTime)) return false;

  return (Date.now() - heartbeatTime) / 1000 <= onlineThresholdSeconds;
};

const getMeterStatusKeys = (meter: SmartMeterDto) =>
  [meter.id, meter.serialNumber, meter.deviceGuid]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .filter(Boolean);

const statusBelongsToMeter = (status: DeviceStatusDto, meter: SmartMeterDto) => {
  const statusDeviceId = String(status.deviceId ?? "").trim().toLowerCase();
  return getMeterStatusKeys(meter).includes(statusDeviceId);
};

const getMonthDays = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 30;

  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const toChartPath = (values: number[], width: number, height: number, padding: number) => {
  if (values.length === 0) return "";

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = values.length > 1 ? padding + step * index : width / 2;
      const y = height - padding - ((value - min) / span) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

const BarChart = ({ data }: { data: BarChartPoint[] }) => {
  const max = Math.max(...data.flatMap((item) => [item.highTariff, item.lowTariff]), 1);

  if (data.length === 0) {
    return (
      <div className="flex h-60 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm text-[#AFAFAF] montserrat_medium">
        Nema dovoljno racuna za prikaz potrosnje.
      </div>
    );
  }

  return (
    <div className="h-60 rounded-xl border border-gray-200 bg-white px-4 py-4">
      <div className="flex h-44 items-end gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-36 w-full max-w-14 items-end justify-center gap-1.5">
              <div
                className="w-4 rounded-t-md bg-[#469FFE]"
                style={{ height: `${Math.max((item.highTariff / max) * 100, 4)}%` }}
                title={`VT: ${formatNumber(item.highTariff, "kWh")}`}
              />
              <div
                className="w-4 rounded-t-md bg-green-400"
                style={{ height: `${Math.max((item.lowTariff / max) * 100, 4)}%` }}
                title={`NT: ${formatNumber(item.lowTariff, "kWh")}`}
              />
            </div>
            <p className="truncate text-[11px] text-[#AFAFAF] montserrat_medium">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-[#AFAFAF] montserrat_medium">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#469FFE]" />VT</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-green-400" />NT</span>
      </div>
    </div>
  );
};

const LineChart = ({
  data,
  valueKey,
  color,
  emptyMessage,
}: {
  data: TelemetryPoint[];
  valueKey: "averageVoltage" | "totalLoad";
  color: string;
  emptyMessage: string;
}) => {
  const values = data.map((item) => item[valueKey]).filter((value) => Number.isFinite(value));
  const width = 520;
  const height = 180;
  const padding = 22;
  const path = toChartPath(values, width, height, padding);

  if (values.length < 2) {
    return (
      <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm text-[#AFAFAF] montserrat_medium">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full" role="img" aria-label="Trend grafikon">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E5E7EB" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E5E7EB" />
        <path d={path} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((value, index) => {
          const max = Math.max(...values);
          const min = Math.min(...values);
          const span = max - min || 1;
          const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
          const x = padding + step * index;
          const y = height - padding - ((value - min) / span) * (height - padding * 2);

          return <circle key={`${value}-${index}`} cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="3" />;
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-[#AFAFAF] montserrat_medium">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
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
  const {
    isConnected: isSignalRConnected,
    deviceStatuses: realTimeDeviceStatuses,
    joinObjectGroup,
    leaveObjectGroup,
    joinMeterGroup,
    leaveMeterGroup,
  } = useSignalR();
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
  const [deviceStatuses, setDeviceStatuses] = useState<DeviceStatusDto[]>([]);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [telemetryError, setTelemetryError] = useState("");
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

  const userMeters = useMemo(
    () => consumers.flatMap((consumer) => consumer.smartMeters ?? []),
    [consumers]
  );

  const userMeterIds = useMemo(
    () => new Set(userMeters.map((meter) => meter.id).filter(Boolean)),
    [userMeters]
  );

  const appendTelemetrySnapshot = (statuses: DeviceStatusDto[]) => {
    const voltages = statuses
      .map(getAverageVoltage)
      .filter((value): value is number => value !== null);
    const totalLoad = statuses.reduce((sum, status) => sum + (toFiniteNumber(status.currentLoadKW) ?? 0), 0);

    if (voltages.length === 0 && totalLoad <= 0) return;

    const now = new Date();
    const averageVoltage = voltages.length
      ? voltages.reduce((sum, value) => sum + value, 0) / voltages.length
      : 0;

    setTelemetryHistory((current) => [
      ...current.slice(-11),
      {
        time: now.getTime(),
        label: now.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        averageVoltage,
        totalLoad,
      },
    ]);
  };

  useEffect(() => {
    if (userMeterIds.size === 0) {
      setDeviceStatuses([]);
      setTelemetryHistory([]);
      setTelemetryLoading(false);
      return;
    }

    let cancelled = false;
    let requestInFlight = false;
    let loadedOnce = false;

    const loadTelemetry = async () => {
      if (requestInFlight) return;

      requestInFlight = true;

      if (!loadedOnce) {
        setTelemetryLoading(true);
      }

      const response = await smartMeterApi.getDeviceStatuses();
      requestInFlight = false;

      if (cancelled) return;

      loadedOnce = true;
      setTelemetryLoading(false);

      if (!response.success) {
        setTelemetryError(response.message);
        return;
      }

      const ownedStatuses = (response.data ?? []).filter((status) =>
        userMeters.some((meter) => statusBelongsToMeter(status, meter))
      );
      const uniqueStatuses = Array.from(new Map(ownedStatuses.map((status) => [status.deviceId, status])).values());

      setTelemetryError("");
      setDeviceStatuses(uniqueStatuses);
      appendTelemetrySnapshot(uniqueStatuses);
    };

    void loadTelemetry();
    const intervalId = window.setInterval(() => {
      void loadTelemetry();
    }, telemetryRefreshMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [userMeterIds, userMeters]);

  useEffect(() => {
    const ownedStatuses = realTimeDeviceStatuses.filter((status) =>
      userMeters.some((meter) => statusBelongsToMeter(status, meter))
    );

    if (ownedStatuses.length === 0) return;

    setDeviceStatuses((current) => {
      const next = new Map(current.map((status) => [status.deviceId, status]));
      ownedStatuses.forEach((status) => next.set(status.deviceId, status));
      return Array.from(next.values());
    });
    appendTelemetrySnapshot(ownedStatuses);
  }, [realTimeDeviceStatuses, userMeters]);

  useEffect(() => {
    if (!selectedConsumer || !isSignalRConnected) return;

    const meterIds = getConsumerMeterIds(selectedConsumer);

    void joinObjectGroup(selectedConsumer.id);
    meterIds.forEach((meterId) => {
      void joinMeterGroup(meterId);
    });

    return () => {
      void leaveObjectGroup(selectedConsumer.id);
      meterIds.forEach((meterId) => {
        void leaveMeterGroup(meterId);
      });
    };
  }, [selectedConsumer?.id, isSignalRConnected]);

  const telemetrySummary = useMemo(() => {
    const latestVoltages = deviceStatuses
      .map(getAverageVoltage)
      .filter((value): value is number => value !== null);
    const averageVoltage = latestVoltages.length
      ? latestVoltages.reduce((sum, value) => sum + value, 0) / latestVoltages.length
      : null;
    const totalLoad = deviceStatuses.reduce((sum, status) => sum + (toFiniteNumber(status.currentLoadKW) ?? 0), 0);
    const online = deviceStatuses.filter(isStatusOnline).length;
    const connectionTypes = Array.from(new Set(userMeters.map((meter) => getConnectionTypeLabel(meter.connectionType))));

    return {
      currentTariff: getCurrentTariff(),
      averageVoltage,
      totalLoad,
      online,
      totalTracked: userMeters.length,
      connectionLabel: connectionTypes.length === 1 ? connectionTypes[0] : `${connectionTypes.length || 0} tipa`,
    };
  }, [deviceStatuses, userMeters]);

  const consumptionChartData = useMemo<BarChartPoint[]>(() => {
    return [...bills]
      .sort((a, b) => new Date(a.billingPeriod).getTime() - new Date(b.billingPeriod).getTime())
      .slice(-6)
      .map((bill) => {
        const days = getMonthDays(bill.billingPeriod);

        return {
          label: formatPeriod(bill.billingPeriod),
          highTariff: bill.highTariffKWh / days,
          lowTariff: bill.lowTariffKWh / days,
        };
      });
  }, [bills]);

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
        deviceStatuses={deviceStatuses}
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
                    {user?.email ?? "Nema email adrese"}
                  </p>
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
                    Telemetrija i analitika
                  </p>
                  <h2 className="mt-1 text-2xl text-[#363636] montserrat_bold">
                    Potrošnja i stanje mreže
                  </h2>
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
                    <p className="text-[11px] uppercase tracking-widest text-blue-500 montserrat_medium">
                      Trenutna tarifa
                    </p>
                    <FaBolt className="text-[#469FFE]" />
                  </div>
                  <p className="mt-2 text-2xl text-[#363636] montserrat_bold">{telemetrySummary.currentTariff}</p>
                  <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">
                    {telemetrySummary.currentTariff === "NT" ? "Niža tarifa je aktivna" : "Viša tarifa je aktivna"}
                  </p>
                </div>

                <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-widest text-green-600 montserrat_medium">
                      Napon
                    </p>
                    <FaChartLine className="text-green-500" />
                  </div>
                  <p className="mt-2 text-2xl text-[#363636] montserrat_bold">
                    {formatNumber(telemetrySummary.averageVoltage, "V", 1)}
                  </p>
                  <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">Prosek aktivnih faza</p>
                </div>

                <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-widest text-orange-500 montserrat_medium">
                      Opterećenje
                    </p>
                    <FaBolt className="text-orange-400" />
                  </div>
                  <p className="mt-2 text-2xl text-[#363636] montserrat_bold">
                    {formatNumber(telemetrySummary.totalLoad, "kW", 2)}
                  </p>
                  <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">Ukupno za brojila</p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                      Konekcija
                    </p>
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
                    <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">
                      Prosek po danu iz poslednjih računa
                    </p>
                  </div>
                  <BarChart data={consumptionChartData} />
                </div>

                <div className="xl:col-span-1">
                  <div className="mb-3">
                    <p className="text-[11px] uppercase tracking-widest text-gray-400 montserrat_medium">
                      Trend napona
                    </p>
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
                    <p className="mt-1 text-xs text-[#AFAFAF] montserrat_medium">
                      Ukupno trenutno opterećenje
                    </p>
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
