<template>
  <!--<keep-alive :include="cachedViews" :exclude="notCacheName">-->
    <router-view></router-view>
  <!--</keep-alive>-->

</template>

<script>
export default {
  name: 'parentView',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    notCacheName () {
      return [(this.$route.meta && this.$route.meta.noCache) ? this.$route.name : '']
    },
    key() {
      return this.$route.fullPath
    }
  }
}
</script>
