<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Save, X } from "lucide-vue-next";
import Select from "@/components/Select.vue";

interface OrderItem {
  id: string;
  brand: string;
  name: string;
  quantity: number;
  total: number;
  price: number;
  returns: number;
  discount?: number;
  is_percentage?: boolean;
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

interface User {
  id: number;
  name: string;
  email: string;
  role: {
    name: string;
    display_name: string;
  };
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
  } | null;
  collector: {
    id: number;
    name: string;
    email: string;
    role: {
      name: string;
      display_name: string;
    };
  } | null;
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
  discount?: number;
  is_percentage?: boolean;
  type_discount?: boolean;
}

const route = useRoute();
const router = useRouter();
const { get, put } = useFetch();
const order = ref<Order | null>(null);
const loading = ref(true);
const isEditing = ref(false);
const salesUsers = ref<User[]>([]);
const driverUsers = ref<User[]>([]);
const collectorUsers = ref<User[]>([]);
const editedOrder = ref<{
  sales_id: number;
  shipper_id: number;
  collector_id: number;
  discount?: number;
  type_discount?: boolean;
  type?: string;
} | null>(null);

const editedItems = ref<{
  [key: string]: {
    quantity: number;
    price: number;
    discount: number;
    is_percentage: boolean;
    type_discount?: boolean;
  };
}>({});

const isEditingItems = ref(false);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

const goBack = () => {
  router.back();
};

async function fetchOrderDetail() {
  try {
    loading.value = true;
    const response = await get<{ data: Order }>(
      `/admin/orders/${route.params.id}`
    );
    console.log("Order Response:", response);
    order.value = response.data;
    console.log("Order Data:", order.value);
  } catch (error) {
    toast.error("Gagal mengambil detail Order!");
    console.error("Error fetching Order detail:", error);
  } finally {
    loading.value = false;
  }
}

async function fetchUsers() {
  try {
    const [salesResponse, driverResponse, collectorResponse] =
      await Promise.all([
        get<{ data: User[] }>("/admin/users?filter[roles.name]=sales"),
        get<{ data: User[] }>("/admin/users?filter[roles.name]=driver"),
        get<{ data: User[] }>("/admin/users?filter[roles.name]=debt-collector"),
      ]);

    salesUsers.value = salesResponse.data;
    driverUsers.value = driverResponse.data;
    collectorUsers.value = collectorResponse.data;

    console.log("Sales Users:", salesUsers.value);
    console.log("Driver Users:", driverUsers.value);
    console.log("Collector Users:", collectorUsers.value);
  } catch (error) {
    toast.error("Gagal mengambil data pengguna!");
    console.error("Error fetching users:", error);
  }
}

function startEditing() {
  if (order.value) {
    console.log("Starting edit with order:", order.value);
    editedOrder.value = {
      sales_id: order.value.sales.id,
      shipper_id: order.value.shipper?.id ?? 0,
      collector_id: order.value.collector?.id ?? 0,
      discount: order.value.discount,
      type_discount: order.value.type_discount,
      type: "edit-customer",
    };
    console.log("Edited order set to:", editedOrder.value);
    isEditing.value = true;
  }
}

function cancelEditing() {
  isEditing.value = false;
  editedOrder.value = null;
}

async function saveEditing() {
  if (!editedOrder.value || !order.value) return;

  try {
    const response = await put(
      `/admin/orders/${order.value.id}`,
      editedOrder.value
    );
    order.value = response.data;
    isEditing.value = false;
    editedOrder.value = null;
    toast.success("Order berhasil diperbarui!");
  } catch (error) {
    toast.error("Gagal memperbarui order!");
    console.error("Error updating order:", error);
  }
}

function startEditingAllItems() {
  if (!order.value) return;

  const newEditedItems: { [key: string]: any } = {};
  order.value.items.forEach((item) => {
    console.log("Processing item:", item);
    newEditedItems[item.id] = {
      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
      is_percentage: item.is_percentage || false,
    };
  });

  // Initialize editedOrder with current order's discount values
  editedOrder.value = {
    sales_id: order.value.sales.id,
    shipper_id: order.value.shipper?.id ?? 0,
    collector_id: order.value.collector?.id ?? 0,
  };

  editedItems.value = newEditedItems;
  isEditingItems.value = true;
}

function cancelEditingAllItems() {
  console.log("Canceling edit mode");
  editedItems.value = {};
  editedOrder.value = null;
  isEditingItems.value = false;
}

async function saveAllItemChanges() {
  if (!order.value) return;

  try {
    // Save all item changes
    const updates = Object.entries(editedItems.value).map(
      ([itemId, editedItem]) => {
        return put(`/admin/orders/items/${itemId}`, {
          quantity: editedItem.quantity,
          price: editedItem.price,
          discount: editedItem.discount,
          is_percentage: editedItem.is_percentage,
        });
      }
    );

    // Save order-level discount if it exists
    if (editedOrder.value) {
      updates.push(
        put(`/admin/orders/${order.value.id}`, {
          discount: editedOrder.value.discount,
          type_discount: editedOrder.value.type_discount,
          type: "update-discount",
        })
      );
    }

    await Promise.all(updates);

    // Fetch fresh data after saving
    await fetchOrderDetail();

    editedItems.value = {};
    editedOrder.value = null;
    isEditingItems.value = false;
    toast.success("Semua perubahan berhasil disimpan!");
  } catch (error) {
    toast.error("Gagal memperbarui data!");
    console.error("Error updating data:", error);
  }
}

