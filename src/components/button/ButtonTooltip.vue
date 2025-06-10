<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-vue-next";

const props = defineProps<{
  name: string;
  description: string;
  icon: LucideIcon;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          :variant="variant ?? 'outline'"
          class="mr-1 cursor-pointer"
          @click="emit('click')"
        >
          <component
            :is="icon"
            v-if="icon"
            :class="name ?? 'mr-2'"
            class="h-4 w-4"
          />
          {{ name }}
        </Button>
      </TooltipTrigger>
      <TooltipContent v-if="description">
        <p>{{ description }}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
