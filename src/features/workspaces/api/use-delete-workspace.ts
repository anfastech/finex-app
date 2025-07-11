import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { rpc } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof rpc.api.workspaces[":workspaceId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof rpc.api.workspaces[":workspaceId"]["$delete"]>;


export const useDeleteWorkspace = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({param}) => {
            const response = await rpc.api.workspaces[":workspaceId"]["$delete"]({param});

            if (!response.ok) {
                throw new Error("Failed to delete workspace");
            }

            return await response.json();
        },
        onSuccess: ({data}) => {
            toast.success("Workspace deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
        },
        onError: () => {
            toast.error("Failed to delete workspace");
        }
    })

    return mutation;
};
