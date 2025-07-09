import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { rpc } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof rpc.api.auth.login["$post"]>;
type RequestType = InferRequestType<typeof rpc.api.auth.login["$post"]>;


export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({json}) => {
            const response = await rpc.api.auth.login["$post"]({json});

            if (!response.ok) {
                throw new Error("Failed to login");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Logged in successfully");
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ["current"] });
        },
        onError: () => {
            toast.error("Failed to login");
        }
    })

    return mutation;
};
