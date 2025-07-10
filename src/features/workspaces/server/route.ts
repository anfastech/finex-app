import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";

import { createWorkspaceSchema } from "../schemas";
import { DATABASE_ID, IMAGE_BUCKET_ID, MEMBERS_ID, WORKSPACE_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";

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
      WORKSPACE_ID,
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
        WORKSPACE_ID,
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
  );

export default app;
