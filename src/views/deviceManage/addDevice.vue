<template>

  <div id="content">
    <el-row>

      <el-row>
        <el-form :model="ruleForm"  ref="ruleForm" label-width="100px" class="demo-ruleForm">
          <el-form-item label="features" :label-width="formLabelWidth" v-if="false">
            <el-input v-model="ruleForm.features" style="width: 55%" placeholder="F1_2,VA_UT_FF1001"></el-input>
          </el-form-item>
          <el-form-item label="备注:" prop="description" :label-width="formLabelWidth" :rules="{ required: true, message: '请填写备注', trigger: 'blur' }">
            <el-input v-model="ruleForm.description" style="width: 55%" placeholder="仿真环境"></el-input>
          </el-form-item>
          <el-tabs v-model="ruleForm.editableTabsValue" type="card" editable @edit="handleTabsEdit">
            <el-tab-pane
              :key="item.name"
              v-for="(item, index) in ruleForm.editableTabs"
              :label="item.ip"
              :name="item.name"
            >
              <el-form-item label="ip:"  :label-width="formLabelWidth">
                <el-input v-model="item.ip" style="width: 55%" placeholder="" ></el-input>
              </el-form-item>
              <el-form-item label="cobbler_name:" :label-width="formLabelWidth" v-if="false">
                <el-input v-model="item.cobbler_name" style="width: 55%" placeholder="请与cobbler保持一致例如 viper-su-f1-2-102"></el-input>
              </el-form-item>
              <el-form-item label="mac:"  :label-width="formLabelWidth"  v-if="macvisible">
                <el-input v-model="item.mac" style="width: 55%" placeholder="ac:1f:6b:ab:92:be"></el-input>
              </el-form-item>
              <el-form-item label="dns:"  :label-width="formLabelWidth"  v-if="false">
                <el-input v-model="item.dns" style="width: 55%" placeholder="192.168.8.45"></el-input>
              </el-form-item>
              <el-form-item label="gateway:"  :label-width="formLabelWidth"  v-if="false">
                <el-input v-model="item.gateway" style="width: 55%" placeholder="172.20.25.1"></el-input>
              </el-form-item>
              <el-form-item label="BMC_host:"  :label-width="formLabelWidth">
                <el-input v-model="item.ipmi_host" style="width: 55%" placeholder=""></el-input>
              </el-form-item>
              <el-form-item label="BMC_username:"  :label-width="formLabelWidth">
                <el-input v-model="item.ipmi_username" style="width: 55%" placeholder=""></el-input>
              </el-form-item>
              <el-form-item label="BMC_password:"  :label-width="formLabelWidth">
                <el-input v-model="item.ipmi_password" style="width: 55%" placeholder=""></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
          <el-row>
            <el-col :span="4" :offset="10">
              <br/>
              <el-button type="primary" @click="handleSubmit('ruleForm')">提 交</el-button>
              <el-button @click="restoreData">重 置</el-button>
            </el-col>
          </el-row>
        </el-form>
        <!--</el-card>-->

      </el-row>


    </el-row>
  </div>
</template>


