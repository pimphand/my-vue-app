<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { toast } from "vue-sonner";
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
import { CircleX, Pen, PenBox, SaveIcon } from "lucide-vue-next";
import ButtonTooltip from "@/components/button/ButtonTooltip.vue";
import Select from "@/components/Select.vue";
import Input from "@/components/ui/input/Input.vue";

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
const product = ref<Product | null>(null);
const loading = ref(true);
const { get, post } = useFetch();
const editingSkuId = ref<string | null>(null);
const editedSku = ref<{
  name: string;
  code: string;
  price: number | null;
  stock: number | null;
} | null>(null);

// Add new product form state
const newProduct = ref({
  name: "",
  category_id: "",
  brand_id: "",
  description: "",
  is_publish: 1,
  skus: [] as Array<{
    name: string;
    code: string;
    price: string;
    stock: string;
    is_publish: number;
    file: File | null;
    preview: string | null;
  }>,
});

const categories = ref<Array<{ id: string; name: string }>>([]);
const brands = ref<Array<{ id: string; name: string }>>([]);
const isCreating = ref(false);
const searchQuery = ref({
  category: "",
  brand: "",
});

async function fetchCategories(query = "") {
  try {
    const response = await get<Array<{ id: string; name: string }>>(
      `/admin/categories${query ? `?filter[name]=${query}` : ""}`
    );
    categories.value = response.data;
  } catch (error) {
    toast.error("Failed to fetch categories!");
    console.error("Error fetching categories:", error);
  }
}

async function fetchBrands(query = "") {
  try {
    const response = await get<Array<{ id: string; name: string }>>(
      `/admin/brands${query ? `?filter[name]=${query}` : ""}`
    );
    brands.value = response.data;
  } catch (error) {
    toast.error("Failed to fetch brands!");
    console.error("Error fetching brands:", error);
  }
}

function handleCategorySearch(value: string, param: string) {
  searchQuery.value.category = value;
  fetchCategories(value);
}

function handleBrandSearch(value: string, param: string) {
  searchQuery.value.brand = value;
  fetchBrands(value);
}

// Add function to add new SKU
function addNewSku() {
  newProduct.value.skus.push({
    name: "",
    code: "",
    price: "",
    stock: "",
    is_publish: 1,
    file: null,
    preview: null,
  });
}

// Add function to handle file upload
function handleFileUpload(event: Event, skuIndex: number) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (newProduct.value.skus[skuIndex]) {
        newProduct.value.skus[skuIndex].file = file;
        newProduct.value.skus[skuIndex].preview = e.target?.result as string;
      }
    };

    reader.readAsDataURL(file);
  }
}

// Add function to remove image
function removeImage(skuIndex: number) {
  if (newProduct.value.skus[skuIndex]) {
    newProduct.value.skus[skuIndex].file = null;
    newProduct.value.skus[skuIndex].preview = null;
  }
}

// Add function to remove SKU
function removeSku(index: number) {
  newProduct.value.skus.splice(index, 1);
}

