<script setup lang="ts">
import { ref, onMounted } from "vue";
import { toast } from "vue-sonner";
import AppSidebar from "@/components/AppSidebar.vue";
import { useFetch } from "@/stores/fetch";
import { checkOfficeLocation } from "@/stores/calculateDistance"; // Assuming you have a utility function for distance calculation
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

import { MapIcon, PencilIcon, Trash2 } from "lucide-vue-next";
import ButtonTooltip from "@/components/button/ButtonTooltip.vue";
import Modal from "@/components/Modal.vue";
import CardTable from "@/components/CardTable.vue";
import { Badge } from "@/components/ui/badge";

interface Absensi {
  id: number;
  user: {
    username: string;
    name: string;
    roles: Array<{
      display_name: string;
    }>;
  };
  attendance_date: string;
  check_in: string;
  check_out: string;
  latitude_check_in: number;
  longitude_check_in: number;
  latitude_check_out: string;
  longitude_check_out: string;
  status_check_in: string;
  status_check_out: string;
  lokasi: string;
  koordinat: string;
}

interface PaginatedResponse {
  data: Absensi[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

const columns = [
  { key: "index", label: "#", width: "100px" } as const,
  { key: "name", label: "Nama", searchable: true } as const,
  { key: "division", label: "Divisi", searchable: true } as const,
  { key: "date", label: "Hari" } as const,
  { key: "time", label: "Jam" } as const,
  { key: "location", label: "Lokasi" } as const,
  { key: "status_check_in", label: "Status" } as const,
  { key: "actions", label: "Aksi", align: "right" as const },
];

const searchFields = [
  { key: "filter[user.name]", label: "Nama", placeholder: "Cari nama..." },
  {
    key: "filter[user.roles.name]",
    label: "Divisi",
    placeholder: "Cari divisi...",
  },
];

const absensiData = ref<Absensi[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const totalItems = ref(0);
const to = ref(1);
const searchQueries = ref<Record<string, string>>({});
const { get, del } = useFetch();

async function fetchAbsensi() {
  try {
    loading.value = true;
    const queryParams = new URLSearchParams({
      page: currentPage.value.toString(),
      ...searchQueries.value,
    });

    const response = await get<PaginatedResponse>(
      `/admin/absen?${queryParams.toString()}`
    );
    absensiData.value = response.data as unknown as Absensi[];
    totalItems.value = (response as any).meta.total;
    to.value = (response as any).meta.from;
  } catch (error) {
    toast.error("Gagal mengambil data absensi!");
    console.error("Error fetching absensi:", error);
  } finally {
    loading.value = false;
  }
}

const handlePageChange = (page: number) => {
  console.log("Changing to page:", page);
  currentPage.value = page;
  fetchAbsensi();
};

const handleSearch = (queries: Record<string, string>) => {
  searchQueries.value = queries;
  currentPage.value = 1;
  fetchAbsensi();
};

async function deleteAbsensi(id: number) {
  try {
    await del(`/admin/absen/${id}`);
    toast.success("Data absensi berhasil dihapus");
    await fetchAbsensi(); // Refresh data after deletion
  } catch (error) {
    console.error("Error deleting absensi:", error);
  }
}

function showToast() {
  toast.success("Berhasil disimpan!");
}

const isOpen = ref(false);
const selectedLocation = ref<{ lat: number; lng: number } | null>(null);

const handleModal = () => {
  isOpen.value = false;
  selectedLocation.value = null;
};

const openLocationModal = (lat: number, lng: number) => {
  console.log("openLocationModal called with:", { lat, lng });
  selectedLocation.value = { lat, lng };
  isOpen.value = true;
};

const getStatusVariant = (
  status: string
): "default" | "destructive" | "outline" | "secondary" => {
  switch (status?.toLowerCase()) {
    case "Sudah Absen":
      return "default";
    case "terlambat":
      return "destructive";
    case "tidak hadir":
      return "destructive";
    default:
      return "secondary";
  }
};

onMounted(() => {
  fetchAbsensi();
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
                <BreadcrumbPage>Absensi</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <CardTable
          title="List Absensi"
          :columns="columns"
          :data="absensiData"
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
            {{ item.user.name }}
          </template>

          <template #division="{ item }">
            {{ item.user.roles[0].display_name }}
          </template>

          <template #date="{ item }">
            {{ item.attendance_date }}
          </template>

          <template #time="{ item }">
            {{ item.check_in }}
          </template>

          <template #status_check_in="{ item }">
            <Badge
              :variant="getStatusVariant(item.status_check_in)"
              :class="{
                'bg-green-500 hover:bg-green-600':
                  item.status_check_in?.toLowerCase() === 'Sudah Absen',
              }"
            >
              {{ item.status_check_in }}
            </Badge>
          </template>

          <template #location="{ item }">
            <span class="mr-1">
              {{ item.latitude_check_in }}, {{ item.longitude_check_in }} ({{
                checkOfficeLocation(
                  item.latitude_check_in,
                  item.longitude_check_in
                )["status"]
              }})
            </span>
          </template>

          <template #actions="{ item }">
            <div class="flex justify-end">
              <ButtonTooltip
                style="margin-right: 2px"
                name=""
                @click="
                  openLocationModal(
                    item.latitude_check_in,
                    item.longitude_check_in
                  )
                "
                description="Tampilkan Lokasi"
                :icon="MapIcon"
                :variant="'outline'"
              />
              <ButtonTooltip
                style="margin-right: 2px"
                name=""
                description="Edit Absensi"
                :icon="PencilIcon"
              />
              <ButtonTooltip
                name=""
                description="delete Absensi"
                :icon="Trash2"
                variant="destructive"
                @click="deleteAbsensi(item.id)"
              />
            </div>
          </template>
        </CardTable>

        <Modal
          v-model:open="isOpen"
          title="Lokasi Absensi"
          description="Detail lokasi absensi karyawan"
          submit-text="Tutup"
          @submit="handleModal"
        >
          <template v-if="selectedLocation">
            <div class="space-y-4">
              <div class="grid gap-2">
                <div class="font-medium">Koordinat:</div>
                <div>Latitude: {{ selectedLocation.lat }}</div>
                <div>Longitude: {{ selectedLocation.lng }}</div>
              </div>
              <div class="w-full h-[400px] rounded-lg border overflow-hidden">
                <iframe
                  :src="`https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&hl=id&z=16&output=embed`"
                  width="100%"
                  height="100%"
                  style="border: 0"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </template>
        </Modal>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped>
iframe {
  border: none;
  width: 100%;
  height: 100%;
}
</style>
