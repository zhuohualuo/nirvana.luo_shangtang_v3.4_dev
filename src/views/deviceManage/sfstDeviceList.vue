<template>
  <div id="content">
    <!-- 搜索 -->
    <el-row>
    <el-button type="primary" size='small' @click="addRecord" icon="el-icon-plus" style="float:left">新 增</el-button>
     <el-form :inline="true" class="_bottom0 demo-form-inline" style="float:right">
        <el-form-item label="部署产品">
          <el-select v-model="system_type" clearable style="width: 200px">
            <el-option label="whale-SenseFace" value="0"></el-option>
            <el-option label="SenseTotem" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
        <el-autocomplete
          class="inline-input"
          v-model="user_name"
          :fetch-suggestions="querySearch"
          placeholder="请输入操作人"
          clearable>
        </el-autocomplete>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size='small' class="el-button el-button--primary el-button--small is-circle" @click="getListByPage" icon="el-icon-search"></el-button>
        </el-form-item>
      </el-form>

    </el-row>
    <!-- 表格 -->
    <el-row>
      <el-table
              height="690" border class='_table' header-cell-class-name="_table-head"
              :data="pageList.programData" stripe  :key="Math.random()">
        <el-table-column show-overflow-tooltip prop="id" label="ID" width="50"></el-table-column>
        <el-table-column show-overflow-tooltip prop="system_type" :formatter="systemType_Format" label="部署产品"></el-table-column>
        <el-table-column show-overflow-tooltip prop="hostname"  label="服务器IP"></el-table-column>
        <el-table-column show-overflow-tooltip prop="user_name" label="操作人"></el-table-column>
        <el-table-column show-overflow-tooltip prop="is_clean_install" :formatter="is_clean_install_Format"  label="重装系统"></el-table-column>
        <el-table-column show-overflow-tooltip prop="deploy_status" :formatter="deploy_status_Format" label="部署状态"></el-table-column>
        <el-table-column show-overflow-tooltip prop="server_package" label="业务安装包"></el-table-column>
        <el-table-column show-overflow-tooltip prop="baseEnv_package" label="基础环境包(仅SenseTotem使用)"></el-table-column>
        <el-table-column show-overflow-tooltip prop="cmd" label="操作命令"></el-table-column>
        <el-table-column show-overflow-tooltip prop="updated_time" :formatter="dateFormat" label="操作日期"></el-table-column>
        <table-operator :operateArray="operateArray"></table-operator>
      </el-table>
    </el-row>
    <!-- 分页 -->
    <div class="block">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                     :page-sizes="[10, 15, 20, 50, 100]"
                     :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                     :total="pageList.count">
      </el-pagination>
    </div>
    <!-- 对话框 -->
    <el-dialog title="部署信息"  width=40%
    :visible.sync="dialogFormVisible">
      <el-form :model="form" :rules="formRule" ref="form">
        <el-form-item label="部署产品" prop="system_type" :label-width="formLabelWidth" :rules="{ required: true, message: '请选择部署哪款产品', trigger: 'blur' }">
          <el-radio-group v-model="form.system_type" :onchange="changeForm()">
            <el-radio :label="0">whale-SenseFace</el-radio>
            <el-radio :label="1">SenseTotem</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="部署机器IP" :label-width="formLabelWidth" prop="hostname" :rules="{ required: true, message: '请填写业务机器IP', trigger: 'blur' }">
          <el-input v-model="form.hostname" auto-complete="off" style="width: 400px;" clearable></el-input>
        </el-form-item>
        <el-form-item label="业务安装包" :label-width="formLabelWidth" prop="server_package" v-if="file_name_flag" :rules="{ required: true, message: '请填写业务安装包', trigger: 'blur' }">
          <el-input placeholder="password:root@hostname:/ci/xxx.tar" v-model="form.server_package" auto-complete="off" style="width: 400px;" clearable></el-input>
        </el-form-item>
        <el-form-item label="基础环境包" :label-width="formLabelWidth" prop="baseEnv_package" v-if="env_file_name_flag" :rules="{ required: true, message: '请填写基础安装包', trigger: 'blur' }">
          <el-input v-model="form.baseEnv_package" auto-complete="off" style="width: 400px;" clearable></el-input>
        </el-form-item>
        <el-form-item label="重装系统" prop="is_clean_install" :label-width="formLabelWidth" v-if="is_reinstall_system">
          <el-radio-group v-model="form.is_clean_install" :onchange="changeWhaleSFForm()">
            <el-radio :label=1>否</el-radio>
            <el-radio :label=0>是</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="安装基础环境" prop="is_install_baseEnv" :label-width="formLabelWidth" v-if="is_install_baseEnv_flag">
          <el-radio-group v-model="form.is_install_baseEnv">
            <el-radio :label=1>否</el-radio>
            <el-radio :label=0>是</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item label="系统版本" prop="system_version" :label-width="formLabelWidth" v-if="system_version_flag">
          <!-- <el-radio-group v-model="form.system_version">
              <el-radio label="7.4" v-if="version_74_flag">centos 7.4</el-radio>
              <el-radio label="7.4_UEFI" v-if="version_74_flag">centos 7.4_UEFI</el-radio>
              <el-radio label="7.2">centos 7.2</el-radio>
              <el-radio label="7.2_UEFI">centos 7.2_UEFI</el-radio>
          </el-radio-group> -->
          <el-select v-model="form.version_id" placeholder="请选择" ref="selection">
              <el-option
                v-for="(item,index) in version"
                :key="index"
                :label="item.system_version"
                :value="item.description">
              </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="清理底层数据" prop="is_clean_data" :label-width="formLabelWidth">
          <el-radio-group v-model="form.is_clean_data" :onchange="changeCleanDataForm()">
            <el-radio :label=1>否</el-radio>
            <el-radio :label=0>是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="清理nas" prop="is_clean_nas" :label-width="formLabelWidth" v-if="is_clean_nas_flag">
          <el-radio-group v-model="form.is_clean_nas">
            <el-radio :label=1>否</el-radio>
            <el-radio :label=0>是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Viper_IP" :label-width="formLabelWidth" prop="viper_ip_list" v-if="viper_ip_flag">
          <el-input v-model="form.viper_ip_list" auto-complete="off" placeholder="多个IP用英文;号分隔" style="width: 400px;" clearable></el-input>
        </el-form-item> -->
        <el-form-item label="安装命令" :label-width="formLabelWidth" prop="cmd" v-if="cmd_flag" :rules="{ required: true, message: '请填写安装命令', trigger: 'blur' }">
          <el-input type="textarea" v-model="form.cmd" auto-complete="off" style="width: 400px;" clearable placeholder="请仔细检查安装命令后再提交,并且确认该命令是否支持静默选项如--silently！"></el-input>
        </el-form-item>
        <el-form-item label="收件人" :label-width="formLabelWidth" prop="mail_to">
          <el-input v-model="form.mail_to" auto-complete="off" placeholder="英文;号分隔" style="width: 400px;" clearable></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <!-- <el-button type="primary" @click="saveRecord">保 存</el-button> -->
        <el-button type="primary" @click="saveRecord" v-if="notePad=='add'">保 存</el-button>
        <el-button type="primary" @click="saveEdit" v-else>保 存</el-button>
      </div>
    </el-dialog>


    <el-dialog title="部署进度" :visible.sync="progressVisible">
      <el-button size='small' type='primary' @click='getProgressList(rowObj.id)'>刷新</el-button>
      <el-table
        border :data="progressForm"  :key="Math.random()">
        <el-table-column label="步骤">
          <template slot-scope="scope2">
              <span>{{scope2.row}}
                  <i v-if="scope2.row === ''" class="el-icon-loading"></i>
              </span>
          </template>
        </el-table-column>
      </el-table>
      <br/>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="克隆部署配置" :visible.sync="cloneVisible" width="40%">
      <el-input v-model="form.hostname" clearable>
        <span slot="prepend">新业务机器IP</span>
      </el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cloneVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitClone">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import {getsfstDeviceList,createRecord,getTaskProgress,deleteRecord,cloneSuite,editRecord,getDeployment} from '@/api/deviceResource';
  import moment from 'moment';
  import Cookies from "js-cookie";
  import {getManageMachine,getSystemLog} from "@/api/device";
  import TableOperator from "../../components/TableOperator/index"; //表格按钮
  export default {
    name: 'versionManage',
    components: { TableOperator },
    data() {
      return {
         //表格重构
        operateArray: [
            { label: "部署", click: this.goToDeployment,type:"primary" },
            { label: "编辑", click: this.updateSelf1,type:"warning" },
            { label: "日志", click: this.goToViewLog },
            { label: "执行情况", click: this.executiveSelf1,type:"primary" },
            { label: "克隆", click: this.cloneSelf1,type:"success" },
            { label: "删除", click: this.deleteSelf1,type:"danger" },
        ],
        disableFlag: false,
        form: {
          id: '',
          system_type: 0,
          hostname: '',
          server_package: '',
          // rtsp_package: '',
          // offlineMap_package: '',
          baseEnv_package: '',
          is_clean_install: 1,
          mail_to: '',
          vp_file_name_flag: false,
          offlineMap_package_flag: false,
          cmd_flag: true,
          env_file_name_flag: false,
          is_reinstall_system: true,
          // is_clean_data: 1,
          // is_clean_nas: 1,
          // viper_ip_list: '',
          system_version: "",
          is_install_baseEnv: 0
        },
        rowObj: {},
        is_install_baseEnv_flag: false,
        progressVisible: false,
        file_name_flag: true,
        progressForm: [],
        formLabelWidth: '120px',
        pageNums: 10,//每页几条
        pageNum: 1, //当前是第几页
        dialogFormVisible: false,
        user_name: 'me',
        user_name_list: [],
        system_type: '',
        cloneVisible: false,
        currentRow: {},
        pageList: {
          page_no: 1,//页面开始页码
          page_size: 10,//每页条数
          count: 0,//总数目
          programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
        },
        formRule: {
          project_id: [
            {required: true, message: '请选择项目', trigger: 'blur'},
          ],
          version: [
            {required: true, message: '请输入版本号', trigger: 'blur'},
          ],
          // system_version: [
          //   {required: true, message: '请选择系统版本', trigger: 'blur'},
          // ],
          // is_reinstall_system: [
          //   {required: true, message: '请选择是否重装系统', trigger: 'blur'},
          // ]
        },
        version:[] ,//版本号,
        notePad:"" ,//编辑或新增,
        editId:"", //编辑id参数

      }
    },

    computed: {},

    mounted() {
      //加载页面数据
      this.getManageList()
      if(this.$route.params.dataObj){
        console.log('路由拿到参数',this.$route.params.dataObj);
        this.user_name = this.$route.params.dataObj.user_name;
        this.system_type = this.$route.params.dataObj.system_type;
        this.getListByPage();
      } else {
        this.getListByPage();
      };
      this.user_name_list = this.loadAll();
    },

    methods: {
      //页面加载后获取
      getManageList(){
        let self=this;
         getManageMachine().then(function (response) {
          self.version=response.data.system_version_args
          }).catch(function(err){})
      },
      //执行情况
      executiveSelf1(self){
        this.$router.push({
            path: '/deviceManage/addExecutive',
            name: '执行情况',
            params: {
              dataObj: self
            }
          })
          this.$store.dispatch('app/toggleChildNav', '/deviceManage/sfstDeviceList')
      },
      loadAll() {
        return [
          { "value": this.$store.state.user.uid_name },
        ]
      },

      createFilter(queryString) {
        return (user_name_list) => {
          return (user_name_list.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        };
      },
      querySearch(queryString, cb) {
        var user_name_list = this.user_name_list;
        var results = queryString ? user_name_list.filter(this.createFilter(queryString)) : user_name_list;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      // 跳转到查看日志页面
      goToViewLog(self){
        self.user_name = this.user_name;
        self.system_type = this.system_type;
        if (self.system_type == 1) {
          // self.log_info = self.hostname + ':root:V1p3r1@#$%:/sf_and_st_shell/SenseTotem_deploy.log'
          self.log_info = '/ci/sf-st-deploy-logs/SenseTotem_deploy_'+self.hostname+'.log'
        } else {
          // self.log_info = self.hostname + ':root:V1p3r1@#$%:/sf_and_st_shell/SenseFace_deploy.log'
          self.log_info = '/ci/sf-st-deploy-logs/SenseFace_deploy_'+self.hostname+'.log'
        }
        this.$router.push({
          path: '/deviceManage/viewLog',
          name: "CI执行日志",
          params: {
            dataObj: self
          }
        })
        this.$store.dispatch('app/toggleChildNav', '/deviceManage/sfstDeviceList')
      },
      // log_file="172.20.25.37:root:V1p3r1@#$%^^^:/ci/logs/common-ci-piepline-51.log
      handleSizeChange(val) {
        this.pageNum = 1;
        this.pageNums = val;
        this.getListByPage();
      },
      handleCurrentChange(val) {//改变页码
        this.pageNum = val;
        this.getListByPage();
      },
      systemType_Format(row, column) {
        let type = row[column.property];
        if (type === 0) {
          return "whale-SenseFace";
        } else if (type === 1) {
          return "SenseTotem";
        }
      },
      is_clean_install_Format(row, column) {
        let type = row[column.property];
        if (type === 0) {
          return "是";
        } else if (type === 1) {
          return "否";
        }
      },
      deploy_status_Format(row, column) {
        let type = row[column.property];
        if (type === 0) {
          return "部署中";
        } else if (type === 1) {
          return "部署成功";
        } else if (type === 2) {
          return "部署异常";
        } else if (type === 3) {
          return "未部署";
        }
      },

      changeWhaleSFForm(){
          //用于控制whale的补丁包无需传入cmd参数
            if (this.form.is_clean_install===1){
              this.system_version_flag=false
            } else {
              this.system_version_flag=true
              // 如果是非whale的话系统版本将7.4相关的系统选择抹去
              if (this.form.system_type===0){
                this.version_74_flag=true
              }else{
                this.version_74_flag=false
              }
          }
      },

      // changeCleanDataForm(){
      //     //用于控制whale的补丁包无需传入cmd参数
      //   if (this.form.is_clean_data===1){
      //     this.viper_ip_flag=false
      //     this.is_clean_nas_flag=false
      //   }else{
      //     this.viper_ip_flag=true
      //     this.is_clean_nas_flag=true
      //   }
      // },

      changeForm() {
        if (this.form.system_type===0){
          this.env_file_name_flag=false
          this.cmd_flag=true
          this.is_reinstall_system=true
        }else if (this.form.system_type===1){
          // 当系统为图腾时候展示是否安装基础环境
          // if (this.is_clean_install===1){
          //   this.is_install_baseEnv_flag=true
          // }else{
          //   this.is_install_baseEnv_flag=false
          // }
          this.env_file_name_flag=true
          this.cmd_flag=true
          this.is_reinstall_system=true
        }
      },

      getProgress(self){
        this.progressVisible = true;
        this.rowObj = self;
        this.getProgressList(self.id);
      },
      getProgressList(id){
        let self = this;
        getTaskProgress(id).then(function (response) {
          self.progressForm = response.data.info;
        }).catch(function (err) {
          console.log('获取进度异常')
        });
      },
      getListByPage() {
        let self = this;
        if (self.user_name === 'me')
          self.user_name = this.$store.state.user.uid_name
        getsfstDeviceList({
          page_no: self.pageNum,
          page_size: self.pageNums,
          user_name: self.user_name.trim(),
          system_type: self.system_type
        }).then(function (response) {
          self.pageList = {
            page_no: self.pageNum,
            page_size: 10 || self.pageNums,
            count: response.data.total,
            programData: response.data.deploy_info
          }
        })
      },
      deleteSelf1(self) {
        let ref = this;
        this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteRecord(self.id).then(function (response) {
            if (response.data.code === 200) {
              ref.$message.success("删除成功！");
              ref.getListByPage();
            }
            else {
              ref.$message.error(response.data.msg);
            }
          })
            .catch(function (err) {
            });
        }).catch(() => {
        })
      },

      cloneSelf1(self) {
        this.form= {
          id: self.id,
          hostname: ''
      }
        this.cloneVisible = true;
      },
      submitClone(){
          if(this.form.hostname === ''){
              this.$notify.error("业务机器IP不可以为空！");
                  return false;
              }
          let ref = this;
          cloneSuite(
            {
              hostname: ref.form.hostname,
              user_name: ref.$store.state.user.uid_name
            },
            ref.form.id).then(function (response) {
              if(response.data.code === 200){
                  ref.$message.success("克隆成功！");
                  ref.cloneVisible = false;
                  ref.getListByPage();
              }
              else{
                  ref.$message.error(response.data.msg);
              }
          })
      },
      updateSelf1(self) {
        this.disableFlag = true;
        this.form.system_type = self.system_type;
        this.form.hostname = self.hostname;
        this.form.server_package = self.server_package;
        this.form.baseEnv_package = self.baseEnv_package;
        this.form.is_clean_install = self.is_clean_install;
        this.form.cmd = self.cmd;
        this.form.mail_to = self.mail_to;
        // this.form.is_clean_data = self.is_clean_data;
        // this.form.is_clean_nas = self.is_clean_nas;
        // this.form.viper_ip_list = self.viper_ip_list;
        this.system_version = self.system_version;
        this.dialogFormVisible = true;
        this.notePad="edit"
        this.editId=self.id
      },
      saveRecord() {
        let ref = this;
        if (!ref.validateFormRule('form')) {
          return false;
        }
        // ref.form={
        // }
        createRecord({
          'user_name': ref.$store.state.user.uid_name,
          'system_type': ref.form.system_type,
          'hostname': ref.form.hostname.trim(),
          'server_package': ref.form.server_package.trim(),
          'baseEnv_package': ref.form.system_type == 1 ? ref.form.baseEnv_package.trim(): '',
          'is_clean_install': ref.form.is_clean_install,
          'cmd': ref.form.cmd,
          'mail_to': ref.form.mail_to.trim(),
          // "is_clean_data": ref.form.is_clean_data,
          // "is_clean_nas": ref.form.is_clean_nas,
          // "viper_ip_list": ref.form.viper_ip_list.trim(),
          "system_version": (ref.$refs.selection||"").selectedLabel
        }).then(function (response) {
          if (response.data.code === 200) {
            ref.$message.success("保存成功!");
            ref.dialogFormVisible = false;
            ref.getListByPage();
            ref.resetForm();
          }
          else {
            ref.$message.error(response.data.msg);
          }
        })
      },
      //编辑保存按钮事件
      saveEdit(){
        let ref = this;
        if (!ref.validateFormRule('form')) {
          return false;
        }
        editRecord(ref.editId,{
          'user_name': ref.$store.state.user.uid_name,
          'system_type': ref.form.system_type,
          'hostname': ref.form.hostname.trim(),
          'server_package': ref.form.server_package.trim(),
          'baseEnv_package': ref.form.system_type == 1 ? ref.form.baseEnv_package.trim(): '',
          'is_clean_install': ref.form.is_clean_install,
          'cmd': ref.form.cmd,
          'mail_to': ref.form.mail_to.trim(),
          // "is_clean_data": ref.form.is_clean_data,
          // "is_clean_nas": ref.form.is_clean_nas,
          // "viper_ip_list": ref.form.viper_ip_list.trim(),
          "system_version": (ref.$refs.selection||"").selectedLabel
        }).then(function (response) {
          if (response.data.code === 200) {
            ref.$message.success("保存成功!");
            ref.dialogFormVisible = false;
            ref.getListByPage();
            ref.resetForm();
          }
          else {
            ref.$message.error(response.data.msg);
          }
        })
      },
      //机器部署事件
      goToDeployment(self){
        let ref=this
         this.$confirm('此操作将会覆盖原来的部署, 是否继续?', '是否部署', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          getDeployment(self.id,{
          platform_id: Cookies.get("platform"),
          operator:this.$store.state.user.uid_name
        }).then(function (response) {
            if (response.data.code === 200) {
              ref.$message.success(response.data.msg);
            }
            else {
              ref.$message.error(response.data.msg);
            }
          }).catch(function (err) {
            });
        }).catch(() => {
        })
      },
      validateFormRule(formName) {
        let result = false;
        this.$refs[formName].validate((valid) => {
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
      addRecord() {
        this.resetForm();
        this.dialogFormVisible = true;
        this.notePad="add"
        this.form={
           id: '',
          system_type: 0,
          hostname: '',
          server_package: '',
          rtsp_package: '',
          offlineMap_package: '',
          baseEnv_package: '',
          is_clean_install: 1,
          mail_to: '',
          vp_file_name_flag: false,
          offlineMap_package_flag: false,
          cmd_flag: true,
          env_file_name_flag: false,
          is_reinstall_system: true,
          // is_clean_data: 1,
          // is_clean_nas: 1,
          // viper_ip_list: '',
          system_version: "",
          is_install_baseEnv: 0
        }
      },
      resetForm() {
        if (this.$refs["form"] != undefined) {
          this.$refs["form"].resetFields();
        }
      },
      dateFormat(row, column) {
        let date = row[column.property];
        if (date === undefined || date == null) {
        return "";
        }
        return moment(date).format("YYYY-MM-DD HH:mm:ss");
      },
      handleClose(done) {
        this.$confirm('确认关闭窗口？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
    }
  }
</script>
<style scoped>
  .block {
    float: right;
    margin-top: 15px;
  }
</style>
