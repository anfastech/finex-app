import { cn } from "@/lib/utils";
import { SettingsIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from "react-icons/go";

const routes = [
    {
        label: "Home",
        href: "",
        icon: GoHome,
        activeIcon: GoHomeFill,
    },
    {
        label: "My Task",
        href: "/tasks",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: SettingsIcon,
        activeIcon: SettingsIcon,
    },
    {
        label: "Members",
        href: "/members",
        icon: UsersIcon,
        activeIcon: UsersIcon,
    }
];

export const Navigation = () => {
    return (
        <div className="flex flex-col">
            {routes.map((item) => {
                const isActive = false;
                const Icon = isActive ? item.activeIcon : item.icon;
                return (
                    <Link key={item.href} href={item.href}>
                        <div className={cn("flex items-center gap-2.5 p-2.5 rounded-md font-medium  hover:text-primary transition text-neutral-500", isActive && "bg-primary-500/10 text-primary-500", isActive && "bg-white shadow-sm hover:opacity-100 text-primary")}>
                            <Icon className="size-5 text-neutral-500" />
                            <span>{item.label}</span>
                        </div>
                    </Link>
                )
            })};
        </div>
    );
};