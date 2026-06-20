import type { ReactNode } from "react";
import type { UserDashboardPanel } from "../../../types/dashboard/dashboardTypes";

type UserDashboardCardProps = {
  id: UserDashboardPanel;
  activeCard: UserDashboardPanel | null;
  eyebrow: string;
  title: string;
  children?: ReactNode;
  icon: string;
  onHover: (id: UserDashboardPanel) => void;
  onOpen: (id: UserDashboardPanel) => void;
};

export default function UserDashboardCard({
  id,
  activeCard,
  eyebrow,
  title,
  children,
  icon,
  onHover,
  onOpen,
}: UserDashboardCardProps) {
  const isActive = activeCard === id;

  return (
    <div
      onMouseEnter={() => onHover(id)}
      onFocus={() => onHover(id)}
      onClick={() => onOpen(id)}
      className={`group w-full min-w-0 cursor-pointer rounded-2xl border border-white/40 bg-linear-to-b from-[#FAFAFA] to-white/1 px-6 py-6 shadow-lg backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? "md:flex-[2.1_1_0%]" : "md:flex-1"
        }`}
    >
      <div className="relative grid h-full min-h-70 grid-cols-1 items-stretch gap-8 rounded-2xl bg-[#FAFAFA] p-8 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-cols-[minmax(0,1fr)_auto]">
        <div
          className={`flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? "opacity-100" : "opacity-85 md:pr-24"
            }`}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#469FFE] montserrat_medium ">{eyebrow}</p>
            <h2
              className={`mt-4 text-[#363636] montserrat_bold transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? "text-4xl" : "text-3xl"
                }`}
            >
              {title}
            </h2>
            {children && (
              <div
                className={`mt-4 max-w-md text-[#636363] montserrat_medium transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? "text-base" : "text-sm"
                  }`}
              >
                {children}
              </div>
            )}
          </div>
        </div>
        <div
          className={`flex h-full min-h-48 items-center justify-center self-stretch rounded-2xl px-5 py-5 text-[#469FFE] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:min-h-0 ${isActive
            ? "text-8xl md:w-64"
            : "text-5xl md:absolute md:right-7 md:top-7 md:h-20 md:w-20 md:min-h-0 md:p-0"
            }`}
        >
          <img
            src={icon}
            alt="Ikona"
            className={`w-auto object-contain transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]`}
          />
        </div>
      </div>
    </div>
  );
}
