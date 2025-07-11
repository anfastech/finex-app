import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

import { ResponsiveModal } from "@/components/responsive-modal";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export const useConfirm = (
  title: string,
  message: string,
  variant: ButtonProps["variant"] = "primary"
): [() => JSX.Element, () => Promise<unknown>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };
  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDailog = () => (
    <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="pt-8">
          <CardHeader className="p-0">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
            <Button
              className="w-full lg:w-fit"
              variant="outline"
              size="sm"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className="w-full lg:w-fit"
              variant={variant}
              size="sm"
              type="button"
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );

  return [ ConfirmationDailog, confirm ];
};

export default useConfirm;