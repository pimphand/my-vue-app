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
import { AlertDialog } from "@/components/ui/alert-dialog";

import { FolderKanban, PencilIcon, Trash2 } from "lucide-vue-next";
import ButtonTooltip from "@/components/button/ButtonTooltip.vue";
import CardTable from "@/components/CardTable.vue";
import { Badge } from "@/components/ui/badge";
import CategoryForm from "@/components/category/CategoryForm.vue";

interface Kategori {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse {
  data: Kategori[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

const columns = [
  { key: "index", label: "#", width: "100px" } as const,
  { key: "name", label: "Nama Kategori", searchable: true } as const,
  { key: "description", label: "Deskripsi", searchable: true } as const,
  { key: "actions", label: "Aksi", align: "right" } as const,
];

const searchFields = [
  {
    key: "filter[name]",
    label: "Nama Kategori",
    placeholder: "Cari nama Kategori...",
  },
];

const KategoriData = ref<Kategori[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const totalItems = ref(0);
const to = ref(1);
const searchQueries = ref<Record<string, string>>({});
const { get, del, assetsURL } = useFetch();
const router = useRouter();

// Add new refs for modals
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedCategory = ref<Kategori | null>(null);
const isDeleteAlertOpen = ref(false);
const categoryToDelete = ref<string | null>(null);

const openCreateModal = () => {
  selectedCategory.value = null;
  isCreateModalOpen.value = true;
};

const openEditModal = (category: Kategori) => {
  selectedCategory.value = category;
  isEditModalOpen.value = true;
};

const handleModalSuccess = () => {
  fetchKategori();
};

async function fetchKategori() {
  try {
    loading.value = true;
    const queryParams = new URLSearchParams({
      page: currentPage.value.toString(),
      ...searchQueries.value,
    });

    const response = await get<PaginatedResponse>(
      `/admin/categories?${queryParams.toString()}`
    );
    KategoriData.value = response.data as unknown as Kategori[];
    totalItems.value = (response as any).meta.total;
    to.value = (response as any).meta.from;
  } catch (error) {
    toast.error("Gagal mengambil data Kategori!");
    console.error("Error fetching Kategori:", error);
  } finally {
    loading.value = false;
  }
}

const handlePageChange = (page: number) => {
  console.log("Changing to page:", page);
  currentPage.value = page;
  fetchKategori();
};

const handleSearch = (queries: Record<string, string>) => {
  searchQueries.value = queries;
  currentPage.value = 1;
  fetchKategori();
};

async function deleteKategori(id: string) {
  try {
    await del(`/admin/categories/${id}`);
    toast.success("Data Kategori berhasil dihapus");
    await fetchKategori(); // Refresh data after deletion
  } catch (error) {
    toast.success("Data Kategori berhasil dihapus");
    await fetchKategori(); // Refresh data after deletion
  }
}

const openDeleteAlert = (id: string) => {
  categoryToDelete.value = id;
  isDeleteAlertOpen.value = true;
};

const handleDeleteConfirm = async () => {
  if (categoryToDelete.value) {
    try {
      await deleteKategori(categoryToDelete.value);
      categoryToDelete.value = null;
      isDeleteAlertOpen.value = false;
    } catch (error) {
      console.error("Error in delete confirmation:", error);
    }
  }
};

const handleDeleteCancel = () => {
  categoryToDelete.value = null;
  isDeleteAlertOpen.value = false;
};

onMounted(() => {
  fetchKategori();
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
                <BreadcrumbPage>Kategori</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="flex justify-end">
          <button
            @click="openCreateModal"
            class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Tambah Kategori
          </button>
        </div>
        <CardTable
          title="List Kategori"
          :columns="columns"
          :data="KategoriData"
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
          <template #image="{ item }">
            <img :src="assetsURL(item.logo)" width="50px" alt="" />
          </template>

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
            <div class="flex justify-end items-center gap-2">
              <ButtonTooltip
                style="margin-right: 2px"
                name=""
                description="Edit Kategori"
                :icon="PencilIcon"
                @click="openEditModal(item)"
              />
              <ButtonTooltip
                v-if="item.products_count < 1"
                name=""
                description="delete Kategori"
                :icon="Trash2"
                variant="destructive"
                @click="openDeleteAlert(item.id)"
              />
            </div>
          </template>
        </CardTable>

        <!-- Create Modal -->
        <Dialog v-model:open="isCreateModalOpen">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori</DialogTitle>
            </DialogHeader>
            <CategoryForm
              :is-open="isCreateModalOpen"
              mode="create"
              @close="isCreateModalOpen = false"
              @success="handleModalSuccess"
            />
          </DialogContent>
        </Dialog>

        <!-- Edit Modal -->
        <Dialog v-model:open="isEditModalOpen">
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Kategori</DialogTitle>
            </DialogHeader>
            <CategoryForm
              v-if="selectedCategory"
              :is-open="isEditModalOpen"
              :category="selectedCategory"
              mode="edit"
              @close="isEditModalOpen = false"
              @success="handleModalSuccess"
            />
          </DialogContent>
        </Dialog>

        <!-- Delete Alert Dialog -->
        <AlertDialog
          v-model:open="isDeleteAlertOpen"
          title="Hapus Kategori"
          description="Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan."
          confirm-text="Ya, Hapus"
          cancel-text="Batal"
          variant="destructive"
          @confirm="handleDeleteConfirm"
          @cancel="handleDeleteCancel"
        />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
