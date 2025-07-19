import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { rpc } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof rpc.api.workspaces[":workspaceId"]["reset-invite-code"]["$post"], 200>;
type RequestType = InferRequestType<typeof rpc.api.workspaces[":workspaceId"]["reset-invite-code"]["$post"]>;


export const useResetInviteCode = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({param}) => {
            const response = await rpc.api.workspaces[":workspaceId"]["reset-invite-code"]["$post"]({param});

            if (!response.ok) {
                throw new Error("Failed to reset invite code");
            }

            return await response.json();
        },
        onSuccess: ({data}) => {
            toast.success("Invite code reset");
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] });
        },
        onError: () => {
            toast.error("Failed to reset invite code");
        }
    })

    return mutation;
};
