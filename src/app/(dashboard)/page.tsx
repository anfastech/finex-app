import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { getWorkspaces } from "@/features/workspaces/queries";

export default async function Home() {
  const user = await getCurrent();
  if (!user) redirect("/signin");

  const workspaces = await getWorkspaces();
  if (!workspaces.documents.length) {
    redirect("/workspaces/create");
  } else {
    redirect(`/workspaces/${workspaces.documents[0].$id}`);
  } 
};