function calculateItemTotal(item: OrderItem) {
  const editedItem = editedItems.value[item.id];
  if (editedItem) {
    const quantity = editedItem.quantity;
    const price = editedItem.price;
    const discount = editedItem.discount || 0;
    const isPercentage = editedItem.is_percentage;

    let total = quantity * price;
    if (discount > 0) {
      if (isPercentage) {
        total = total * (1 - discount / 100);
      } else {
        total = total - discount;
      }
    }
    return total;
  }

  // If not in edit mode, calculate from original item
  let total = item.quantity * item.price;
  if (item.discount && item.discount > 0) {
    if (item.is_percentage) {
      total = total * (1 - item.discount / 100);
    } else {
      total = total - item.discount;
    }
  }
  return total;
}

function calculateOrderTotalBeforeDiscount() {
  if (!order.value) return 0;

  // Calculate total from all items without applying discount
  return order.value.items.reduce((total, item) => {
    let itemTotal = item.quantity * item.price;
    if (item.discount && item.discount > 0) {
      if (item.is_percentage) {
        itemTotal = itemTotal * (1 - item.discount / 100);
      } else {
        itemTotal = itemTotal - item.discount;
      }
    }
    return total + itemTotal;
  }, 0);
}

function calculateOrderTotal() {
  if (!order.value) return 0;

  // Get total before discount
  let total = calculateOrderTotalBeforeDiscount();

  // Apply order-level discount if exists
  const discount = order.value.discount || 0;
  const isPercentage = order.value.type_discount;

  if (discount > 0) {
    if (isPercentage) {
      total = total * (1 - discount / 100);
    } else {
      total = total - discount;
    }
  }

  return total;
}

