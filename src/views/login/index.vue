<template>
  <div class="login-container" >
    <div class="login-form">
      <img src="../../../static/img/dl_hb.png" style="width:57%">
    
      <el-form autoComplete="on" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left" class="formStyle">

        <div class="title-container">
          <h2 class="title">{{$t('login.title')}}</h2>
          <h4 class="sub-title">{{$t('login.subTitle')}}</h4>
          <!-- <lang-select class="set-language"></lang-select> -->
        </div>

        <el-form-item prop="username">
          <span class="svg-container svg-container_login">
            <svg-icon icon-class="user" style="font-size:30px;color:rgba(230,230,230,1)"/>
          </span>
          <el-input name="username" type="text" v-model="loginForm.username" autoComplete="on" :placeholder="$t('login.username')"
          />
        </el-form-item>

        <el-form-item prop="password" style="margin-bottom:16%">
          <span class="svg-container">
            <svg-icon icon-class="password" style="font-size:30px;color:rgba(230,230,230,1)"/>
          </span>
          <el-input name="password" :type="passwordType" @keyup.enter.native="handleLogin" v-model="loginForm.password" autoComplete="on"
            :placeholder="$t('login.password')" />
          <span class="show-pwd" @click="showPwd">
            <svg-icon icon-class="eye" />
          </span>
        </el-form-item>

        <span class="bottom" :style="{backgroundImage:`url(../../../static/img/dl_go.png)`}" :loading="loading" @click="handleLogin">{{$t('login.logIn')}}</span>
        
      </el-form>
    </div>
    <div class="tips">{{$t('login.tips')}}
      <a target="_blank" class="download" href="https://www.google.com/intl/zh-CN/chrome/">点击下载</a>
    </div>
  </div>
</template>

<script>
import { isvalidUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect'
import SocialSign from './socialsignin'

export default {
  components: { LangSelect, SocialSign },
  name: 'login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!isvalidUsername(value)) {
        callback(new Error('Please enter the correct user name'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
      },
      passwordType: 'password',
      loading: false,
      showDialog: false
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    randomString(L){
      var s= '';
      var randomchar = function(){
        var n= Math.floor(Math.random()*62);
        if(n<10) return n; //1-10
        if(n<36) return String.fromCharCode(n+55); //A-Z
        return String.fromCharCode(n+61); //a-z
      }
      while(s.length < L) s+= randomchar();
      return s;
    },
    encodeBase64(str){
      let tmp1 = this.randomString(3);
      let tmp2 = this.randomString(4);
      return window.btoa(tmp1 + str + tmp2);
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$store.dispatch('user/LoginByUsername',{
            username: this.loginForm.username,
            password: this.encodeBase64(this.loginForm.password)
          }).then(() => {
              this.loading = false;
              this.$message.success("登录成功！");
              this.$router.push({ path: '/' })
          }).catch((err) => {
            this.$message.error(err);
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
  },
  created() {
    // window.addEventListener('hashchange', this.afterQRScan)
  },
  destroyed() {
    // window.removeEventListener('hashchange', this.afterQRScan)
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  /* 修复input 背景不协调 和光标变色 */

  $bg:#fff;
  $light_gray:#283443;
  $cursor: #283443;

  @supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
    .login-container .el-input input{
      color: $cursor;
    }
  }

  /* reset element-ui css */
  .login-container {
    .el-input {
      display: inline-block;
      height: 50px;
      width: 85%;
      input {
        font-size: 16px;
        margin-left: 10px;
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $light_gray;
        // height: 47px;
        caret-color: $cursor;
        &:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
          -webkit-text-fill-color: $cursor !important;
        }
      }
    }
    .el-form-item {
      border-bottom: 1px solid #ccc;
      background: #fff;
      // border-radius: 5px;
      color: #454545;

    }
  }
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;


.login-container {
  position: fixed;
  height: 100%;
  width: 100%;
  background:url('../../../static/img/dl_bg.png') no-repeat; 
  background-size: cover;
  overflow: auto;
  // background-color: $bg;
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 1100px;
    height: 610px;
    padding: 5% 2% 3%;
    margin: 120px auto;
    display: flex;
    background: #ffffff;
  }
  .formStyle{
    width: 57%;
    height: 100%;
    padding: 0 5%;
    .bottom{
          width: 100%;
    display: flex;
    text-align: center;
    font-size: 26px;
    font-family: SourceHanSansCN;
    font-weight: 500;
    color: white;
    cursor: pointer;
    margin-top: 14%;
    background-repeat: no-repeat;
    background-size: cover;
    justify-content: center;
    align-items: center;
    height: 12%;
    }
  }
  .tips {
    text-align: center;
    font-size: 14px;
    color: #fff;
    position: relative;
    top:815px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
    a {
      padding-left: .1rem;
      text-decoration: underline;
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
    &_login {
      font-size: 20px;
    }
  }
  .title-container {
    position: relative;
    margin-bottom: 14%;
    text-align: center;
    font-family:PingFangSC;
    color: rgba(67,152,138,1);
    .title {
      font-size: 26px;
      font-weight: bold;
    }
    .sub-title{
    }
    .set-language {
      color: #ccc;
      position: absolute;
      top: 5px;
      right: -30px;
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .thirdparty-button {
    position: absolute;
    right: 35px;
    bottom: 28px;
  }
}
</style>
