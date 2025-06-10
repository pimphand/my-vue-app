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

<style scoped>
.dialog-content {
  max-height: 80vh;
  overflow-y: auto;
  width: 100%;
  border-radius: 0.5rem;
  background-color: var(--background);
  box-shadow: var(--shadow);
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}
.dialog-header {
  padding: 1.5rem;
  padding-bottom: 0;
}
</style>

<template>
  <Dialog :open="open" @update:open="(value) => emit('update:open', value)">
    <DialogContent class="max-w-fit">
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
