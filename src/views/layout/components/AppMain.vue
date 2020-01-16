<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <!--<keep-alive :exclude="nocachedViews">-->
        <router-view :key="key"></router-view>
      <!--</keep-alive>-->
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    nocachedViews() {
      return (this.$route.meta && this.$route.meta.noCache) ? ['parentView',this.$route.name] : []
    },
    key() {
      return this.$route.fullPath
    }
  }
}
</script>

<style scoped>
.app-main {
  /*164 = header + navbar + tags-view = 80 + 50 + 34 */
  height: calc(100vh - 125px);
  position: relative;
  padding: 15px 20px 10px 20px;
  overflow: auto;
}
</style>

