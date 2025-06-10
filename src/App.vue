<script lang="ts">
export const description = "A sidebar that collapses to icons.";
export const iframeHeight = "800px";
export const containerClass = "w-full h-full";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default {
  name: "App",
};
</script>
<template>
  <SidebarProvider>
    <router-view></router-view>
    <Toaster />
  </SidebarProvider>
</template>
