<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-vue-next";
import NavMain from "@/components/navbar/NavMain.vue";
import NavProjects from "@/components/navbar/NavProjects.vue";
import NavUser from "@/components/navbar/NavUser.vue";
import NavDasboard from "@/components/navbar/NavDashboard.vue";
import TeamSwitcher from "@/components/TeamSwitcher.vue";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Produk",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "List",
          url: "/products",
        },
        {
          title: "Kategori",
          url: "/categories",
        },
        {
          title: "Brand",
          url: "/Brands",
        },
      ],
    },
    {
      title: "Orders",
      url: "/orders",
      icon: Bot,
    },
  ],
  projects: [
    {
      name: "Absensi",
      url: "absensi",
      icon: Frame,
    },
  ],
  dashboard: [
    {
      name: "Dashboard",
      url: "dashboard",
      icon: PieChart,
    },
  ],
};
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavDasboard :dashboard="data.dashboard" />
      <NavMain :items="data.navMain" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
