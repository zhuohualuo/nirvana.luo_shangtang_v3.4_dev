<template>
  <div class="errPage-container">
    <el-button @click="back" icon='arrow-left' class="pan-back-btn">返回登录</el-button>
    <el-row>
      <el-col :span="12">
        <h1 class="text-jumbo text-ginormous">Oops!</h1>
        <h2>您没有任何业务线权限</h2>
        <h3>请联系管理员开通</h3>
        <h4>然后重新登录</h4>
        <ul class="list-unstyled">
          <li v-for="(item,index) in adminList">{{index}}
            <span>{{item}}</span>
          </li>
        </ul>
      </el-col>
      <el-col :span="12">
        <img :src="errGif" width="350" height="480" alt="Girl has dropped her ice cream.">
      </el-col>
    </el-row>
  </div>
</template>

<script>
import errGif from '@/assets/401_images/401.gif'

export default {
  name: 'page401',
  data() {
    return {
      errGif: errGif + '?' + +new Date(),
      adminList:{
        "SCG-IVA-VIPER":"晏高林 / 马毅 / 周强",
        "SCG-IVA-业务":"曹林 / 曾昭宇 / 丁奕云",
        "KestrelSDK":"潘贤民",
        "SCG-解决方案":"汪政",
        "SCG-BI(智能硬件)":"朱吉清 / 肖丽萍",
        "工程院-CV(计算机视觉平台)":"刘洋 / 刘畅 / 陈庆锋",
        "SCG-RD-IDEA(智能端边产品)":"刘华洲",
        "SCG-IVA-交付":"郭鹏",
        "BIG-数据创新":"张京京",
        "SCG-RD-技术平台":"潘贤民",
      }
    }
  },
  methods: {
    back() {
      this.$router.replace({ path: '/login' })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .errPage-container {
    height: calc(100vh - 200px);
    width: 800px;
    margin: 100px auto;
    .pan-back-btn {
      background: #008489;
      color: #fff;
      border: none!important;
    }
    .pan-gif {
      margin: 0 auto;
      display: block;
    }
    .pan-img {
      display: block;
      margin: 0 auto;
      width: 100%;
    }
    .text-jumbo {
      font-size: 60px;
      font-weight: 700;
      color: #484848;
    }
    .list-unstyled {
      font-size: 14px;
      width: 90%;
      li {
        padding-bottom: 5px;
      }
      a {
        color: #008489;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
      span {
        display: block;
        float: right;
        font-weight: bold;
        color: #008489;
      }
    }
  }
</style>
