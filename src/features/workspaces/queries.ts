// only wanna use in server action 
// "use server"; 

import { Query } from "node-appwrite";

import { getMember } from "../members/utils";
import { DATABASE_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config";

import { Workspace } from "./types";
import { createSessionClient } from "@/lib/appwrite";

// protect 
export const getWorkspaces = async () => {
  try {
    const { databases, account } = await createSessionClient();

    const user = await account.get();

    const members = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("userId", user.$id)]
    );

    if (!members.documents.length) {
      return { documents: [], total: 0 };
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACE_ID,
      [
        Query.orderDesc("$createdAt"),
        Query.contains("$id", workspaceIds),
      ],
    );

    return workspaces;
  } catch {
    return { documents: [], total: 0 };
    // redirect('/something')
  }
};

interface GetWorkspaceProps {
  workspaceId: string;
}

export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {
  try {
    const { databases, account } = await createSessionClient();

    const user = await account.get();

    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId,
    });

    if (!member) {
      return null;
    }

    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACE_ID,
      workspaceId
    );

    return workspace;
  } catch {
    return null;
    // redirect('/something')
  }
};
