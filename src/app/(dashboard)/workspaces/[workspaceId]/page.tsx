
import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";

const WorkspaceIdPage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/signin");

    return (
        <div>
            <h1>Workspace Id Page</h1>
        </div>
    );
};

export default WorkspaceIdPage;