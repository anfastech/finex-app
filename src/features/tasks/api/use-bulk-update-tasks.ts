import { toast } from "sonner";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rpc } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof rpc.api.tasks["bulk-update"]["$post"], 200>;
type RequestType = InferRequestType<typeof rpc.api.tasks["bulk-update"]["$post"]>;


export const useBulkUpdateTasks = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await rpc.api.tasks["bulk-update"]["$post"]({ json });

            if (!response.ok) {
                throw new Error("Failed to update tasks");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Tasks updated");

            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.setQueryData(["tasks", data.$id], data);
        },
        onError: () => {
            toast.error("Failed to update tasks");
        }
    })

    return mutation;
};
