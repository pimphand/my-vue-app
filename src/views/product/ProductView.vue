<script setup lang="ts">
import { ref, onMounted } from "vue";
import { toast } from "vue-sonner";
import { useRouter } from "vue-router";
import AppSidebar from "@/components/AppSidebar.vue";
import { useFetch } from "@/stores/fetch";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { FolderKanban, PencilIcon, Trash2 } from "lucide-vue-next";
import ButtonTooltip from "@/components/button/ButtonTooltip.vue";
import CardTable from "@/components/CardTable.vue";
import { Badge } from "@/components/ui/badge";
import Accordion from "@/components/Accordion.vue";

interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_publish: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  file: string | null;
  skus_count: number;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  };
  skus: Array<{
    id: string;
    product_id: string;
    name: string;
    code: string;
    price: number | null;
    weight: number | null;
    width: number | null;
    height: number | null;
    depth: number | null;
    stock: number | null;
    is_publish: number;
    packaging: string;
    application: string | null;
    description: string | null;
    performance: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    total_order: number;
  }>;
}

interface PaginatedResponse {
  data: Product[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

const columns = [
  { key: "index", label: "#", width: "100px" } as const,
  { key: "name", label: "Nama Produk", searchable: true } as const,
  { key: "category", label: "Kategori", searchable: true } as const,
  { key: "skus", label: "Jumlah SKU" } as const,
  { key: "status", label: "Status" } as const,
  { key: "actions", label: "Aksi", align: "right" } as const,
];

const searchFields = [
  {
    key: "filter[name]",
    label: "Nama Produk",
    placeholder: "Cari nama produk...",
  },
  {
    key: "filter[category.name]",
    label: "Kategori",
    placeholder: "Cari kategori...",
  },
];

const ProductData = ref<Product[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const totalItems = ref(0);
const to = ref(1);
const searchQueries = ref<Record<string, string>>({});
const { get, del } = useFetch();
const router = useRouter();

async function fetchProduct() {
  try {
    loading.value = true;
    const queryParams = new URLSearchParams({
      page: currentPage.value.toString(),
      ...searchQueries.value,
    });

    const response = await get<PaginatedResponse>(
      `/admin/products?${queryParams.toString()}`
    );
    ProductData.value = response.data as unknown as Product[];
    totalItems.value = (response as any).meta.total;
    to.value = (response as any).meta.from;
  } catch (error) {
    toast.error("Gagal mengambil data Product!");
    console.error("Error fetching Product:", error);
  } finally {
    loading.value = false;
  }
}

const handlePageChange = (page: number) => {
  console.log("Changing to page:", page);
  currentPage.value = page;
  fetchProduct();
};

const handleSearch = (queries: Record<string, string>) => {
  searchQueries.value = queries;
  currentPage.value = 1;
  fetchProduct();
};

async function deleteProduct(id: string) {
  try {
    await del(`/admin/products/${id}`);
    toast.success("Data Product berhasil dihapus");
    await fetchProduct(); // Refresh data after deletion
  } catch (error) {
    console.error("Error deleting Product:", error);
  }
}

const openProductDetails = (product: Product) => {
  router.push(`/products/${product.id}`);
};

onMounted(() => {
  fetchProduct();
});
</script>
<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="#"> Dashboard </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="flex justify-end">
          <button
            @click="router.push('/products/create')"
            class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Tambah Produk
          </button>
        </div>
        <CardTable
          title="List Product"
          :columns="columns"
          :data="ProductData"
          :loading="loading"
          :current-page="currentPage"
          :total-items="totalItems"
          :items-per-page="25"
          :search-fields="searchFields"
          @update:current-page="handlePageChange"
          @search="handleSearch"
        >
          <template #index="{ index }">
            {{ to + index }}
          </template>

          <template #name="{ item }">
            {{ item.name }}
          </template>

          <template #category="{ item }">
            {{ item.category.name }}
          </template>

          <template #skus="{ item }"> {{ item.skus_count }} SKU </template>

          <template #status="{ item }">
            <Badge
              :variant="item.is_publish ? 'default' : 'secondary'"
              :class="{
                'bg-green-500 hover:bg-green-600': item.is_publish === 1,
              }"
            >
              {{ item.is_publish ? "Published" : "Draft" }}
            </Badge>
          </template>

          <template #actions="{ item }">
            <div class="flex justify-start items-center gap-2">
              <ButtonTooltip
                style="margin-right: 2px"
                name=""
                @click="openProductDetails(item)"
                description="Detail Product"
                :icon="FolderKanban"
                :variant="'outline'"
              />
              <ButtonTooltip
                name=""
                description="delete Product"
                :icon="Trash2"
                variant="destructive"
                @click="deleteProduct(item.id)"
              />
            </div>
          </template>
        </CardTable>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
