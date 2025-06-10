<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  title?: string;
  description?: string;
  submitText?: string;
  showFooter?: boolean;
  open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Modal Title",
  description: "Modal description goes here.",
  submitText: "Save changes",
  showFooter: true,
  open: false,
});

const emit = defineEmits<{
  (e: "submit"): void;
  (e: "update:open", value: boolean): void;
}>();
</script>

<template>
  <Dialog :open="open" @update:open="(value) => emit('update:open', value)">
    <DialogContent
      class="sm:max-w-[425px] grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90dvh]"
    >
      <DialogHeader class="p-6 pb-0">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{ description }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4 overflow-y-auto px-6">
        <slot></slot>
      </div>
      <DialogFooter v-if="showFooter" class="p-6 pt-0">
        <Button class="cursor-pointer" type="submit" @click="emit('submit')">{{
          submitText
        }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