<script>
  import { addDevice,updateDevice } from '@/api/device';
  let loading
  export default {
    data() {
      return {
        isTask: true,
        macvisible: true,
        ruleForm: {
          editableTabsValue: '1',
          ip_flag: false,
          editableTabs: [{
            name: '1',
            ip: '',
            mac: '',
            dns: '',
            gateway: '',
            ipmi_username: '',
            ipmi_password: '',
            ipmi_host: ''
          }],
          tabIndex: 2,
          id: '',
          features: '',
          description: ''
        },
        formLabelWidth: '100px'
      };
    },
    mounted() {
      this.getParams()
    },
    methods: {
      getParams () {
        // 取到路由带过来的参数
        if(this.$route.params.dataObj){
          console.log("$route.params.dataObj",this.$route.params.dataObj)
          this.ruleForm.features = this.$route.params.dataObj.features;
          this.ruleForm.description = this.$route.params.dataObj.description;
          this.ruleForm.id = this.$route.params.dataObj.id;
          this.ruleForm.editableTabs = this.$route.params.dataObj.nodeinfo;
          this.ip_flag = true
        }
      },
      handleTabsEdit(targetName, action) {
        this.ruleForm.tabIndex=this.ruleForm.editableTabs.length+2
        if (action === 'add') {
          let newTabName = ++this.ruleForm.tabIndex + '';
          this.ruleForm.editableTabs.push({
            ip: '',
            name: newTabName
          });
          this.ruleForm.editableTabsValue = newTabName;
        }
        if (action === 'remove') {
          let tabs = this.ruleForm.editableTabs;
          let activeName = this.ruleForm.editableTabsValue;
          if (activeName === targetName) {
            tabs.forEach((tab, index) => {
              if (tab.name === targetName) {
                let nextTab = tabs[index + 1] || tabs[index - 1];
                if (nextTab) {
                  activeName = nextTab.name;
                }
              }
            });
          }

          this.ruleForm.editableTabsValue = activeName;
          this.ruleForm.editableTabs = tabs.filter(tab => tab.name !== targetName);
        }
      },
      // checkRequirePara(){
      //   let result = true;
      //   let self = this;
      //   this.ruleForm.editableTabs.forEach(function(device){
      //     console.log('device'+device.ip)
      //     if(!self.validateFormRule(device)){
      //       result = false;
      //     }
      //   })
      //   console.log('card-'+result)
      //   return result;
      // },
      validateFormRule(form){
        console.log(form)
        let result = false;
        form.validate((valid) => {
          if (valid) {
            console.log("validate true")
            result = true;
          }
          else {
            console.log("validate false")
          }
        })
        return result;
      },
      submitForm(formName) {
        if(this.validateFormRule(this.$refs.ruleForm)) {
          console.log('ok')
        }else{
          console.log('no-ok')
        }
      },
      handleSubmit(formName) {
        if(this.validateFormRule(this.$refs.ruleForm)) {
          let self = this;
          if (this.ruleForm.id) {
            self.open3()
            updateDevice({
              features: self.ruleForm.features,
              description: self.ruleForm.description,
              nodeinfo: self.ruleForm.editableTabs,
              id: self.ruleForm.id
            }).then(function (response) {
              console.log(response)
              if (response.data.code === 200) {
                self.restoreData();
                self.open1();
              }else if(response.data.code === 500){
                self.macvisible = true
                self.open2('系统密码未知，获取Mac地址失败，请自行填写！')
              }
              else {
                self.open2(response.data.msg);
              }
            })
          } else {
            self.open3()
            addDevice({
              features: self.ruleForm.features,
              description: self.ruleForm.description,
              nodeinfo: self.ruleForm.editableTabs
            }).then(function (response) {
              console.log(response)
              if (response.data.code === 200) {
                self.restoreData();
                self.open1();
              }else if(response.data.code === 500){
                self.macvisible = true
                self.open2('系统密码未知，获取Mac地址失败，请自行填写！')
              }
              else {
                self.open2(response.data.msg);
              }
            })
          }
        }else{
          console.log('no-ok')
        }
      },
      restoreData(){
        this.$refs["ruleForm"].resetFields();
        this.ruleForm.editableTabs = [{
          name: '1',
          ip: '',
          mac: '',
          dns: '',
          gateway: '',
          ipmi_username: '',
          ipmi_password: '',
          ipmi_host: ''
        }]
        this.ruleForm.features = '';
        this.ruleForm.description = '';
      },
      open1() {
        loading.close()
        this.$message({
          showClose: true,
          message: '保存成功！',
          type: 'success'
        });
      },
      open2(msg) {
        loading.close()
        this.$message({
          showClose: true,
          message: msg,
          type: 'error'
        });
      },
      open3() {
        loading=this.$loading({
          lock: true,
          text: '正在登录服务器获取配置，请稍等...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        setTimeout(() => {
          loading.close();
        }, 30000);
      }

    }
  }
</script>
