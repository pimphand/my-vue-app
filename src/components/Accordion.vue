<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  items: Array<{
    value: string;
    trigger: string;
    content?: string;
  }>;
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "single",
  collapsible: true,
  defaultValue: undefined,
});
</script>

<template>
  <Accordion
    :type="type"
    :collapsible="collapsible"
    :default-value="defaultValue"
  >
    <AccordionItem v-for="item in items" :key="item.value" :value="item.value">
      <AccordionTrigger>{{ item.trigger }}</AccordionTrigger>
      <AccordionContent>
        <slot :name="item.value">
          {{ item.content }}
        </slot>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>
