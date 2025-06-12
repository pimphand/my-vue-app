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

import { FolderKanban, PencilIcon, Trash2, Eye } from "lucide-vue-next";
import ButtonTooltip from "@/components/button/ButtonTooltip.vue";
import CardTable from "@/components/CardTable.vue";
import { Badge } from "@/components/ui/badge";
import Accordion from "@/components/Accordion.vue";
import Modal from "@/components/Modal.vue";

interface OrderItem {
  id: string;
  brand: string;
  name: string;
  quantity: number;
  total: number;
  price: number;
  returns: number;
}

interface Payment {
  id: string;
  method: string;
  date: string;
  amount: string;
  remaining: string;
  customer: string;
  collector: string;
  admin: string;
}

interface Order {
  id: number;
  sales: {
    id: number;
    name: string;
    email: string;
    role: {
      name: string;
      display_name: string;
    };
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    address: string;
    store_name: string;
    store_address: string | null;
    city: string;
    state: string;
    store_photo: string;
    owner_photo: string;
  };
  shipper: {
    id: number;
    name: string;
    email: string;
    role: {
      name: string;
      display_name: string;
    };
  };
  collector: {
    id: number;
    name: string;
    email: string;
    role: {
      name: string;
      display_name: string;
    };
  };
  items: OrderItem[];
  payments: Payment[];
  quantity: number;
  total_price: number;
  status: string;
  paid: number;
  remaining: number;
  shipped_at: string | null;
  note: string | null;
  file: string | null;
  bukti_pengiriman: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse {
  data: Order[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

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
const { get, del } = useFetch();

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
