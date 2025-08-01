import z from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { getMember } from "@/features/members/utils";

import { DATABASE_ID, IMAGE_BUCKET_ID, PROJECTS_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import { Project } from "../types";

const app = new Hono()
    .post(
        "/",
        sessionMiddleware,
        zValidator("form", createProjectSchema),
        async (c) => {
            const databases = c.get("database");
            const storage = c.get("storage");
            const user = c.get("user");
      
            // Extract validated form data
            const { name, image, workspaceId } = c.req.valid("form");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unathorized"}, 401);
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
            }
      
            // Create the project document in the database
            const project = await databases.createDocument(
              DATABASE_ID,
              PROJECTS_ID,
              ID.unique(), // Generate unique workspace ID
              {
                name,
                imageUrl: uploadedImageUrl, // Store the file URL or undefined if no image
                workspaceId
              }
            );
      
            // Return the created project data
            return c.json({
              data: project,
            });
          }
    )
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("database");

            const { workspaceId } = c.req.valid("query");

            if (!workspaceId) {
                return c.json({
                    error: "Missing workspace ID",
                }, 400);
            }

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({
                    error: "Unauthorized",
                }, 401);
            }

            const projects = await databases.listDocuments(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt"),
                ]
            );


            return c.json({ data: projects });
        }
    )
    .patch(
    "/:projectId",
    sessionMiddleware,
    zValidator("form", updateProjectSchema),
    async (c) => {
      const databases = c.get("database");
      const storage = c.get("storage");
      const user = c.get("user");

      const { projectId } = c.req.param();
      const { name, image } = c.req.valid("form");

      const existingProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
      );

      const member = await getMember({
        databases,
        workspaceId: existingProject.workspaceId,
        userId: user.$id,
      });

      if (!member) {
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

      const project = await databases.updateDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          name,
          imageUrl: uploadedImageUrl,
        }
      )

      return c.json({
        data: project
      });
    }
  ).delete("/:projectId",
    sessionMiddleware, 
    async (c) => {
     // wanna change database to databases, but why? find it out
     const databases = c.get("database");
     const user = c.get("user");

     const { projectId } = c.req.param();

     const existingProject = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId,
    );

     const member = await getMember({
       databases,
       workspaceId: existingProject.workspaceId,
       userId: user.$id,
     });

     if (!member) {
       return c.json({ error: "Unauthorized" }, 401);
     }

     // TODO: delete tasks, etc.

     await databases.deleteDocument(
       DATABASE_ID,
       PROJECTS_ID,
       projectId
     );

     return c.json({ data: { $id: existingProject.$id } });  
    }
 )
  


export default app;