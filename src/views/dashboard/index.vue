<template>
  <div class="dashboard-container">
    <component :is="currentRole"></component>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import adminDashboard from './admin'
import editorDashboard from './editor'

export default {
  name: 'dashboard',
  components: { adminDashboard, editorDashboard },
  data() {
    return {
      currentRole: 'adminDashboard'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  watch: {
    // 监测路由变化,只要变化了就调用获取路由参数方法将数据存储本组件即可
    '$route': 'refreshRouteParams'
  },
  created() {
    /*
    if (!this.roles.includes('admin')) {
      this.currentRole = 'editorDashboard'
    }
    */
  },
  beforeRouteLeave (to, from, next) {
    if(to.path != "/releaseNote"){
      !this.$store.state.app.sidebar.opened&&this.$store.dispatch('app/toggleSideBar')
    }
    next()
  },
  methods: {
    refreshRouteParams(){
      // console.log("route",this.$route)
    }
  }
}
</script>
