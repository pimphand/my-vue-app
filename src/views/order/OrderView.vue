<script setup lang="ts">
import { ref, onMounted } from "vue";
import { toast } from "vue-sonner";
import { useRouter } from "vue-router";
import AppSidebar from "@/components/AppSidebar.vue";
import { useFetch } from "@/stores/fetch";
import type { Order, PaginatedResponse } from "@/types/order";
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

import { Eye } from "lucide-vue-next";
import ButtonTooltip from "@/components/button/ButtonTooltip.vue";
import CardTable from "@/components/CardTable.vue";

const columns = [
  { key: "index", label: "#", width: "100px" } as const,
  { key: "customer", label: "Customer", searchable: true } as const,
  { key: "sales", label: "Sales", searchable: true } as const,
  { key: "items", label: "Items" } as const,
  { key: "total", label: "Total" } as const,
  { key: "status", label: "Status" } as const,
  { key: "actions", label: "Aksi", align: "right" } as const,
];

const searchFields = [
  {
    key: "filter[customer.name]",
    label: "Customer",
    placeholder: "Cari customer...",
  },
  {
    key: "filter[sales.name]",
    label: "Sales",
    placeholder: "Cari sales...",
  },
];

const router = useRouter();
const OrderData = ref<Order[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const totalItems = ref(0);
const to = ref(1);
const searchQueries = ref<Record<string, string>>({});
const { get } = useFetch();

const viewOrderDetail = (order: Order) => {
  router.push(`/orders/${order.id}`);
};
async function fetchOrders() {
  try {
    loading.value = true;
    const queryParams = new URLSearchParams({
      page: currentPage.value.toString(),
      ...searchQueries.value,
    });

    const response = await get<PaginatedResponse>(
      `/admin/orders?${queryParams.toString()}`
    );
    OrderData.value = response.data;
    totalItems.value = response.meta.total;
    to.value = response.meta.from;
  } catch (error) {
    toast.error("Gagal mengambil data Order!");
    console.error("Error fetching Orders:", error);
  } finally {
    loading.value = false;
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchOrders();
};

const handleSearch = (queries: Record<string, string>) => {
  searchQueries.value = queries;
  currentPage.value = 1;
  fetchOrders();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

onMounted(() => {
  fetchOrders();
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
                <BreadcrumbPage>Order</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <CardTable
          title="List Order"
          :columns="columns"
          :data="OrderData"
          :loading="loading"
          :current-page="currentPage"
          :total-items="totalItems"
          :items-per-page="10"
          :search-fields="searchFields"
          @update:current-page="handlePageChange"
          @search="handleSearch"
        >
          <template #index="{ index }">
            {{ to + index }}
          </template>

          <template #customer="{ item }">
            <div class="flex flex-col">
              <span class="font-medium">{{ item.customer.store_name }}</span>
              <span class="text-sm text-gray-500">{{
                item.customer.name
              }}</span>
            </div>
          </template>

          <template #sales="{ item }">
            {{ item.sales.name }}
          </template>

          <template #items="{ item }"> {{ item.quantity }} items </template>

          <template #total="{ item }">
            {{ formatCurrency(item.total_price) }}
          </template>

          <template #status="{ item }">
            <Badge
              :variant="item.status === 'completed' ? 'default' : 'secondary'"
              :class="{
                'bg-green-500 hover:bg-green-600': item.status === 'completed',
                'bg-yellow-500 hover:bg-yellow-600': item.status === 'process',
              }"
            >
              {{ item.status }}
            </Badge>
          </template>

          <template #actions="{ item }">
            <div class="flex justify-end items-center gap-2">
              <ButtonTooltip
                name=""
                @click="viewOrderDetail(item)"
                description="Detail Items"
                :icon="Eye"
                :variant="'outline'"
              />
            </div>
          </template>
        </CardTable>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