onMounted(async () => {
  await Promise.all([fetchOrderDetail(), fetchUsers()]);
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
                <BreadcrumbLink href="/orders"> Order </BreadcrumbLink>
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
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"
          ></div>
        </div>

        <div v-else-if="order" class="space-y-6">
          <!-- Customer Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded-lg shadow">
              <h3 class="font-semibold mb-2">Customer Information</h3>
              <div class="space-y-1">
                <p>
                  <span class="font-medium">Store:</span>
                  {{ order.customer.store_name }}
                </p>
                <p>
                  <span class="font-medium">Name:</span>
                  {{ order.customer.name }}
                </p>
                <p>
                  <span class="font-medium">Phone:</span>
                  {{ order.customer.phone }}
                </p>
                <p>
                  <span class="font-medium">Address:</span>
                  {{ order.customer.address }}
                </p>
              </div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
              <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold">Order Information</h3>
                <div v-if="!isEditing">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="startEditing"
                    v-if="order.status === 'Di Proses'"
                  >
                    <Edit2 class="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
                <div v-else class="flex gap-2">
                  <Button variant="outline" size="sm" @click="saveEditing">
                    <Save class="w-4 h-4 mr-2" />
                    Simpan
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    @click="cancelEditing"
                  >
                    <X class="w-4 h-4 mr-2" />
                    Batal
                  </Button>
                </div>
              </div>
              <div class="space-y-1">
                <p>
                  <span class="font-medium">Sales:</span>
                  <template v-if="isEditing">
                    <Select
                      v-model="editedOrder.sales_id"
                      :groups="[
                        {
                          label: 'Sales',
                          options:
                            salesUsers?.map((user) => ({
                              value: String(user.id),
                              label: user.name,
                            })) || [],
                        },
                      ]"
                      :default-value="String(order.sales.id)"
                      placeholder="Pilih Sales"
                      class="w-[200px]"
                    />
                  </template>
                  <template v-else>
                    {{ order.sales.name }}
                  </template>
                </p>
                <p>
                  <span class="font-medium">Status:</span>
                  {{ order.status }}
                </p>
                <p>
                  <span class="font-medium">Pengirim:</span>
                  <template v-if="isEditing">
                    <Select
                      v-model="editedOrder.shipper_id"
                      :groups="[
                        {
                          label: 'Pengirim',
                          options:
                            driverUsers?.map((user) => ({
                              value: String(user.id),
                              label: user.name,
                            })) || [],
                        },
                      ]"
                      :default-value="
                        order.shipper ? String(order.shipper.id) : undefined
                      "
                      placeholder="Pilih Pengirim"
                      class="w-[200px]"
                    />
                  </template>
                  <template v-else>
                    {{ order.shipper?.name ?? "Belum ditentukan" }}
                  </template>
                </p>
              </div>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
              <h3 class="font-semibold mb-2">Info Partner Bisnis</h3>
              <div class="space-y-1">
                <p>
                  <span class="font-medium">Nama:</span>
                  <template v-if="isEditing">
                    <Select
                      v-model="editedOrder.collector_id"
                      :groups="[
                        {
                          label: 'Partner Bisnis',
                          options:
                            collectorUsers?.map((user) => ({
                              value: String(user.id),
                              label: user.name,
                            })) || [],
                        },
                      ]"
                      :default-value="
                        order.collector ? String(order.collector.id) : undefined
                      "
                      placeholder="Pilih Partner Bisnis"
                      class="w-[200px]"
                    />
                  </template>
                  <template v-else>
                    {{ order.collector?.name ?? "Belum ditentukan" }}
                  </template>
                </p>
                <p>
                  <span class="font-medium">Total Bayar:</span>
                  {{ formatCurrency(order.total_price) }}
                </p>
                <p>
                  <span class="font-medium">Sisa Pembayaran:</span>
                  {{ formatCurrency(order.remaining) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="bg-white p-4 rounded-lg shadow">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-semibold">Order Items</h3>
              <div v-if="!isEditingItems">
                <Button
                  variant="outline"
                  @click="startEditingAllItems"
                  v-if="order.status === 'Di Proses'"
                >
                  <Edit2 class="w-4 h-4 mr-2" />
                  Edit Items
                </Button>
              </div>
              <div v-else class="flex gap-2">
                <Button variant="outline" @click="saveAllItemChanges">
                  <Save class="w-4 h-4 mr-2" />
                  Simpan Semua
                </Button>
                <Button variant="destructive" @click="cancelEditingAllItems">
                  <X class="w-4 h-4 mr-2" />
                  Batal
                </Button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="item in order.items" :key="item.id">
                    <TableCell>{{ item.brand }}</TableCell>
                    <TableCell>{{ item.name }}</TableCell>
                    <TableCell>
                      <template v-if="isEditingItems && editedItems[item.id]">
                        <input
                          v-model.number="editedItems[item.id].quantity"
                          type="number"
                          min="1"
                          class="w-20 px-2 py-1 border rounded"
                        />
                      </template>
                      <template v-else>
                        {{ item.quantity }}
                      </template>
                    </TableCell>
                    <TableCell>
                      <template v-if="isEditingItems && editedItems[item.id]">
                        <input
                          v-model.number="editedItems[item.id].price"
                          type="number"
                          min="0"
                          class="w-32 px-2 py-1 border rounded"
                        />
                      </template>
                      <template v-else>
                        {{ formatCurrency(item.price) }}
                      </template>
                    </TableCell>
                    <TableCell>
                      <template v-if="isEditingItems && editedItems[item.id]">
                        <div class="flex items-center gap-2">
                          <input
                            v-model.number="editedItems[item.id].discount"
                            type="number"
                            min="0"
                            class="w-20 px-2 py-1 border rounded"
                          />
                          <label class="flex items-center gap-1">
                            <input
                              type="checkbox"
                              v-model="editedItems[item.id].is_percentage"
                            />
                            <span class="text-sm">%</span>
                          </label>
                        </div>
                      </template>
                      <template v-else>
                        {{
                          item.discount
                            ? item.is_percentage
                              ? `${item.discount}%`
                              : formatCurrency(item.discount)
                            : "-"
                        }}
                      </template>
                    </TableCell>
                    <TableCell>{{
                      formatCurrency(calculateItemTotal(item))
                    }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div class="mt-4 space-y-4">
              <div class="text-right">
                <div class="flex items-center justify-end gap-2 mb-2">
                  <span class="text font-semibold">Diskon:</span>
                  <template v-if="isEditingItems">
                    <div class="flex items-center gap-2">
                      <input
                        v-model.number="editedOrder.discount"
                        type="number"
                        min="0"
                        placeholder="Diskon"
                        class="w-32 px-2 py-1 border rounded"
                      />
                      <label class="flex items-center gap-1">
                        <input
                          type="checkbox"
                          v-model="editedOrder.type_discount"
                        />
                        <span class="text-sm">%</span>
                      </label>
                    </div>
                  </template>
                  <template v-else>
                    <span class="text font-semibold">
                      {{
                        order.discount
                          ? order.type_discount
                            ? `${formatCurrency(
                                calculateOrderTotalBeforeDiscount() *
                                  (order.discount / 100)
                              )} (${order.discount}%)`
                            : `${formatCurrency(order.discount)}`
                          : "-"
                      }}
                    </span>
                  </template>
                </div>
                <p class="font-semibold">
                  Total Bayar: {{ formatCurrency(calculateOrderTotal()) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Payment History -->
          <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="font-semibold mb-2">Payment History</h3>
            <div class="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Terbayar</TableHead>
                    <TableHead>Sisa Pembayaran</TableHead>
                    <TableHead>Partner Bisnis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="payment in order.payments" :key="payment.id">
                    <TableCell>{{
                      new Date(payment.date).toLocaleDateString()
                    }}</TableCell>
                    <TableCell>{{ payment.method }}</TableCell>
                    <TableCell>{{
                      formatCurrency(Number(payment.amount))
                    }}</TableCell>
                    <TableCell>{{
                      formatCurrency(Number(payment.remaining))
                    }}</TableCell>
                    <TableCell>{{ payment.collector }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
