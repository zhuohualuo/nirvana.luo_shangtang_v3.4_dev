<template>
  <el-scrollbar wrapClass="scrollbar-wrapper">
    <hamburger class="hamburger-container" :toggleClick="toggleSideBar" :isActive="sidebar.opened"></hamburger>
    <div class="sideMenu-wrapper">
      <el-menu
              mode="vertical"
              :show-timeout="200"
              :default-active="$route.path"
              :collapse="isCollapse"
              text-color="#666666"
              active-text-color="#FFF"
      >
        <sidebar-item v-for="route in siderbar_routers.children" :key="route.name" :item="route" :base-path="route.path"></sidebar-item>
      </el-menu>
    </div>
  </el-scrollbar>
</template>

<script>
  import { mapGetters } from 'vuex'
  import SidebarItem from './SidebarItem'
  import Hamburger from "../../../../components/Hamburger/index";

  export default {
    components: {Hamburger, SidebarItem },
    computed: {
      ...mapGetters([
        'siderbar_routers',
        'sidebar'
      ]),
      isCollapse() {
        return !this.sidebar.opened
      }
    },
    methods: {
      toggleSideBar() {
        this.$store.dispatch('app/toggleSideBar')
      }
    }

  }
</script>
