<template>
  <div class="header-container">
    <div class="header-logo">
      <div class="logo-warpper">
        <span class="_logo1">SEP效能平台</span>
        <span class="_logo2" @click="gotoReleaseNote" title="版本说明"> V1.0</span>
      </div>
    </div>
    <el-menu
            :default-active="activeIndex"
            class="el-menu-demo"
            mode="horizontal"
            background-color="#43988A"
            text-color="#FFF"
            active-text-color="#FFF">
      <template v-for="(item,index) in menuItemList">
        <el-menu-item v-if="!item.child" :index="''+index" :key="index">
          <template slot="title">
            <router-link :to='item.path' style="padding: 0 20px;height: 100%;display: inline-block;">
              <div class="menu-item-icon">
                <svg-icon :icon-class="item.icon"></svg-icon>
              </div>
              <div class="menu-item-title">{{generateTitle(item.title)}}</div>
            </router-link>
          </template>
        </el-menu-item>

        <el-submenu v-else :index="''+index" :key="index">
          <template slot="title">
            <div class="menu-item-icon">
              <svg-icon :icon-class="item.icon"></svg-icon>
            </div>
            <div class="menu-item-title">{{generateTitle(item.title)}}</div>
          </template>
          <router-link v-for="(i,key) in item.child" :to='i.path' :key="key">
            <el-menu-item :index="index+'_'+key">
              <template slot="title">
                <span><svg-icon :icon-class="i.icon"></svg-icon>{{'&nbsp&nbsp'+generateTitle(i.title)}}</span>
              </template>
            </el-menu-item>
          </router-link>
        </el-submenu>
      </template>

      <div class="right-menu">
        <el-tooltip content="切换业务线" effect="dark" placement="bottom">
          <switch-platform class="right-menu-item hover-effect"/>
        </el-tooltip>

        <el-dropdown class="avatar-container right-menu-item" trigger="hover">
          <div class="avatar-wrapper">
            <img class="user-avatar" src="/static/img/avatar.gif">
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              {{name}}
            </el-dropdown-item>
            <router-link to="/permission/list" v-if="roles<=1">
              <el-dropdown-item divided>
                权限管理
              </el-dropdown-item>
            </router-link>
            <el-dropdown-item divided>
              <span @click="logout" style="display:block;">{{$t('header.logOut')}}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

    </el-menu>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import ErrorLog from '@/components/ErrorLog'
  import Screenfull from '@/components/Screenfull'
  import SwitchPlatform from '@/components/SwitchPlatform'
  import LangSelect from '@/components/LangSelect'
  import ThemePicker from '@/components/ThemePicker'
  import {generateTitle} from '@/utils/i18n'

  export default {
    name: 'AppHeader',
    data() {
      return {
        menuItemList: []
      }
    },
    components: {
      ErrorLog,
      Screenfull,
      SwitchPlatform,
      LangSelect,
      ThemePicker
    },
    computed: {
      ...mapGetters([
        'name',
        'roles',
        'platform',
        'addRouters'
      ]),
      activeIndex: function () {
        let tmp = '-1';
        let path = this.$route.path.split('/');
        this.menuItemList.forEach((item, index) => {
          if (item.path === '/' + path[1] || item.path==='/') {
            tmp = '' + index;
          }
        })
        return tmp;
      }
    },
    created() {
      this.getHeaderNav();
    },
    watch: {
      'platform': 'getHeaderNav'
    },
    methods: {
      logout() {
        this.$store.dispatch('user/FedLogOut').then(() => {
          location.reload()// In order to re-instantiate the vue-router object to avoid bugs
        })
      },
      getHeaderNav() {
        let tmp = [];
        for (let item of this.addRouters) {
          if (item.meta && item.meta.headerNav) {
            tmp.push({title: item.meta.title, icon: item.meta.icon, path: item.path})
          }
        }
        this.menuItemList = tmp;
      },
      gotoDashboard() {
        this.$router.push({
          path: '/dashboard',
          name: 'dashboard'
        })
      },
      gotoReleaseNote() {
        this.$router.push({
          path: '/releaseNote',
          name: 'releaseNote'
        })
      },
      generateTitle
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss">
  .header-container {
    .header-logo {
      display: block;
      float: left;
      width: 250px;
      height: 100%;
      .logo-warpper {
        margin-left: 30px;
        margin-top: 23px;
      }
      ._logo1 {
        width: 130px;
        height: 33px;
        font-size: 24px;
        font-family: DIN-Black;
        font-weight: 700;
        line-height: 33px;
      }
      ._logo2 {
        margin-left: 5px;
        width: 35px;
        height: 23px;
        font-size: 14px;
        font-family: DIN-Black;
        font-weight: 700;
        line-height: 23px;
        cursor: pointer;
      }
    }
    .el-menu-demo {
      margin-left: 280px;
      height: 100%;
      border: none
    }
    .el-menu--horizontal > .el-menu-item {
      height: 100%;
      padding: 0;
    }
    .el-menu--horizontal > .el-submenu {
      height: 100%;
    }
    .el-menu--horizontal > .el-submenu .el-submenu__title {
      height: 100%;
    }
    .el-menu--horizontal > .el-submenu .el-submenu__icon-arrow {
      display: none;
    }
    .menu-item-icon {
      text-align: center;
      height: 50%
    }
    .menu-item-title {
      height: 50%;
      line-height: 30px;
      font-size: 15px
    }
    .el-menu-item.is-active .menu-item-title {
      font-size: 16px !important;
      font-weight: 900 !important;
    }
    .right-menu {
      float: right;
      height: 100%;
      &:focus {
        outline: none;
      }
      .right-menu-item {
        display: inline-block;
        padding: 0 8px;
        font-size: 18px;
        color: #FFF;
        vertical-align: middle;
        &.hover-effect {
          cursor: pointer;
          transition: background .3s;
          &:hover {
            background: rgba(67, 152, 138, 0.1)
          }
        }
      }
      .avatar-container {
        margin-top: 25px;
        margin-right: 25px;
        .avatar-wrapper {
          cursor: pointer;
          position: relative;
          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }
          .el-icon-caret-bottom {
            position: absolute;
            right: -20px;
            top: 25px;
            font-size: 12px;
          }
        }
      }
    }
  }
</style>
