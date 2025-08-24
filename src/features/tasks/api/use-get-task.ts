import { useQuery } from "@tanstack/react-query";

import { rpc } from "@/lib/rpc";

interface useGetTaskProps {
    taskId: string;
}

export const useGetTask = ({
    taskId
}: useGetTaskProps) => {
    const query = useQuery({
        queryKey: [ "task", taskId ],
        queryFn: async () => {
            const response = await rpc.api.tasks[":taskId"].$get({ param: {
                taskId
            }});

            if (!response.ok) {
                throw new Error("Failed to fetch task");
            }

            const { data } = await response.json();

            return data;

            // TODO: Not best pratice, we wanna optimize this reponse and make it faster

            // const raw = await response.json();
            // const tasks: Task[] = raw.documents ?? [];
            // return tasks;
        }
    });

    return query;

}