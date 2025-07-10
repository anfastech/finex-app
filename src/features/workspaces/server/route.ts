import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";

import { createWorkspaceSchema } from "../schemas";
import { DATABASE_ID, IMAGE_BUCKET_ID, WORKSPACE_ID } from "@/config";
import { ID } from "node-appwrite";

const app = new Hono()
  .get("/file/:fileId", sessionMiddleware, async (c) => {
    const storage = c.get("storage");
    const fileId = c.req.param("fileId");
    
    try {
      const file = await storage.getFile(IMAGE_BUCKET_ID, fileId);
      const arrayBuffer = await storage.getFileView(IMAGE_BUCKET_ID, fileId);
      
      // Sanitize the filename for the Content-Disposition header
      const safeFilename = file.name.replace(/[^\w\s.-]/g, '_');
      
      // Return the file as a response with proper headers
      return new Response(arrayBuffer, {
        headers: {
          'Content-Type': file.mimeType,
          'Content-Disposition': `inline; filename="${safeFilename}"`,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } catch (error) {
      console.error("Error serving file:", error);
      return c.json({ error: "File not found" }, 404);
    }
  })
  .get("/", sessionMiddleware, async (c) => {
  const database = c.get("database");
  const user = c.get("user");
  
  try {
    const workspaces = await database.listDocuments(
      DATABASE_ID,
      WORKSPACE_ID,
    );
    
    return c.json({
      data: workspaces.documents,
      user: user.$id
    });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return c.json({ 
      error: "Failed to fetch workspaces",
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
})
.post(
  "/",
  zValidator("form", createWorkspaceSchema),
  sessionMiddleware,
  async (c) => {
    const database = c.get("database");
    const storage = c.get("storage");
    const user = c.get("user");

    const { name, image } = c.req.valid("form");

    let uploadedImageUrl: string | undefined;

    if (image instanceof File) {
      const file = await storage.createFile(
        IMAGE_BUCKET_ID,
        ID.unique(),
        image,
      );

      // Create a URL that uses our authenticated file serving endpoint
      uploadedImageUrl = `/api/workspaces/file/${file.$id}`;
    }

    const workspace = await database.createDocument(
      DATABASE_ID,
      WORKSPACE_ID,
      ID.unique(),
      {
        name,
        userId: user.$id,
        imageUrl: uploadedImageUrl,
      }
    );

    return c.json({
      data: workspace,
    });
  }
);

export default app;
