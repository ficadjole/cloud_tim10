import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileInvoiceDollar, FaHome, FaSignal, FaUserCircle } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
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
import bg2 from "../../public/bg3.png";
import houseIcon from "../../public/house.png";
import graphIcon from "../../public/graph.png";
import billIcon from "../../public/bill.png";
import UserDashboardCard from "../../components/user/dashboard/UserDashboardCard";
import UserDashboardPanelModal from "../../components/user/dashboard/UserDashboardPanelModal";
import ObjectsPanel from "../../components/user/dashboard/ObjectsPanel";
import TelemetryPanel from "../../components/user/dashboard/TelemetryPanel";
import DigitalRecordPanel from "../../components/user/dashboard/DigitalRecordPanel";

import type {
  BarChartPoint,
  MeterDeleteTarget,
  TelemetryPoint,
  UserDashboardPanel as UserDashboardPanelId,
} from "../../types/dashboard/dashboardTypes";
import {
  allFilterValue,
  buildDeviceGuid,
  checkoutCancelUrl,
  checkoutSuccessUrl,
  digitalRecordFetchSize,
  formatPeriod,
  getAverageVoltage,
  getConnectionTypeLabel,
  getConsumerMeterIds,
  getCurrentTariff,
  getMonthDays,
  hydrateConsumerMeters,
  isBillInPeriod,
  isBillUnpaid,
  isStatusOnline,
  pendingPaymentBillKey,
  statusBelongsToMeter,
  telemetryRefreshMs,
  toFiniteNumber,
} from "../../utils/dashboard/dashboardHelpers";

