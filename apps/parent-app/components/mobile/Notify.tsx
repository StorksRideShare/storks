import React from "react";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";

type ToastAction = "success" | "error" | "warning" | "info" | "muted";

type NotifyProps = {
  action?: ToastAction;
  title: string;
  description?: string;
};

export const Notify = ({ action = "muted", title, description }: NotifyProps) => {
  return (
    <Toast action={action} variant="solid">
      <ToastTitle className="text-white font-bold">{title}</ToastTitle>
      {description && <ToastDescription className="text-white">{description}</ToastDescription>}
    </Toast>
  );
};

export const useNotify = () => {
  const toast = useToast();

  const showNotify = ({ action = "muted", title, description }: NotifyProps) => {
    toast.show({
      placement: "top",
      render: ({ id }) => (
        <Notify key={id} action={action} title={title} description={description} />
      ),
    });
  };

  return {
    success: (title: string, description?: string) => showNotify({ action: "success", title, description }),
    error: (title: string, description?: string) => showNotify({ action: "error", title, description }),
    warning: (title: string, description?: string) => showNotify({ action: "warning", title, description }),
    info: (title: string, description?: string) => showNotify({ action: "info", title, description }),
    show: showNotify,
  };
};
