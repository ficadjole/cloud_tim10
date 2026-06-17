import React, { useEffect, useState } from "react";
import {
    FaBell,
    FaTimes,
    FaExclamationTriangle,
    FaExclamationCircle,
    FaInfoCircle
} from "react-icons/fa";
import { useSignalR } from "../../../contexts/signalR/SignalRContext";
import { deviceApi } from "../../../api_services/device/DeviceAPIService";
import type { DeviceAlert } from "../../../types/signalR/DeviceAlert";

const ALERT_ICONS = {
    Critical: <FaExclamationTriangle className="w-4 h-4 text-red-500 shrink-0" />,
    Warning: <FaExclamationCircle className="w-4 h-4 text-amber-500 shrink-0" />,
    Info: <FaInfoCircle className="w-4 h-4 text-blue-500 shrink-0" />
};

const ALERT_COLORS = {
    Critical: "bg-red-50 border-red-200 text-red-800",
    Warning: "bg-amber-50 border-amber-200 text-amber-800",
    Info: "bg-blue-50 border-blue-200 text-blue-800"
};

const alertIcon = (type: string) =>
    ALERT_ICONS[type as keyof typeof ALERT_ICONS] ?? ALERT_ICONS.Info;

const alertColor = (type: string) =>
    ALERT_COLORS[type as keyof typeof ALERT_COLORS] ?? ALERT_COLORS.Info;

const formatTimestamp = (timestamp: string) =>
    new Date(timestamp).toLocaleString("sr-RS", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Belgrade",
    });

const NotificationBell: React.FC = () => {
    const { alerts, clearAlerts } = useSignalR();
    const [isOpen, setIsOpen] = useState(false);
    const [historicAlerts, setHistoricAlerts] = useState<DeviceAlert[]>([]);

    useEffect(() => {
        deviceApi.getRecentAlerts(20).then(res => {
            if (res.success && res.data) setHistoricAlerts(res.data);
        });
    }, []);

    useEffect(() => {
        const handleClickOutside = () => { if (isOpen) setIsOpen(false); };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [isOpen]);

    const allAlerts = [
        ...alerts,
        ...historicAlerts.filter(h =>
            !alerts.some(a => a.deviceId === h.deviceId && a.timestamp === h.timestamp)
        )
    ];

    const unreadCount = alerts.length; 

    return (
        <div className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="relative p-2 rounded-lg border border-[#363636]/10 hover:bg-[#363636]/5 transition"
            >
                <FaBell className="w-5 h-5 text-[#363636]" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-3 w-96 bg-white rounded-2xl border border-[#363636]/10 shadow-2xl z-50 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#363636]/10">
                        <div>
                            <h2 className="text-sm font-bold text-[#363636]">Obaveštenja</h2>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition">
                            <FaTimes className="w-4 h-4 text-[#636363]" />
                        </button>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto px-4 py-3 space-y-2">
                        {allAlerts.length === 0 ? (
                            <div className="text-center py-8 text-sm text-[#636363]">
                                <FaBell className="w-6 h-6 mx-auto mb-2 opacity-20" />
                                Nema obavještenja
                            </div>
                        ) : (
                            allAlerts.map((alert, index) => (
                                <div
                                    key={`${alert.deviceId}-${alert.timestamp}-${index}`}
                                    className={`rounded-xl border p-3 ${alertColor(alert.alertType)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {alertIcon(alert.alertType)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-[10px] uppercase tracking-wide">
                                                    {alert.alertType}
                                                </span>
                                                <span className="text-[10px] opacity-50 shrink-0">
                                                    {formatTimestamp(alert.timestamp)}
                                                </span>
                                            </div>
                                            <div className="text-xs mt-1 leading-relaxed break-words">
                                                {alert.message}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {allAlerts.length > 0 && (
                        <div className="px-5 py-3 border-t border-[#363636]/10 bg-gray-50/50">
                            <button
                                onClick={() => { clearAlerts(); setHistoricAlerts([]); }}
                                className="w-full text-xs text-[#636363] hover:text-red-500 transition-colors"
                            >
                                Obriši sve
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;