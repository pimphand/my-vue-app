<script lang="ts" setup>
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ref, watch } from "vue";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectGroup {
  label: string;
  options: SelectOption[];
}

const props = defineProps<{
  modelValue: any;
  groups: SelectGroup[];
  placeholder?: string;
  searchable?: boolean;
  searchQueryParam?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "search", value: string, param: string): void;
}>();

const searchQuery = ref("");

watch(searchQuery, (value) => {
  emit("search", value, props.searchQueryParam || "search");
});
</script>

<template>
  <Select
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
  >
    <SelectTrigger class="w-full">
      <SelectValue :placeholder="placeholder || 'Select an option'" />
    </SelectTrigger>
    <SelectContent>
      <div v-if="searchable" class="px-2 pb-2">
        <Input
          v-model="searchQuery"
          :placeholder="`Search by ${searchQueryParam || 'search'}...`"
          class="h-8"
        />
      </div>
      <SelectGroup v-for="group in groups" :key="group.label">
        <SelectLabel>{{ group.label }}</SelectLabel>
        <SelectItem
          v-for="option in group.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
