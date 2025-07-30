import { useQuery } from "@tanstack/react-query";

import { rpc } from "@/lib/rpc";

interface useGetProjectsProps {
    workspaceId: string;
}

export const useGetProjects = ({
    workspaceId,
}: useGetProjectsProps) => {
    const query = useQuery({
        queryKey: ["projects", workspaceId],
        queryFn: async () => {
            const response = await rpc.api.projects.$get({
                query: { workspaceId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch projects");
            }

            const { data } = await response.json();

            return data;
        }
    });

    return query;

}