import { UserBtn } from "@/features/auth/components/UserBtn"
import { MobileSidebar } from "./mobile-sidebar"

export const Navbar = () => {
    return (
        <div className="pt-4 px-6 flex items-center justify-between">
            <div className="flex-col hidden lg:flex gap-2">
                <h1 className="text-2xl font-semibold">Home</h1>
                <p className="text-muted-foreground">Monitor all of your projects and tasks in one place</p>
            </div>
            <MobileSidebar />
            <UserBtn />
        </div>
    )
}