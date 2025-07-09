
import { getCurrent } from "@/features/auth/actions";
import { SignInCard } from "@/features/auth/components/SignInCard";
import { redirect } from "next/navigation";

const SignInPage = async () => {
    const user = await getCurrent();

    if (user) redirect("/");

    return <SignInCard />;
};

export default SignInPage;