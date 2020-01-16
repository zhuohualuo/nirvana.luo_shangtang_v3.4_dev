<template>
  <el-dropdown trigger="click" @command="changePlatform">
    <div class="platform-icon">
      <span>{{platformName}}</span>
      <i class="el-icon-caret-bottom"></i>
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item v-for="item of platformList" :key="item.id" :disabled="platform==item.id" :command="item.id">
        {{item.name}}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  data() {
    return {
      platformList: []
    }
  },
  computed: {
    platform() {
      return this.$store.getters.platform
    },
    platformName() {
      let platform = this.platform;
      if(this.platformList&&this.platformList.length){
        let tmp = this.platformList.find(function (item) {
            return item.id === Number(platform)
      })
      if(tmp){
        return tmp.name
      }
      else{
        return ""
      }
      }
      
    }
  },
  mounted() {
    this.getPlatform();
  },
  methods: {
    getPlatform(){
      let self =this;
      this.$store.dispatch('basicData/GetPlatform').then(function () {
        self.platformList = self.$store.getters.platformList;
      })
    },
    changePlatform(platform) {
      Promise.all([
          this.$store.dispatch('user/ChangePlatform', platform),
          this.$store.dispatch('basicData/GetProject')
      ]);
      this.refreshView();
    },
    refreshView() {
      // In order to make the cached page re-rendered
      this.$store.dispatch('tagsView/delAllViews', this.$route);

      this.$nextTick(() => {
        this.$router.replace({
          path: '/dashboard',
          name: 'dashboard'
        })
      })

      //清空form2
    window.sessionStorage.setItem("form2",JSON.stringify({
        search_ip: '',
        search_project_id: '',
        search_desc: '',
        search_editor: '',
        search_owner: '',
      }))

      //清空form3
    window.sessionStorage.setItem("form3",JSON.stringify( {
        search_status: '',
        search_renter: '',
        search_ip: '',
        search_description: '',
      }))
    }
  }

}
</script>

<style>
  .platform-icon{
    margin-top: 25px;
    margin-right: 15px;
  }
</style>
