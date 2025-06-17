<script setup lang="ts">
import { ref, onMounted } from "vue";
import { toast } from "vue-sonner";
import AppSidebar from "@/components/AppSidebar.vue";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useFetch } from "@/stores/fetch";

interface DashboardData {
  total_products: number;
  total_orders: number;
  total_amount: string;
  latest_orders: {
    id: number;
    customer_name: string;
    sales_name: string;
    status: string;
    created_at: string;
    total_amount: number;
  }[];
  top_sales: {
    id: number;
    name: string;
    total_revenue: string;
  }[];
}

const isLoading = ref(true);
const dashboardData = ref<DashboardData>({
  total_products: 0,
  total_orders: 0,
  total_amount: "0",
  latest_orders: [],
  top_sales: [],
});

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get status badge color
const getStatusColor = (status: string) => {
  const colors = {
    process: "bg-yellow-100 text-yellow-800",
    pending: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    isLoading.value = true;
    const response = await useFetch().get<DashboardData>("/admin/dashboard");
    console.log("Dashboard Response:", response); // Debug log
    dashboardData.value = {
      total_products: response.total_products,
      total_orders: response.total_orders,
      total_amount: response.total_amount,
      latest_orders: response.latest_orders,
      top_sales: response.top_sales,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    toast.error("Gagal memuat data dashboard");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <!-- Summary Cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader
              class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <CardTitle class="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">
                {{ isLoading ? "..." : dashboardData.total_products }} Produk
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <CardTitle class="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">
                {{ isLoading ? "..." : dashboardData.total_orders }} Order
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
              <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">
                {{
                  isLoading ? "..." : formatCurrency(dashboardData.total_amount)
                }}
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Latest Orders -->
        <div class="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Latest Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead class="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="isLoading">
                    <TableCell colspan="6" class="text-center py-4">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                  <TableRow
                    v-else-if="dashboardData.latest_orders.length === 0"
                  >
                    <TableCell colspan="6" class="text-center py-4">
                      Tidak ada data order
                    </TableCell>
                  </TableRow>
                  <TableRow
                    v-else
                    v-for="order in dashboardData.latest_orders"
                    :key="order.id"
                  >
                    <TableCell>#{{ order.id }}</TableCell>
                    <TableCell>{{ order.customer_name }}</TableCell>
                    <TableCell>{{ order.sales_name }}</TableCell>
                    <TableCell>
                      <span
                        :class="[
                          'px-2 py-1 rounded-full text-xs',
                          getStatusColor(order.status),
                        ]"
                      >
                        {{ order.status }}
                      </span>
                    </TableCell>
                    <TableCell>{{ formatDate(order.created_at) }}</TableCell>
                    <TableCell class="text-right">{{
                      formatCurrency(order.total_amount)
                    }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <!-- Top Sales -->
          <Card>
            <CardHeader>
              <CardTitle>Top Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sales Name</TableHead>
                    <TableHead class="text-right">Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="isLoading">
                    <TableCell colspan="2" class="text-center py-4">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                  <TableRow v-else-if="dashboardData.top_sales.length === 0">
                    <TableCell colspan="2" class="text-center py-4">
                      Tidak ada data sales
                    </TableCell>
                  </TableRow>
                  <TableRow
                    v-else
                    v-for="sales in dashboardData.top_sales"
                    :key="sales.id"
                  >
                    <TableCell>{{ sales.name }}</TableCell>
                    <TableCell class="text-right">{{
                      formatCurrency(sales.total_revenue)
                    }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
