import { useQuery } from "@tanstack/react-query";

import { rpc } from "@/lib/rpc";

interface useGetTasksProps {
    workspaceId: string;
}

export const useGetTasks = ({
    workspaceId,
}: useGetTasksProps) => {
    const query = useQuery({
        queryKey: ["tasks", workspaceId],
        queryFn: async () => {
            const response = await rpc.api.tasks.$get({
                query: { workspaceId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }

            const { data } = await response.json();

            return data;
        }
    });

    return query;

}