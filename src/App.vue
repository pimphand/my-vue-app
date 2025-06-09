<script lang="ts">
export const description = "A sidebar that collapses to icons.";
export const iframeHeight = "800px";
export const containerClass = "w-full h-full";
</script>

<script setup lang="ts">
import AppSidebar from "@/components/AppSidebar.vue";
import { SidebarProvider } from "@/components/ui/sidebar";
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <router-view></router-view>
  </SidebarProvider>
</template>
