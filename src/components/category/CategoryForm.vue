<script setup lang="ts">
import { ref, watch } from "vue";
import { toast } from "vue-sonner";
import { useFetch } from "@/stores/fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const props = defineProps<{
  isOpen: boolean;
  category?: Category;
  mode: "create" | "edit";
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const { post, put } = useFetch();
const loading = ref(false);
const formData = ref({
  name: "",
  description: "",
});

watch(
  () => props.category,
  (newCategory) => {
    if (newCategory) {
      formData.value = {
        name: newCategory.name,
        description: newCategory.description || "",
      };
    } else {
      formData.value = {
        name: "",
        description: "",
      };
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  try {
    loading.value = true;
    if (props.mode === "create") {
      await post("/admin/categories", formData.value);
      toast.success("Kategori berhasil ditambahkan!");
    } else {
      await put(`/admin/categories/${props.category?.id}`, formData.value);
      toast.success("Kategori berhasil diperbarui!");
    }
    emit("success");
    emit("close");
  } catch (error) {
    toast.error(
      props.mode === "create"
        ? "Gagal menambahkan kategori!"
        : "Gagal memperbarui kategori!"
    );
    console.error("Error submitting category:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label for="name">Nama Kategori</Label>
      <Input
        id="name"
        v-model="formData.name"
        placeholder="Masukkan nama kategori"
        :disabled="loading"
      />
    </div>
    <div class="space-y-2">
      <Label for="description">Deskripsi</Label>
      <Textarea
        id="description"
        v-model="formData.description"
        placeholder="Masukkan deskripsi kategori"
        :disabled="loading"
        class="min-h-[100px]"
      />
    </div>
    <div class="flex justify-end gap-2">
      <Button variant="outline" @click="emit('close')" :disabled="loading">
        Batal
      </Button>
      <Button @click="handleSubmit" :disabled="loading">
        {{ mode === "create" ? "Tambah" : "Simpan" }}
      </Button>
    </div>
  </div>
</template>
