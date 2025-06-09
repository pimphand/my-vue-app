<script setup lang="ts">
import { type LucideIcon } from "lucide-vue-next";
import { RouterLink } from "vue-router";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

defineProps<{
  dashboard: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}>();
</script>

<template>
  <SidebarGroup class="group-data-[collapsible=icon]:hidden">
    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem v-for="item in dashboard" :key="item.name">
        <SidebarMenuButton as-child>
          <RouterLink :to="item.url">
            <component :is="item.icon" />
            <span>{{ item.name }}</span>
          </RouterLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
