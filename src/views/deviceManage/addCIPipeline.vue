<template>
  <div id="content">

      <el-form :model="formValidate" ref="formValidate">
        <el-row>
          <el-col :span="6">
            <el-form-item label="服务器IP" :label-width="formLabelWidth" prop="ip"
                          :rules="{required: true,validator: checkIP, message: '请输入正确IP', trigger: 'blur'}">
              <el-input v-model.trim="formValidate.ip" placeholder="请输入服务器IP" auto-complete="off" style="width: 320px"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="任务名称" :label-width="formLabelWidth" prop="desc"
                          :rules="{ required: true, message:'任务名称不能为空', trigger: 'blur'}">
              <el-input v-model.trim="formValidate.desc" placeholder="请输入任务名称/备注" auto-complete="off" style="width: 320px"></el-input>
            </el-form-item>
          </el-col>
        <el-col :span="6">
          <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id"
                        :rules="{ required: true, message: '项目不能为空', trigger: 'change' }">
            <el-select v-model="formValidate.project_id"  @change="(val)=>{showproject_id();formValidate.project=''}" style="width: 320px">
              <el-option
                v-for="(item,index) in projectList"
                :label="item.name"
                :value="item.id"
                :key="index">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="产品" :label-width="formLabelWidth" prop="project" >
            <el-select v-model="formValidate.project"  @visible-change="getProductList" style="width: 320px" :disabled='formValidate.project_id == ""'>
              <el-option
                v-for="(item,index) in productList"
                :label="item.label"
                :value="item.value"
                :key="index">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        </el-row>
      </el-form>
    <el-row>
      <el-table :data="stage_info_list" border stripe height="620" style="overflow: auto"  class='_table' header-cell-class-name="_table-head">
        <el-table-column label="选择stage/步骤" width="200">
          <template slot-scope="scope">
            <el-select v-model="scope.row.args_template" @change="setRowArgs(scope.$index)">
              <el-option
                v-for="(item,index) in pipelineArgsList"
                :label="item.desc"
                :value="item.args"
                :key="index">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="配置参数">
          <template slot-scope="scope">
                <el-input  v-model.trim="scope.row.args_obj[index]" :placeholder=getPlaceHolder(index) v-for="(item, index) in scope.row.args_obj" :key="index" v-if="isShowSpan(index)">
                  <span slot="prepend" >{{index}}</span>
                </el-input>
          </template>
        </el-table-column>

        <el-table-column label="运行平台">
          <template slot-scope="scope">
            <el-input v-model="scope.row.platform" placeholder="默认为sep.sensetime.com 其他填写例如http://10.9.244.33:9000"></el-input>
          </template>
        </el-table-column>

        <el-table-column label="是否运行" width="100">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.is_run" :active-value="true" ></el-switch>
          </template>
        </el-table-column>

        <el-table-column prop="operation" label="操作" width="230" align="center" :render-header="renderHeader">
          <template slot-scope='props'>
            <el-button @click='copyStep(props.$index)' type="text" class="op-btm">复制</el-button>
            <el-button @click='removeStep(props.$index)' type="text" style="color:#F56C6C" class="op-btm">删除</el-button>
            <!--上移 下移-->
            <el-button type="text" :disabled="props.$index===0"  @click="moveUp(props.$index,props.row)" style="color:orange" class="op-btm">
              上移
            </el-button>
            <el-button type="text" :disabled="props.$index===(stage_info_list.length-1)"  @click="moveDown(props.$index,props.row)" style="color:orange" class="op-btm">
              下移
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <div class="page-footer-right">
        <el-button type="primary" @click="handleSubmit('formValidate')">提交</el-button>
        <el-button type="ghost" @click="handleReset()" style="margin-left: 8px">重置</el-button>
    </div>

  </div>
</template>

