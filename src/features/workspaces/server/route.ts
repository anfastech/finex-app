import z from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { getMember } from "@/features/members/utils";
import { MemberRole } from "@/features/members/types";

import { generateInviteCode } from "@/lib/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGE_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";

import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { Workspace } from "../types";

// Create a Hono app for workspace-related API endpoints
const app = new Hono()
  // Endpoint to serve workspace images with authentication
  .get("/file/:fileId", sessionMiddleware, async (c) => {
    const storage = c.get("storage");
    const fileId = c.req.param("fileId");
    
    try {
      // Get file metadata from Appwrite storage
      const file = await storage.getFile(IMAGE_BUCKET_ID, fileId);
      // Get the actual file content as ArrayBuffer
      const arrayBuffer = await storage.getFileView(IMAGE_BUCKET_ID, fileId);
      
      // Clean the filename to remove special characters that break HTTP headers
      const safeFilename = file.name.replace(/[^\w\s.-]/g, "_");
      
      // Return the file as an HTTP response with proper headers
      return new Response(arrayBuffer, {
        headers: {
          "Content-Type": file.mimeType, // Tell browser what type of file this is
          "Content-Disposition": `inline; filename="${safeFilename}"`, // Display in browser instead of downloading
          "Cache-Control": "public, max-age=31536000", // Cache for 1 year to improve performance
        },
      });
    } catch (error) {
      console.error("Error serving file:", error);
      return c.json({ error: "File not found" }, 404);
    }
  })
  .get(
    "/:workspaceId",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("database");
      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      return c.json({ data: workspace });
    }
  )
  .get(
    "/:workspaceId/info",
    sessionMiddleware,
    async (c) => {
      const databases = c.get("database");
      const { workspaceId } = c.req.param();


      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      return c.json({ 
        data: {
          $id: workspace.$id,
          name: workspace.name,
          imageUrl: workspace.imageUrl,
        }
      });
    }
  )
  .get("/", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("database");

    const members = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("userId", user.$id)]
    );

    if (!members.documents.length) {
      return c.json({
        data: { documents: [], total: 0 },
      });
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [
        Query.orderDesc("$createdAt"),
        Query.contains("$id", workspaceIds),
      ],
    );

    return c.json({
      data: workspaces,
    });
  })
  // Endpoint to create a new workspace
  .post(
    "/",
    zValidator("form", createWorkspaceSchema), // Validate the form data
    sessionMiddleware, // Ensure user is authenticated
    async (c) => {
      const database = c.get("database");
      const storage = c.get("storage");
      const user = c.get("user");

      // Extract validated form data
      const { name, image } = c.req.valid("form");

      let uploadedImageUrl: string | undefined;

      // If user uploaded an image file
      if (image instanceof File) {
        // Upload the file to Appwrite storage bucket
        const file = await storage.createFile(
          IMAGE_BUCKET_ID,
          ID.unique(), // Generate unique file ID
          image
        );

        // Create a URL that points to our file serving endpoint
        // This URL will work because it goes through our authenticated API
        uploadedImageUrl = `/api/workspaces/file/${file.$id}`;
      }

      // Create the workspace document in the database
      const workspace = await database.createDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        ID.unique(), // Generate unique workspace ID
        {
          name,
          userId: user.$id,
          imageUrl: uploadedImageUrl, // Store the file URL or undefined if no image
          inviteCode: generateInviteCode(6),
        }
      );

      await database.createDocument(
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
          userId: user.$id,
          workspaceId: workspace.$id,
          role: MemberRole.ADMIN,
        }
      )

      // Return the created workspace data
      return c.json({
        data: workspace,
      });
    }
  )
  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("database");
      const storage = c.get("storage");
      const user = c.get("user");

      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      let uploadedImageUrl: string | undefined;

      // If user uploaded an image file
      if (image instanceof File) {
        // Upload the file to Appwrite storage bucket
        const file = await storage.createFile(
          IMAGE_BUCKET_ID,
          ID.unique(), // Generate unique file ID
          image
        );

        // Create a URL that points to our file serving endpoint
        // This URL will work because it goes through our authenticated API
        uploadedImageUrl = `/api/workspaces/file/${file.$id}`;
      } else {
        uploadedImageUrl = image;
      }

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          name,
          imageUrl: uploadedImageUrl,
        }
      )

      return c.json({
        data: workspace
      });
    }
  ).delete("/:workspaceId",
     sessionMiddleware, 
     async (c) => {
      // wanna change database to databases, but why? find it out
      const databases = c.get("database");
      const user = c.get("user");

      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // TODO: delete members, projects, tasks, etc.

      await databases.deleteDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId
      );

      return c.json({ data: { $id: workspaceId } });  
     }
  ).post("/:workspaceId/reset-invite-code",
     sessionMiddleware, 
     async (c) => {
      // wanna change database to databases, but why? find it out
      const databases = c.get("database");
      const user = c.get("user");

      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const workspace =await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          inviteCode: generateInviteCode(6),
        },
      )

      return c.json({ data: workspace });  
     }
  )
  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", z.object({ code: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid("json");

      const databases = c.get("database");
      const user = c.get("user");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (member) {
        return c.json({ error: "Already a member" }, 400);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId
      );

      if ( workspace.inviteCode !== code ) {
        return c.json({ error: "Invalid invite code"}, 400)
      }

      await databases.createDocument(
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
          workspaceId,
          userId: user.$id,
          role: MemberRole.MEMBER,
        },

      );

      return c.json({ data: workspace });
    }
  );

export default app;
