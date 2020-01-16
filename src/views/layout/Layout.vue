<template>
  <div class="app-wrapper" :class="classObj">
    <app-header></app-header>
    <sidebar class="sidebar-container" v-show="showSidebar"></sidebar>
    <div class="main-container">
      <navbar></navbar>
      <!--<tags-view></tags-view>-->
      <app-main></app-main>
    </div>
  </div>
</template>

<script>
import { Navbar, Sidebar, AppMain, TagsView, AppHeader } from './components'
import ResizeMixin from './mixin/ResizeHandler'
const whiteList=['/dashboard','/releaseNote'];

export default {
  name: 'layout',
  components: {
    Navbar,
    Sidebar,
    AppMain,
    TagsView,
    AppHeader
  },
  mixins: [ResizeMixin],
  computed: {
    showSidebar() {
      if(whiteList.indexOf(this.$route.path) === -1){
        return true
      }
      this.handleClickOutside();
      return false
    },
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  mounted(){
  },
  methods: {
    handleClickOutside() {
        this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";
  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    &.mobile.openSidebar{
      position: fixed;
      top: 0;
    }
  }
</style>
