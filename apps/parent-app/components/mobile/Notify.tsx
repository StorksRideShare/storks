import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";

type ToastType = {
  type: "success" | "faliure" | "default";
  title: string;
  description: string;
};

export default function Notify(props: ToastType) {
  if (props.type == "success") {
    return (
      <Toast action="error" variant="solid">
        <ToastTitle>{props.title}</ToastTitle>
        <ToastDescription>{props.description}</ToastDescription>
      </Toast>
    );
  }
  return (
    <Toast>
      <ToastTitle>{props.title}</ToastTitle>
      <ToastDescription>{props.description}</ToastDescription>
    </Toast>
  );
}
