"use client";

import { useQueryState } from "nuqs";
import { Loader, PlusIcon } from "lucide-react";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DataFilters } from "./data-filters";

import { useGetTasks } from "../api/use-get-tasks";
import { useCreateTaskModel } from "../hooks/use-create-task-modal";

export const TaskViewSwitcher = () => {
    const [view, setView] = useQueryState("task-view", {
        defaultValue: "table",
    });

    const workspaceId = useWorkspaceId();
    const { open } = useCreateTaskModel();

    const {
      data: tasks,
      isLoading: isLoadingTasks 
    } = useGetTasks({workspaceId});

    return (
        <Tabs
            className="flex-1 w-full border rounded-lg"
            defaultValue={view}
            onValueChange={setView}
        >
            <div className="h-full flex flex-col overflow-auto p-4">
                <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
                    <TabsList className="w-full lg:w-auto">
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="table"
                        >
                            Table
                        </TabsTrigger>
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="kanban"
                        >
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="calendar"
                        >
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                    <Button
                        onClick={open}
                        size="sm"
                        className="w-full lg:w-auto"
                    >
                        <PlusIcon className="size-4 mr-2" />
                        New
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                    <DataFilters />
                <DottedSeparator className="my-4" />
                {isLoadingTasks ? (
                    <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
                        <Loader className="size-5 animate-spin text-muted-foreground" />
                    </div>
                ): (
                <>
                    <TabsContent value="table" className="mt-0">
                        {JSON.stringify(tasks)}
                    </TabsContent>
                    <TabsContent value="kanban" className="mt-0">
                        {JSON.stringify(tasks)}
                    </TabsContent>
                    <TabsContent value="calendar" className="mt-0">
                        {JSON.stringify(tasks)}
                    </TabsContent>
                </>
                ) }
            </div>
        </Tabs>
    )
}