type MeterDeleteTargetState = MeterDeleteTarget;

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
  const [activeCard, setActiveCard] = useState<UserDashboardPanelId | null>(null);
  const [openPanel, setOpenPanel] = useState<UserDashboardPanelId | null>(null);
  const [consumers, setConsumers] = useState<ConsumerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bills, setBills] = useState<BillDto[]>([]);
  const [digitalRecordBills, setDigitalRecordBills] = useState<BillDto[]>([]);
  const [digitalRecordLoading, setDigitalRecordLoading] = useState(false);
  const [digitalRecordError, setDigitalRecordError] = useState("");
  const [digitalRecordObjectId, setDigitalRecordObjectId] = useState(allFilterValue);
  const [digitalRecordMeterId, setDigitalRecordMeterId] = useState(allFilterValue);
  const [digitalRecordStatus, setDigitalRecordStatus] = useState(allFilterValue);
  const [digitalRecordFrom, setDigitalRecordFrom] = useState("");
  const [digitalRecordTo, setDigitalRecordTo] = useState("");
  const [digitalRecordPage, setDigitalRecordPage] = useState(1);
  const [digitalRecordPageSize, setDigitalRecordPageSize] = useState(10);
  const [digitalRecordTotalCount, setDigitalRecordTotalCount] = useState(0);
  const [deviceStatuses, setDeviceStatuses] = useState<DeviceStatusDto[]>([]);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [telemetryError, setTelemetryError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState<ConsumerRow | null>(null);
  const [consumerForMeter, setConsumerForMeter] = useState<ConsumerRow | null>(null);
  const [consumerForDelete, setConsumerForDelete] = useState<ConsumerRow | null>(null);
  const [meterDeleteTarget, setMeterDeleteTarget] = useState<MeterDeleteTargetState | null>(null);
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

    const response = await billApi.getByOwner(user.id, 1, 10);

    if (!response.success) {
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

  const meterNameById = useMemo(() => {
    const names = new Map<string, string>();
    userMeters.forEach((meter) => {
      if (meter.id) names.set(meter.id, meter.serialNumber || meter.id);
    });
    return names;
  }, [userMeters]);

  const selectedDigitalRecordObject = useMemo(
    () => consumers.find((consumer) => consumer.id === digitalRecordObjectId) ?? null,
    [consumers, digitalRecordObjectId]
  );

  const digitalRecordMeterOptions = useMemo(() => {
    if (digitalRecordObjectId === allFilterValue) return userMeters;
    return selectedDigitalRecordObject?.smartMeters ?? [];
  }, [digitalRecordObjectId, selectedDigitalRecordObject, userMeters]);

  const digitalRecordScopeMeterIds = useMemo(() => {
    if (digitalRecordMeterId !== allFilterValue) return [digitalRecordMeterId];
    if (digitalRecordObjectId === allFilterValue) return userMeters.map((meter) => meter.id).filter(Boolean);
    return getConsumerMeterIds(selectedDigitalRecordObject ?? { id: "", name: "", type: "", fullAddress: "", isActive: false });
  }, [digitalRecordMeterId, digitalRecordObjectId, userMeters, selectedDigitalRecordObject]);

  useEffect(() => {
    if (digitalRecordMeterId === allFilterValue) return;
    const hasSelectedMeter = digitalRecordMeterOptions.some((meter) => meter.id === digitalRecordMeterId);
    if (!hasSelectedMeter) setDigitalRecordMeterId(allFilterValue);
  }, [digitalRecordMeterId, digitalRecordMeterOptions]);

  const filteredDigitalRecordBills = useMemo(() => {
    return digitalRecordBills
      .filter((bill) => digitalRecordStatus === allFilterValue || String(bill.status ?? "").toLowerCase() === digitalRecordStatus)
      .filter((bill) => isBillInPeriod(bill, digitalRecordFrom, digitalRecordTo))
      .sort((a, b) => new Date(b.billingPeriod).getTime() - new Date(a.billingPeriod).getTime());
  }, [digitalRecordBills, digitalRecordStatus, digitalRecordFrom, digitalRecordTo]);

  const digitalRecordTotalPages = Math.max(1, Math.ceil(filteredDigitalRecordBills.length / digitalRecordPageSize));
  const digitalRecordCurrentPage = Math.min(digitalRecordPage, digitalRecordTotalPages);
  const pagedDigitalRecordBills = useMemo(() => {
    const start = (digitalRecordCurrentPage - 1) * digitalRecordPageSize;
    return filteredDigitalRecordBills.slice(start, start + digitalRecordPageSize);
  }, [filteredDigitalRecordBills, digitalRecordCurrentPage, digitalRecordPageSize]);

  const digitalRecordSummary = useMemo(() => {
    return filteredDigitalRecordBills.reduce(
      (summary, bill) => ({
        highTariff: summary.highTariff + bill.highTariffKWh,
        lowTariff: summary.lowTariff + bill.lowTariffKWh,
        totalAmount: summary.totalAmount + bill.totalAmount,
        unpaidCount: summary.unpaidCount + (isBillUnpaid(bill) ? 1 : 0),
      }),
      { highTariff: 0, lowTariff: 0, totalAmount: 0, unpaidCount: 0 }
    );
  }, [filteredDigitalRecordBills]);

  useEffect(() => {
    setDigitalRecordPage(1);
  }, [digitalRecordObjectId, digitalRecordMeterId, digitalRecordStatus, digitalRecordFrom, digitalRecordTo, digitalRecordPageSize]);

  useEffect(() => {
    if (digitalRecordPage <= digitalRecordTotalPages) return;
    setDigitalRecordPage(digitalRecordTotalPages);
  }, [digitalRecordPage, digitalRecordTotalPages]);

  const loadDigitalRecord = async () => {
    if (!user?.id) return;

    setDigitalRecordLoading(true);
    setDigitalRecordError("");

    if (digitalRecordObjectId !== allFilterValue && digitalRecordScopeMeterIds.length === 0) {
      setDigitalRecordBills([]);
      setDigitalRecordTotalCount(0);
      setDigitalRecordLoading(false);
      return;
    }

    if (digitalRecordMeterId !== allFilterValue) {
      const response = await billApi.getByMeter(digitalRecordMeterId, 1, digitalRecordFetchSize);
      setDigitalRecordLoading(false);

      if (!response.success) {
        setDigitalRecordError(response.message);
        setDigitalRecordBills([]);
        setDigitalRecordTotalCount(0);
        return;
      }

      setDigitalRecordBills(response.data?.items ?? []);
      setDigitalRecordTotalCount(response.data?.totalCount ?? 0);
      return;
    }

    if (digitalRecordObjectId === allFilterValue) {
      const response = await billApi.getByOwner(user.id, 1, digitalRecordFetchSize);
      setDigitalRecordLoading(false);

      if (!response.success) {
        setDigitalRecordError(response.message);
        setDigitalRecordBills([]);
        setDigitalRecordTotalCount(0);
        return;
      }

      setDigitalRecordBills(response.data?.items ?? []);
      setDigitalRecordTotalCount(response.data?.totalCount ?? 0);
      return;
    }

    const responses = await Promise.all(
      digitalRecordScopeMeterIds.map((meterId) => billApi.getByMeter(meterId, 1, digitalRecordFetchSize))
    );
    setDigitalRecordLoading(false);

    const failedResponse = responses.find((response) => !response.success);
    if (failedResponse) {
      setDigitalRecordError(failedResponse.message);
    }

    const loadedBills = responses.flatMap((response) => response.data?.items ?? []);
    setDigitalRecordBills(loadedBills);
    setDigitalRecordTotalCount(loadedBills.length);
  };

  useEffect(() => {
    void loadDigitalRecord();
  }, [user?.id, digitalRecordObjectId, digitalRecordMeterId, digitalRecordScopeMeterIds.join("|")]);

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
          id: bill.id,
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

  // NOTE: currently not wired up to any UI control (kept from the original
  // implementation) — the backend has no dedicated deactivate route for a meter.
  const handleToggle = async (consumer: ConsumerRow) => {
    setError("");
    setSuccess("");

    if (consumer.isActive) {
      setConsumers((prev) =>
        prev.map((item) =>
          item.id === consumer.id ? { ...item, isActive: false } : item
        )
      );
      setSuccess("Potrošački nalog je deaktiviran lokalno. Backend trenutno nema posebnu deactivate rutu za brojilo.");
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
    setBusyId(bill.id);

    const response = await billApi.downloadPdf(bill);
    setBusyId(null);

    if (!response.success || !response.data) {
      setDigitalRecordError(response.message);
      return;
    }

    const pdfUrl = URL.createObjectURL(response.data);
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
  };

  const handlePayBill = async (bill: BillDto) => {
    setDigitalRecordError("");
    setPayingBillId(bill.id);

    const response = await billApi.createCheckoutSession(bill.id, {
      successUrl: checkoutSuccessUrl,
      cancelUrl: checkoutCancelUrl,
    });

    setPayingBillId(null);

    if (!response.success || !response.data?.checkoutUrl) {
      setDigitalRecordError(response.message);
      return;
    }

    sessionStorage.setItem(pendingPaymentBillKey, JSON.stringify(bill));
    window.location.assign(response.data.checkoutUrl);
  };

  const handleConsumerUpdated = async (consumerId: string) => {
    setSuccess("Objekat je uspešno izmenjen.");
    const loadedConsumers = await loadConsumers();
    const updatedConsumer = loadedConsumers.find((consumer) => consumer.id === consumerId);
    setSelectedConsumer(updatedConsumer ?? null);
  };

  const handleSmartMeterUpdated = async () => {
    setSuccess("Brojilo je uspešno izmenjeno.");
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
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat px-6 py-8"
      style={{ backgroundImage: `url(${bg2})` }}
    >


      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-left justify-center">
        <div className="mb-10 flex items-center justify-between gap-6 text-left">
          <div>
            <p className="text-[11px] mb-5 font-medium uppercase tracking-widest text-gray-400 montserrat_medium">
              Korisnički profil
            </p>
            <div className="flex items-center gap-4">
              <FaUserCircle className="text-7xl text-[#469FFE]" />
              <div>
                <h1 className="text-6xl text-[#363636] montserrat_extrabold text-left">{user?.name ?? "Potrošač"}</h1>
                <p className="mt-2 text-lg text-[#636363] montserrat_medium">{user?.email ?? "Nema email adrese"}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 px-6 py-3 rounded-md bg-[#469FFE] text-white text-base font-semibold hover:bg-[#2b7bdc] transition-colors"
          >
            <IoIosLogOut className="inline-block text-xl font-bold" />
          </button>
        </div>

        <div className="flex w-full flex-col gap-6 md:flex-row" onMouseLeave={() => setActiveCard(null)}>
          <UserDashboardCard
            id="objects"
            activeCard={activeCard}
            eyebrow="Kontrolni panel"
            title="Objekti i potrošači"
            children={"Pregled, upravljanje i izmena objekata i potrošača. Ručna prijava stanja brojila."}
            icon={houseIcon}
            onHover={setActiveCard}
            onOpen={setOpenPanel}
          />
          <UserDashboardCard
            id="telemetry"
            activeCard={activeCard}
            eyebrow="Potrošnja i stanje mreže"
            title="Telemetrija i analitika"
            children={"Prikaz trenutne potrošnje, stanja uređaja i analitika potrošnje."}
            icon={graphIcon}
            onHover={setActiveCard}
            onOpen={setOpenPanel}
          />
          <UserDashboardCard
            id="digital"
            activeCard={activeCard}
            eyebrow="Istorija računa i plaćanja"
            title="Digitalni karton"
            children={"Pregled i plaćanje računa, kao i istorija potrošnje."}
            icon={billIcon}
            onHover={setActiveCard}
            onOpen={setOpenPanel}
          />
        </div>

        {openPanel && (
          <UserDashboardPanelModal onClose={() => setOpenPanel(null)}>
            {openPanel === "objects" && (
              <ObjectsPanel
                consumers={consumers}
                loading={loading}
                error={error}
                success={success}
                busyId={busyId}
                onRefresh={loadConsumers}
                onCreateNew={() => setIsCreateModalOpen(true)}
                onSelect={setSelectedConsumer}
                onRequestDelete={setConsumerForDelete}
              />
            )}

            {openPanel === "telemetry" && (
              <TelemetryPanel
                telemetrySummary={telemetrySummary}
                telemetryError={telemetryError}
                telemetryLoading={telemetryLoading}
                isSignalRConnected={isSignalRConnected}
                consumptionChartData={consumptionChartData}
                telemetryHistory={telemetryHistory}
              />
            )}

            {openPanel === "digital" && (
              <DigitalRecordPanel
                consumers={consumers}
                loading={digitalRecordLoading}
                error={digitalRecordError}
                onRefresh={loadDigitalRecord}
                objectId={digitalRecordObjectId}
                onObjectIdChange={setDigitalRecordObjectId}
                meterId={digitalRecordMeterId}
                onMeterIdChange={setDigitalRecordMeterId}
                meterOptions={digitalRecordMeterOptions}
                status={digitalRecordStatus}
                onStatusChange={setDigitalRecordStatus}
                from={digitalRecordFrom}
                onFromChange={setDigitalRecordFrom}
                to={digitalRecordTo}
                onToChange={setDigitalRecordTo}
                pageSize={digitalRecordPageSize}
                onPageSizeChange={setDigitalRecordPageSize}
                totalCount={digitalRecordTotalCount}
                filteredCount={filteredDigitalRecordBills.length}
                summary={digitalRecordSummary}
                rows={pagedDigitalRecordBills}
                meterNameById={meterNameById}
                currentPage={digitalRecordCurrentPage}
                totalPages={digitalRecordTotalPages}
                onPageChange={setDigitalRecordPage}
                payingBillId={payingBillId}
                busyId={busyId}
                onPayBill={handlePayBill}
                onOpenPdf={handleOpenBillPdf}
              />
            )}
          </UserDashboardPanelModal>
        )}
      </main>
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
    </div>
  );
}
