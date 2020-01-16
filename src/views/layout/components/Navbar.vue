<template>
  <div class="navbar">
    <div v-if="navbar.childPage" class="child-nav">
      <a class="goback" @click="goBack">
        <svg-icon icon-class="return"></svg-icon>
      </a>
      <span class="stick"></span>
      <span class="title">{{generateTitle(title)}}</span>
    </div>
    <div v-else class="parent-nav">
      <span class="stick"></span>
      <span class="title">{{generateTitle(title)}}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { generateTitle } from '@/utils/i18n'

export default {
  components: {
  },
  computed: {
    ...mapGetters([
      'navbar'
    ]),
    title(){
      return this.$route.meta.title
    }
  },
  mounted() {
  },
  methods: {
    generateTitle,
    goBack(){
      this.$router.push({
        path: this.navbar.parentUrl,
        params: this.$route.params
      })
      //为支持三层子页面跳转，不统一toggleParent，各子页面自行处理
      // this.$store.dispatch('app/toggleParentNav')
    },
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
  height: 45px;
  line-height: 45px;
  background-color: #FFF;
  box-shadow: 0 2px rgba(0, 0, 0, 0.1);
  border-radius: 0 !important;
  .child-nav {
    .goback{
      margin-left: 25px;
      color: #43988A;
      font-weight: 900;
      font-size: 20px;
      display: inline-block;
      vertical-align: middle;
    }
    .stick{
      margin-left: 20px;
      width:2px;
      height:20px;
      background-color: #d2d3d5;
      border-radius:1px;
      display: inline-block;
      vertical-align: middle;
    }
    .title{
      margin-left: 3px;
      height:16px;
      font-size:16px;
      font-weight:500;
      color: #666666;
      display: inline-block;
    }
  }
  .parent-nav {
    .stick{
      margin-left: 25px;
      width:2px;
      height:18px;
      background-color: #43988A;
      border-radius:1px;
      display: inline-block;
      vertical-align: sub;
    }
    .title{
      margin-left: 15px;
      height:16px;
      font-size:16px;
      font-weight:500;
      color: #666666;
      display: inline-block;
    }
  }
}
</style>
