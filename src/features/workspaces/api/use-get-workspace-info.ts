import { useQuery } from "@tanstack/react-query";

import { rpc } from "@/lib/rpc";

interface useGetWorkspaceInfoProps {
    workspaceId: string;
}

export const useGetWorkspaceInfo = ({
    workspaceId,
}: useGetWorkspaceInfoProps) => {
    const query = useQuery({
        queryKey: ["workspace-info", workspaceId],
        queryFn: async () => {
            const response = await rpc.api.workspaces[":workspaceId"]["info"].$get({
                param: { workspaceId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch workspace info");
            }

            const { data } = await response.json();

            return data;
        }
    });

    return query;

}