<script>
  import { getProjectList } from '@/api/project';
  import { addPerfTask, updatePerfTask, getPerfStrategyList } from '@/api/performance';
  import {getCIProductList,getCIPipelineArgsList,newCIPipeline,updateCIPipeline} from '@/api/ciPipeline';
  import JsonEditor from '@/components/JsonEditor';
  import Cookies from "js-cookie";

  export default {
    name: "addCIPipeline",
    components: { JsonEditor },
    data() {
      return {
        projectList: [],
        productList: [],
        pipelineArgsList: [],
        formValidate: {
          id: 0,
          ip: '',
          project_id: '',
          project: '',
          desc: '',
          report_name: '',
          to_mail: '',
          cc_mail: ''
        },
        currentRow: {},
        stage_info_list: [{args_template:"", stage: "", args: "",args_obj: "",platform:"", is_run: true}],
        formLabelWidth: '90px',
        holder: ''
      }
    },//data
    computed: {
      // isMixed() {
      //   return this.formValidate.type == 'mixed';
      // }
    },//computed
    mounted() {
      this.getParams()
    },
    beforeDestroy () {
      this.$store.dispatch("app/toggleParentNav");
    },
    methods: {
      getPlaceHolder(index) {

        if (index == 'sf_file_name'||index == 'tt_file_name') {
          return "业务安装包，文件存储服务器+全路径，形如：password:root@hostname:/ci/xxx.tar";
        }
        else if (index == "env_file_name") {
          return "基础环境包，文件存储服务器+全路径，形如：password:root@hostname:/ci/xxx.tar";
        }
        else if (index == "is_install_baseEnv") {
          return "是否安装基础环境，0为安装，1为不安装";
        }
        else if (index == "user_name") {
          return "操作者名称";
        }
        else if (index == "mail_send_to"||index == "tomail"||index =="ccmail") {
          return "多个邮箱用英文分号;分隔"
        }
        else if (index == "install_cmd") {
          return "形如：./all_in_on_deploy.sh xxx，注意要指定静默安装选项如--silently"
        }
        else if (index == "system_version") {
          return "可选：7.4，7.4_UEFI，7.2，7.2_UEFI"
        }
        else if (index == "viper_ip") {
          return "多个ip请用英文;分隔"
        }
        else if (index == "expect_proc_num") {
          return "预期起来的jps进程，用于判断服务启动"
        }
      },

      getParams() {
        // 取到路由带过来的参数
        this.getProject();
        this.getArgsList();
        if (this.$route.params.dataObj) {
          let pipeline_obj = this.$route.params.dataObj
          this.formValidate.id = pipeline_obj.id;
          this.formValidate.ip = pipeline_obj.ip;
          this.formValidate.project_id = pipeline_obj.project_id;
          this.formValidate.project = pipeline_obj.project;
          this.formValidate.desc = pipeline_obj.desc;
          this.formValidate.report_name = pipeline_obj.report_name;
          this.formValidate.to_mail = pipeline_obj.to_mail;
          this.formValidate.cc_mail = pipeline_obj.cc_mail;

          this.formValidate.stage_info=pipeline_obj.stage_info
        }

      },
      checkIP(rule, value, callback){
        if(value && "" === value){
          callback(new Error('请输入IP地址'))
        }if (value && !(/((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))/).test(value)) {
          callback(new Error('IP地址不规范'))
        } else {
          callback()
        }
      },
      isShowSpan(key) {
        if (key == 'steps' || key == 'platform') {
          return false
        } else {
          return true
        }
      },
      //向上移动
      moveUp(index,row) {
        var that = this;
        if (index > 0) {
          let upDate = that.stage_info_list[index - 1];
          that.stage_info_list.splice(index - 1, 1);
          that.stage_info_list.splice(index,0, upDate);
        } else {
          alert('已经是第一条，不可上移');
        }
      },
      //向下移动
      moveDown(index,row){
        var that = this;
        if ((index + 1) === that.stage_info_list.length){
          alert('已经是最后一条，不可下移');
        } else {
          let downDate = that.stage_info_list[index + 1];
          that.stage_info_list.splice(index + 1, 1);
          that.stage_info_list.splice(index,0, downDate);
        }
      },
      getProject() {
        let self = this;
        getProjectList().then(function (response) {
          self.projectList = response.data.projects
        }).catch(function (err) {
        });
      },
      showproject_id(){
        console.log('项目id是',this.formValidate.project_id)
      },
      getProductList() {
        let self = this;
        getCIProductList(self.formValidate.project_id).then(function (response) {
          self.productList = response.data.product_list
        }).catch(function (err) {
        });
      },
      getArgsList(){
        let self = this;
        getCIPipelineArgsList({
          platform_id: Cookies.get("platform")
        }).then(function(response) {
          self.pipelineArgsList =  response.data.ci_pipeline_args

          // 补充pipelineArgsList的值
          self.stage_info_list=[]
          let stageinfo=self.formValidate.stage_info
          if (stageinfo != null){
            for (var i = 0; i < stageinfo.length; i++) {
              let temp_item = {};
              temp_item.stage=stageinfo[i].stage
              temp_item.args=stageinfo[i].args
              temp_item.is_run=stageinfo[i].is_run
              temp_item.platform=stageinfo[i].platform
              // 设置对应label
              let obj = {};

              obj = self.pipelineArgsList.find((item)=>{//这里的userList就是上面遍历的数据源
                return item.desc === stageinfo[i].stage;//筛选出匹配数据
              });
              temp_item.args_template=obj.args

              //转换args_obj
              let args_str=temp_item.args.replace(/'/g,"\"")
              let args_obj=JSON.parse(args_str)
              temp_item.args_obj=args_obj
              delete args_obj.platform
              self.stage_info_list.push(temp_item)
            }
          }

        })
      },
      validateFormRule(formName){
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
      handleSubmit(name) {
        let username = this.$store.state.user.uid_name
        username = username.toString().replace(" ", "").toLowerCase()

        let stage_info_list=this.stage_info_list
        if(this.formValidate.ip==""){
          this.$message.error("服务器IP不规范，请检查！");
          return
        }
        if(this.formValidate.project_id==""){
          this.$message.error("项目不规范，请检查！");
          return
        }
        if(this.formValidate.desc==""){
          this.$message.error("任务名称不为空，请检查！");
          return
        }
        if(stage_info_list.length < 1){
          this.$message.error("缺少stage/步骤配置，请检查！");
          return
        }
        for (var i = 0; i < stage_info_list.length; i++) {
          stage_info_list[i].args=JSON.stringify(stage_info_list[i].args_obj)
        }
        if (this.formValidate.id > 0){
          // 编辑
          let ref = this;
          updateCIPipeline({
            id: ref.formValidate.id,
            ip: ref.formValidate.ip,
            project: ref.formValidate.project,
            desc: ref.formValidate.desc,
            report_name: ref.formValidate.report_name,
            to_mail: ref.formValidate.to_mail,
            cc_mail: ref.formValidate.cc_mail,
            editor: username,
            project_id: ref.formValidate.project_id,
            stage_info: ref.stage_info_list
          }).then(function (response) {
            if (response.data.code === 200) {
              ref.$message.success('修改成功!');
              ref.gotoCIPipelineList();
              ref.handleReset();
            } else {
              ref.$message.error(response.data.msg);
            }
          }).catch(function (error) {
            console.log(error);
          });
        } else {
          let ref = this;
          // 新增
          newCIPipeline({
            ip: ref.formValidate.ip,
            project: ref.formValidate.project,
            desc: ref.formValidate.desc,
            report_name: ref.formValidate.report_name,
            to_mail: ref.formValidate.to_mail,
            cc_mail: ref.formValidate.cc_mail,
            owner: username,
            editor: username,
            project_id: ref.formValidate.project_id,
            stage_info: ref.stage_info_list
          }).then(function (response) {
            if (response.data.code === 200) {
              ref.$message.success('提交成功!');
              ref.gotoCIPipelineList();
              ref.handleReset();
            } else {
              ref.$message.error(response.data.msg);
            }
          }).catch(function (error) {
            console.log(error);
          });
        }
      },
      gotoCIPipelineList() {
        this.$router.push({
          path: '/deviceManage/ciPipeline',
          name: '配置CI'
        })
      },
      addStep(){
        this.stage_info_list.push({args_template:"", stage: "", args: "",args_obj:null, platform:"", is_run: true});
      },
      removeStep(index){
        this.stage_info_list.splice(index,1)
      },
      copyStep(index){
        let tmp={args_template:"", stage: "", args: "",args_obj:null, platform:"", is_run: true}
        tmp.args_template=this.stage_info_list[index].args_template
        tmp.stage=this.stage_info_list[index].stage
        tmp.args=this.stage_info_list[index].args
        tmp.args_obj=Object.assign({},this.stage_info_list[index].args_obj);
        tmp.platform=this.stage_info_list[index].platform
        tmp.is_run=this.stage_info_list[index].is_run
        this.stage_info_list.push(tmp);
      },
      renderHeader(h, { column, $index }){
        return h('el-button', {
          props: { icon: 'el-icon-plus', type: 'primary', size: 'mini'},
          on: {
            click: () => {
              this.addStep()
            }
          }
        })
      },
      setRowArgs(index){
        let obj = {};
        obj = this.pipelineArgsList.find((item)=>{//这里的userList就是上面遍历的数据源
          return item.args === this.stage_info_list[index].args_template;//筛选出匹配数据
        });
        this.stage_info_list[index].stage=obj.desc;
        this.stage_info_list[index].args= this.stage_info_list[index].args_template;
        let args_str=this.stage_info_list[index].args_template.replace(/'/g,"\"")
        let args_template=JSON.parse(args_str)
        this.stage_info_list[index].args_obj=args_template
      },
      //重置
       handleReset () {
        this.$refs["formValidate"].resetFields();
        this.formValidate = {
            id: 0,
            ip: '',
            project_id: '',
            project: '',
            desc: '',
            report_name: '',
            to_mail: '',
            cc_mail: ''
        };
    },
    }
  }
</script>

<style scoped>
  ._tip{
    padding: 0 16px;
  }
  .op-btm{
    text-decoration: underline;
  }
</style>
