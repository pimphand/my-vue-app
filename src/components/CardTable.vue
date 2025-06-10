<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Column {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  searchable?: boolean;
}

interface SearchField {
  key: string;
  label: string;
  placeholder?: string;
}

interface Props {
  title?: string;
  description?: string;
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  itemsPerPage?: number;
  searchFields?: SearchField[];
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (queries: Record<string, string>) => void;
}

interface SlotProps {
  item: any;
  index: number;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  description: "",
  loading: false,
  emptyMessage: "Tidak ada data",
  itemsPerPage: 10,
  totalItems: 0,
  currentPage: 1,
  searchFields: () => [],
});

const emit = defineEmits<{
  (e: "update:currentPage", page: number): void;
  (e: "search", queries: Record<string, string>): void;
}>();

const searchQueries = ref<Record<string, string>>({});

// Initialize search queries for each field
watch(
  () => props.searchFields,
  (fields) => {
    fields.forEach((field) => {
      if (!(field.key in searchQueries.value)) {
        searchQueries.value[field.key] = "";
      }
    });
  },
  { immediate: true }
);

const handleSearch = (key: string, value: string) => {
  searchQueries.value[key] = value;
  emit("search", searchQueries.value);
};

const currentPage = ref(props.currentPage);

// Watch for external page changes
watch(
  () => props.currentPage,
  (newPage) => {
    currentPage.value = newPage;
  }
);

// Pagination
const totalPages = computed(() =>
  Math.ceil(props.totalItems / props.itemsPerPage)
);

const handlePageChange = (page: number) => {
  currentPage.value = page;
  emit("update:currentPage", page);
  props.onPageChange?.(page);
};

// Generate page numbers for pagination
const pageNumbers = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage.value <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push(-1); // Ellipsis
      pages.push(totalPages.value);
    } else if (currentPage.value >= totalPages.value - 2) {
      pages.push(1);
      pages.push(-1); // Ellipsis
      for (let i = totalPages.value - 3; i <= totalPages.value; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push(-1); // Ellipsis
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
        pages.push(i);
      }
      pages.push(-1); // Ellipsis
      pages.push(totalPages.value);
    }
  }

  return pages;
});
</script>

<template>
  <Card class="px-4 gap-4">
    <CardHeader v-if="title || description">
      <div class="flex justify-between items-center">
        <div>
          <CardTitle>{{ title }}</CardTitle>
          <CardDescription>{{ description }}</CardDescription>
        </div>
        <div v-if="searchFields.length > 0" class="flex gap-2">
          <div v-for="field in searchFields" :key="field.key" class="w-48">
            <Input
              type="search"
              :placeholder="field.placeholder || `Cari ${field.label}...`"
              :value="searchQueries[field.key]"
              @input="(e: Event) => handleSearch(field.key, (e.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div class="relative overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs uppercase bg-muted/50">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                :class="[
                  'px-6 py-3',
                  column.width ? `w-[${column.width}]` : '',
                  column.align ? `text-${column.align}` : 'text-left',
                ]"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="bg-background border-b">
              <td :colspan="columns.length" class="px-6 py-4 text-center">
                Loading...
              </td>
            </tr>
            <template v-else>
              <tr v-if="data.length === 0" class="bg-background border-b">
                <td :colspan="columns.length" class="px-6 py-4 text-center">
                  {{ emptyMessage }}
                </td>
              </tr>
              <tr
                v-for="(item, index) in data"
                :key="index"
                class="bg-background border-b hover:bg-muted/50"
              >
                <td
                  v-for="column in columns"
                  :key="column.key"
                  :class="[
                    'px-6 py-4',
                    column.align ? `text-${column.align}` : 'text-left',
                  ]"
                >
                  <slot :name="column.key" :item="item" :index="index">
                    {{ item[column.key] }}
                  </slot>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="mt-4 flex justify-center items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          :disabled="currentPage === 1"
          @click="handlePageChange(currentPage - 1)"
        >
          <span class="sr-only">Previous</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>

        <div class="flex items-center gap-1">
          <template v-for="page in pageNumbers" :key="page">
            <span v-if="page === -1" class="px-2">...</span>
            <Button
              v-else
              variant="outline"
              size="sm"
              :class="{
                'bg-primary text-primary-foreground': currentPage === page,
              }"
              @click="handlePageChange(page)"
            >
              {{ page }}
            </Button>
          </template>
        </div>

        <Button
          variant="outline"
          size="icon"
          :disabled="currentPage >= totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          <span class="sr-only">Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
