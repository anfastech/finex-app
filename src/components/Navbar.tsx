"use client";

import { usePathname } from "next/navigation";

import { MobileSidebar } from "./mobile-sidebar";
import { UserBtn } from "@/features/auth/components/UserBtn";

const pathnameMap = {
    "tasks": {
        title: "My Tasks",
        description: "View all of your tasks here",
    },
    "projects": {
        title: "My Project",
        description: "View all of your projects here",
    }
}

const defaultMap = {
    title: "Home",
    description: "Monitor all of your projects and tasks in one place"
}

export const Navbar = () => {
    const pathname = usePathname();
    const pathnameParts = pathname.split("/");

    const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

    const { title, description } = pathnameMap[pathnameKey] || defaultMap;

    return (
        <div className="pt-4 px-6 flex items-center justify-between">
            <div className="flex-col hidden lg:flex gap-2">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            <MobileSidebar />
            <UserBtn />
        </div>
    )
}