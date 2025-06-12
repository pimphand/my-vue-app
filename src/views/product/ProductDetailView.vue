<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { toast } from "vue-sonner";
import AppSidebar from "@/components/AppSidebar.vue";
import { useFetch } from "@/stores/fetch";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-vue-next";
import {
  Breadcrumb,
  BreadcrumbItem,
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
import { CircleX, PenBox, SaveIcon } from "lucide-vue-next";
import ButtonTooltip from "@/components/button/ButtonTooltip.vue";

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

const route = useRoute();
const router = useRouter();
const product = ref<Product | null>(null);
const loading = ref(true);
const { get } = useFetch();
const editingSkuId = ref<string | null>(null);
const editedSku = ref<{
  name: string;
  code: string;
  price: number | null;
  stock: number | null;
} | null>(null);

const goBack = () => {
  router.back();
};

async function fetchProductDetail() {
  try {
    loading.value = true;
    const response = await get<Product>(`/admin/products/${route.params.id}`);
    product.value = response.data;
  } catch (error) {
    toast.error("Failed to fetch Product detail!");
    console.error("Error fetching Product detail:", error);
  } finally {
    loading.value = false;
  }
}

function startEditing(sku: Product["skus"][0]) {
  editingSkuId.value = sku.id;
  editedSku.value = {
    name: sku.name,
    code: sku.code,
    price: sku.price,
    stock: sku.stock,
  };
}

function cancelEditing() {
  editingSkuId.value = null;
  editedSku.value = null;
}

async function saveEditing(skuId: string) {
  try {
    // Here you would typically make an API call to update the SKU
    // For now, we'll just update the local state
    const skuIndex = product.value?.skus.findIndex((s) => s.id === skuId);
    if (skuIndex !== undefined && product.value && editedSku.value) {
      product.value.skus[skuIndex] = {
        ...product.value.skus[skuIndex],
        ...editedSku.value,
      };
    }
    editingSkuId.value = null;
    editedSku.value = null;
    toast.success("SKU updated successfully!");
  } catch (error) {
    toast.error("Failed to update SKU!");
    console.error("Error updating SKU:", error);
  }
}

onMounted(() => {
  fetchProductDetail();
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
                <router-link
                  to="/"
                  class="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Dashboard
                </router-link>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <router-link
                  to="/products"
                  class="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Product
                </router-link>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Detail</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="flex items-center gap-4 mb-4">
          <Button variant="outline" @click="goBack">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
        <div v-if="loading" class="flex justify-center items-center h-64">
          Loading...
        </div>

        <div v-else-if="product" class="space-y-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h1 class="text-2xl font-bold mb-4">{{ product.name }}</h1>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-gray-600">Category</p>
                <p class="font-medium">{{ product.category.name }}</p>
              </div>
              <div>
                <p class="text-gray-600">Status</p>
                <p class="font-medium">
                  {{ product.is_publish ? "Published" : "Draft" }}
                </p>
              </div>
              <div>
                <p class="text-gray-600">Description</p>
                <p class="font-medium">{{ product.description || "-" }}</p>
              </div>
              <div>
                <p class="text-gray-600">Total SKUs</p>
                <p class="font-medium">{{ product.skus_count }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-bold mb-4">SKUs</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Code
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total Orders
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="sku in product.skus" :key="sku.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <template v-if="editingSkuId === sku.id && editedSku">
                        <input
                          v-model="editedSku.name"
                          type="text"
                          class="w-full px-2 py-1 border rounded"
                        />
                      </template>
                      <template v-else>
                        {{ sku.name }}
                      </template>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <template v-if="editingSkuId === sku.id && editedSku">
                        <input
                          v-model="editedSku.code"
                          type="text"
                          class="w-full px-2 py-1 border rounded"
                        />
                      </template>
                      <template v-else>
                        {{ sku.code }}
                      </template>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <template v-if="editingSkuId === sku.id && editedSku">
                        <input
                          v-model="editedSku.price"
                          type="number"
                          class="w-full px-2 py-1 border rounded"
                        />
                      </template>
                      <template v-else>
                        {{ sku.price || "-" }}
                      </template>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <template v-if="editingSkuId === sku.id && editedSku">
                        <input
                          v-model="editedSku.stock"
                          type="number"
                          class="w-full px-2 py-1 border rounded"
                        />
                      </template>
                      <template v-else>
                        {{ sku.stock || "-" }}
                      </template>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ sku.total_order }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        :class="{
                          'text-green-600': sku.is_publish,
                          'text-gray-600': !sku.is_publish,
                        }"
                      >
                        {{ sku.is_publish ? "Published" : "Draft" }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <template v-if="editingSkuId === sku.id">
                        <ButtonTooltip
                          style="margin-right: 2px"
                          name=""
                          @click="saveEditing(sku.id)"
                          description="Save SKU"
                          :icon="SaveIcon"
                          :variant="'outline'"
                        />
                        <ButtonTooltip
                          style="margin-right: 2px"
                          name=""
                          @click="cancelEditing"
                          description="Cancel Edit"
                          :icon="CircleX"
                          :variant="'destructive'"
                        />
                      </template>
                      <template v-else>
                        <ButtonTooltip
                          style="margin-right: 2px"
                          name=""
                          @click="startEditing(sku)"
                          description="Edit SKU"
                          :icon="PenBox"
                          :variant="'outline'"
                        />
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
