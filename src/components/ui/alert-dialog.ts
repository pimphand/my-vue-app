import { defineComponent, h } from "vue";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";

type ButtonVariant = "default" | "link" | "destructive" | "outline" | "secondary" | "ghost";

const AlertDialog = defineComponent({
  name: "AlertDialog",
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    confirmText: {
      type: String,
      default: "Ya",
    },
    cancelText: {
      type: String,
      default: "Batal",
    },
    variant: {
      type: String as () => ButtonVariant,
      default: "default",
    },
  },
  emits: ["update:open", "confirm", "cancel"],
  setup(props, { emit }) {
    return () =>
      h(
        Dialog,
        {
          open: props.open,
          "onUpdate:open": (value: boolean) => emit("update:open", value),
        },
        {
          default: () =>
            h(DialogContent, null, {
              default: () => [
                h(DialogHeader, null, {
                  default: () => [
                    h(DialogTitle, null, { default: () => props.title }),
                    h(DialogDescription, null, {
                      default: () => props.description,
                    }),
                  ],
                }),
                h(DialogFooter, { class: "gap-2" }, {
                  default: () => [
                    h(
                      Button,
                      {
                        variant: "outline",
                        onClick: () => emit("cancel"),
                      },
                      { default: () => props.cancelText }
                    ),
                    h(
                      Button,
                      {
                        variant: props.variant,
                        onClick: () => emit("confirm"),
                      },
                      { default: () => props.confirmText }
                    ),
                  ],
                }),
              ],
            }),
        }
      );
  },
});

export { AlertDialog }; 