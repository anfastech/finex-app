
import { getCurrent } from "@/features/auth/actions";
import { redirect } from "next/navigation";

const WorkspaceIdPage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/signin");

    return (
        <div>
            <h1>Workspace</h1>
        </div>
    );
};

export default WorkspaceIdPage;