async function createProduct() {
  try {
    isCreating.value = true;

    // Create FormData to handle file uploads
    const formData = new FormData();
    formData.append("name", newProduct.value.name);
    formData.append("category_id", newProduct.value.category_id);
    formData.append("brand_id", newProduct.value.brand_id);
    formData.append("description", newProduct.value.description);
    formData.append("is_publish", newProduct.value.is_publish.toString());

    // Add SKUs data
    newProduct.value.skus.forEach((sku, index) => {
      formData.append(`skus[${index}][name]`, sku.name);
      formData.append(`skus[${index}][code]`, sku.code);
      formData.append(`skus[${index}][price]`, sku.price ? sku.price : "0");
      formData.append(`skus[${index}][stock]`, sku.stock ? sku.stock : "0");
      formData.append(`skus[${index}][is_publish]`, sku.is_publish.toString());
      if (sku.file) {
        formData.append(`skus[${index}][file]`, sku.file);
      }
    });

    const response = await post<Product>("/admin/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    product.value = response.data;
    toast.success("Product created successfully!");
  } catch (error) {
    toast.error("Failed to create product!");
    console.error("Error creating product:", error);
  } finally {
    isCreating.value = false;
  }
}

async function fetchProductDetail() {
  try {
    loading.value = true;
    if (route.params.id === "new") {
      product.value = null;
      await Promise.all([fetchCategories(), fetchBrands()]);
    } else {
      const response = await get<Product>(`/admin/products/${route.params.id}`);
      product.value = response.data;
    }
  } catch (error) {
    toast.error("Gagal mengambil detail Product!");
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
                <BreadcrumbLink href="#"> Dashboard </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href="/products"> Product </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{{
                  route.params.id === "new" ? "Create" : "Detail"
                }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <div v-if="loading" class="flex justify-center items-center h-64">
          Loading...
        </div>
        <div
          v-else-if="!product && route.params.id === 'new'"
          class="space-y-6"
        >
          <div class="bg-white rounded-lg shadow p-6">
            <h1 class="text-2xl font-bold mb-4">Create New Product</h1>
            <form @submit.prevent="createProduct" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Brand</label
                  >
                  <Select
                    v-model="newProduct.brand_id"
                    :groups="[
                      {
                        label: 'Brands',
                        options: brands.map((brand) => ({
                          value: brand.id,
                          label: brand.name,
                        })),
                      },
                    ]"
                    placeholder="Pilih brand"
                    :searchable="true"
                    searchQueryParam="name"
                    @search="handleBrandSearch"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Category</label
                  >
                  <Select
                    v-model="newProduct.category_id"
                    :groups="[
                      {
                        label: 'Categories',
                        options: categories.map((category) => ({
                          value: category.id,
                          label: category.name,
                        })),
                      },
                    ]"
                    placeholder="Pilih kategori"
                    :searchable="true"
                    searchQueryParam="name"
                    @search="handleCategorySearch"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Description</label
                >
                <textarea
                  v-model="newProduct.description"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Status</label
                >
                <Select
                  v-model="newProduct.is_publish"
                  :groups="[
                    {
                      label: 'Status',
                      options: [
                        { value: '1', label: 'Published' },
                        { value: '0', label: 'Draft' },
                      ],
                    },
                  ]"
                  placeholder="Pilih status"
                />
              </div>

              <!-- Add SKUs Section -->
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-medium text-gray-900">SKUs</h3>
                  <button
                    type="button"
                    @click="addNewSku"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add SKU
                  </button>
                </div>

                <div
                  v-for="(sku, index) in newProduct.skus"
                  :key="index"
                  class="p-4 border rounded-lg space-y-4"
                >
                  <div class="flex justify-between items-center">
                    <h4 class="text-sm font-medium text-gray-700">
                      SKU #{{ index + 1 }}
                    </h4>
                    <button
                      type="button"
                      @click="removeImage(index)"
                      class="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700"
                        >Name</label
                      >
                      <Input
                        v-model="sku.name"
                        placeholder="Enter SKU name"
                        type="text"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700"
                        >Code</label
                      >
                      <Input
                        v-model="sku.code"
                        placeholder="Enter SKU code"
                        type="text"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700"
                        >Price</label
                      >
                      <Input
                        v-model="sku.price"
                        placeholder="Enter price"
                        type="number"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700"
                        >Stock</label
                      >
                      <Input
                        v-model="sku.stock"
                        placeholder="Enter stock"
                        type="number"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700"
                        >Status</label
                      >
                      <Select
                        v-model="sku.is_publish"
                        :groups="[
                          {
                            label: 'Status',
                            options: [
                              { value: '1', label: 'Published' },
                              { value: '0', label: 'Draft' },
                            ],
                          },
                        ]"
                        placeholder="Select status"
                      />
                    </div>
                    <div class="col-span-2">
                      <label class="block text-sm font-medium text-gray-700"
                        >Image</label
                      >
                      <div class="mt-1 flex items-center space-x-4">
                        <div v-if="sku.preview" class="relative">
                          <img
                            :src="sku.preview"
                            alt="SKU preview"
                            class="h-20 w-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            @click="removeImage(index)"
                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                        <div v-else class="flex items-center">
                          <label
                            class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <span>Upload Image</span>
                            <input
                              type="file"
                              class="hidden"
                              accept="image/*"
                              @change="(e) => handleFileUpload(e, index)"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="isCreating"
                  class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {{ isCreating ? "Creating..." : "Create Product" }}
                </button>
              </div>
            </form>
          </div>
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
                          description="Simpan Sku"
                          :icon="SaveIcon"
                          :variant="'outline'"
                        />
                        <ButtonTooltip
                          style="margin-right: 2px"
                          name=""
                          @click="cancelEditing"
                          description="Batal Edit Sku"
                          :icon="CircleX"
                          :variant="'destructive'"
                        />
                      </template>
                      <template v-else>
                        <ButtonTooltip
                          style="margin-right: 2px"
                          name=""
                          @click="startEditing(sku)"
                          description="Edit Sku"
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
