<template>
  <div id="content">
    <!-- 搜索 -->
    <el-row>
       <el-button type="primary" size='small' @click="gotoAdd" icon="el-icon-plus" style="float:left">新增</el-button>
       <el-form :inline="true" class="_bottom0 demo-form-inline" style="float:right">
        <el-form-item >
          <el-input v-model="form2.search_ip" style="width: 150px" placeholder="服务器ip" clearable></el-input >
        </el-form-item>
        <el-form-item>
          <el-select v-model="form2.search_project_id" placeholder="项目" clearable>
            <el-option v-for="item in projectList" :value="item.id" :key="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item >
          <el-input v-model="form2.search_desc" style="width: 150px" placeholder="任务名称"  clearable></el-input>
        </el-form-item>
        <el-form-item >
          <el-autocomplete
            class="inline-input"
            v-model="form2.search_owner"
            :fetch-suggestions="queryDefaultsearcher" placeholder="创建用户"
            clearable
            @select="((item)=>handleOwnerSelectMethod(item))">
              <template slot-scope="{ item }">
                  <div class="name">{{ item.value }}</div>
              </template>
          ></el-autocomplete>
        </el-form-item>
        <el-form-item >
          <el-autocomplete
            class="inline-input"
            v-model="form2.search_editor"
            :fetch-suggestions="queryDefaultsearcher" placeholder="修改用户"
            clearable
            @select="((item)=>handleEditorSelectMethod(item))">
              <template slot-scope="{ item }">
                  <div class="name">{{ item.value }}</div>
              </template>
          ></el-autocomplete>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size='small' class="el-button el-button--primary el-button--small is-circle" @click="whenSearch" icon="el-icon-search"></el-button>
        </el-form-item>
      </el-form>

    </el-row>
    <!-- 表格 -->
    <el-row>
      <el-table
              height="690" class='_table' header-cell-class-name="_table-head"
              border :row-key='getRowKeys'
              :expand-row-keys="expands"
              :data="pageList.programData"
              style="width: 100%;" stripe  :key="Math.random()">
        <el-table-column show-overflow-tooltip prop="id" label="id" width="50"></el-table-column>
        <el-table-column show-overflow-tooltip prop="ip" label="服务器IP" width="150"></el-table-column>
        <el-table-column show-overflow-tooltip prop="desc" label="任务名称" width="150"></el-table-column>
        <el-table-column show-overflow-tooltip prop="project_id" :formatter="get_project_name" label="项目"></el-table-column>
        <el-table-column show-overflow-tooltip label="产品">
          <template slot-scope="scope">
            <span>{{strFormat(scope.row.project) }}</span>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="desc" label="任务名称" v-if="false"></el-table-column>
        <el-table-column show-overflow-tooltip prop="to_mail" label="邮件接收人" v-if="false"></el-table-column>
        <el-table-column show-overflow-tooltip prop="cc_mail" label="邮件抄送人" v-if="false"></el-table-column>
        <el-table-column show-overflow-tooltip prop="status" :formatter="getstatus"  label="状态" width="100"></el-table-column>
        <!--<el-table-column show-overflow-tooltip prop="schedule"  label="定时计划"></el-table-column>-->
        <el-table-column type="expand" label="配置详情" width="80">
          <template slot-scope="props">
            <el-table  
            border :data="props.row.stage_info" size="small"  :row-style="tableRowStyle" :header-cell-style="tableHeaderColor">
              <!--<el-table-column show-overflow-tooltip prop="stage_id" label="ID" width="50"></el-table-column>-->
              <el-table-column show-overflow-tooltip prop="stage" label="stage" width="200"></el-table-column>
              <el-table-column show-overflow-tooltip prop="is_run" :formatter="getCIStatus"  label="是否运行" width="80"></el-table-column>
              <el-table-column show-overflow-tooltip prop="args" label="参数"></el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="250">
          <template slot-scope='props'>
            <div class="table-text">{{'创建：'+dateFormat(props.row.created_time)}}</div>
            <div class="table-text">{{'修改：'+dateFormat(props.row.updated_time)}}</div>
            <div class="table-text">{{'耗时：'+props.row.run_time}}</div>
          </template>
        </el-table-column>
        <el-table-column label="人员" width="200">
          <template slot-scope='props'>
            <div class="table-text">{{'修改：'+props.row.editor}}</div>
            <div class="table-text">{{'创建：'+props.row.owner}}</div>
          </template>
        </el-table-column>
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

    <!--克隆弹窗-->
    <el-dialog title="克隆" :visible.sync="dialogCloneVisible">
      <el-form :model="form"  ref="form">
        <el-form-item label="服务器IP" :label-width="formLabelWidth" prop="ip" :rules="{required: true,validator: checkIP, message: '请输入正确IP', trigger: 'blur'}">
          <el-input v-model="form.ip" auto-complete="off" style="width: 400px;" ></el-input>
        </el-form-item>
        </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCloneVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRecord">保存</el-button>
      </div>
    </el-dialog>

    <!--定时任务弹窗-->
    <el-dialog title="编辑定时任务" :visible.sync="dialogFormVisible">
        <el-form :model="schedule_form"  ref="schedule_form" :data=schedule_form>
          <el-form-item label="cron表达式" prop="crontab_exp" :rules="{required: true, message: '请选择或者输入表达式', trigger: 'change'}">
          <el-autocomplete
          class="inline-input"
          v-model="schedule_form.crontab_exp"
          :fetch-suggestions="queryStockCrontab"
          placeholder="请输入cron表达式"
          clearable
          @select="((item)=>handleSelectMethod(item))">
              <template slot-scope="{ item }">
                  <div class="name">{{ item.value }}</div>
              </template>
          ></el-autocomplete>
            <a :href="'https://crontab.guru/'"
            target="_blank"
            class="buttonText"
            >(点我查看cron语法)</a>
          </el-form-item>
          <el-form-item label="激活开关">
            <el-switch v-model="schedule_form.is_active_cron"></el-switch>
          </el-form-item>
          <el-form-item label="下次运行时间:" prop="next_run_time">
            {{schedule_form.next_run_time}}
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveScheduler">保 存</el-button>
            <el-button type="danger" @click="deleteScheduler">删 除</el-button>
        </div>
    </el-dialog>

  </div>
</template>
<script>
  import { getProjectList } from '@/api/project';
  import {getCIPipelineList,addCIPipeline,deleteCIPipeline,modifyCIPipeline,runCIPipeline,cancelCIPipeline,editSchedules,deleteSchedules,getSchedulesInfo} from '@/api/ciPipeline';
  import moment from 'moment' //引入moment化简时间
  import Cookies from "js-cookie";
  import TableOperator from "../../components/TableOperator/index"; //表格按钮
  export default {
    name: 'CIPipeline',
    components: { TableOperator },
    data() {
      return {
        //表格重构
        operateArray: [
            { label: "运行", click: this.runTask },
            { label: "编辑", click: this.gotoEdit },
            { label: "执行情况", click: this.gotoDetail },
            { label: "克隆", click: this.cloneSelf1 },
            { label: "定时", click: this.getSchedulesJobInfo },
            { label: "删除", click: this.deleteSelf1 },
        ],
        disableFlag: false,
        getRowKeys(row) {
          return row.id
        },
        form: {
          ip: '',
          project_id: '',
          project: '',
          desc: '',
          report_name: '',
          to_mail: '',
          cc_mail: '',
          stage_info: '',
          editor: this.$store.state.user.uid_name,
          owner: this.$store.state.user.uid_name
        },
        schedule_form: {
          description: "",
          crontab_exp: "",
          is_active_cron: false,
          next_run_time: ''
        },
        rowObj: {},
        projectList: [],
        formLabelWidth: '120px',
        pageNums: 10,//每页几条
        pageNum: 1, //当前是第几页
        dialogFormVisible: false,
        dialogCloneVisible:false,
        pageList: {
          page_no: 1,//页面开始页码
          page_size: 10,//每页条数
          count: 0,//总数目
          programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
        },
        expands: [],
        CrontabOptionItems: [
          {label: "每天凌晨12点触发", value: "0 0 * * *"},
          {label: "每天晚上十点触发", value: "0 22 * * *"}
        ],

        searcherOptionItems: [
          {label: this.$store.state.user.uid_name, value: this.$store.state.user.uid_name}
        ],
        form2:{
          search_ip: '',
          search_project_id: '',
          search_desc: '',
          search_editor: 'me',
          search_owner: 'me',
        }
      }

      
    },

    computed: {},

    mounted() {
      //取出
      this.form2=JSON.parse(window.sessionStorage.getItem("form2"))
      if(this.form2===null){
        this.form2={
          search_ip: '',
          search_project_id: '',
          search_desc:'',
          search_editor: 'me',
          search_owner: 'me',
        }
      }
      this.getListByPage();
      this.getProject();
    },

    methods: {
       // 在搜索框返回当前搜索人的建议
      queryDefaultsearcher(queryString, cb){
        let that = this;
        var searcher_list = [];
        that.searcherOptionItems.forEach(item => {
          searcher_list.push({ 'label': item.value, 'value': item.label })
        })
        var results = queryString ? searcher_list.filter(this.createFilterMethod(queryString, that.searcherOptionItems)): searcher_list
        cb(results); // 注意回调
      },
       createFilterMethod(queryString, item) {
        return item => {
            return (
                item.label.toLowerCase().indexOf(queryString.toLowerCase()) === 0
            );
        };
      },

      handleEditorSelectMethod(item) {
          // console.log(item);
          this.form2.search_editor = item.label;
      },

      handleOwnerSelectMethod(item) {
          // console.log(item);
          this.form2.search_owner = item.label;
      },

      handleSelectMethod(item) {
          // console.log(item);
          this.schedule_form.crontab_exp = item.label;
      },

      handleSizeChange(val) {
        this.pageNum = 1;
        this.pageNums = val;
        this.getListByPage();
      },
      handleCurrentChange(val) {//改变页码
        this.pageNum = val;
        this.getListByPage();
      },
      queryStockCrontab(queryString, cb) {
      let that = this;
      var solList = []
      that.CrontabOptionItems.forEach(item => {
      solList.push({ 'label': item.value, 'value': item.label })
      })
      var results = queryString ? solList.filter(this.createFilterMethod(queryString)) : solList
      // 调用 callback 返回建议列表的数据
      cb(results);
      },

      tableRowStyle({ row, rowIndex }) {
        if (row['is_run'] == true){
          return 'background-color: #ffffe1'
        }

      },
      tableHeaderColor({ row, column, rowIndex, columnIndex }) {
        if (rowIndex === 0) {
          return 'background-color: #d6eccb'
        }
      },
      getProject(){
        let self = this;
        getProjectList().then(function (response) {
          self.projectList = response.data.projects;
        }).catch(function (err) {
        });
      },
      get_project_name(row, column){
        let project_id = row[column.property];
        let projectList = this.projectList
        for (var i = 0; i < projectList.length; i++) {
          if (project_id == projectList[i].id){
            return projectList[i].name
            break
          }
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
      getListByPage() {
        let self = this;
        if (self.form2.search_editor === 'me') {
          self.form2.search_editor = this.$store.state.user.uid_name
        };
        if (self.form2.search_owner === 'me') {
          self.form2.search_owner = this.$store.state.user.uid_name
        }
        let params = {
          page_no: self.pageNum,
          page_size: self.pageNums,
          ip: self.form2.search_ip,
          desc: self.form2.search_desc,
          editor: self.form2.search_editor,
          project_id: self.form2.search_project_id,
          platform_id: Cookies.get("platform"),
          owner: self.form2.search_owner
        }

        getCIPipelineList(params).then(function (response) {
          //存入
          window.sessionStorage.setItem("form2",JSON.stringify({
            search_ip:self.form2.search_ip,
            search_project_id:self.form2.search_project_id,
            search_desc:self.form2.search_desc,
            search_owner:self.form2.search_owner,
            search_editor:self.form2.search_editor,
          }))
          self.pageList = {
            page_no: self.pageNum,
            page_size: 10 || self.pageNums,
            count: response.data.total,
            programData: response.data.ci_pipeline
          }
        })
      },
      
      // 搜索时候用到的
      whenSearch(){
        this.pageNum = 1;
        this.getListByPage();
      },

      strFormat(str) {
        if (str === undefined || str === null) {
          return "无";
        }
        return str.toString();
      },
      getstatus(row, column){
        let status = row[column.property];
        if (status === 0) {
          return "未执行";
        } else if (status === 1) {
          return "执行中";
        } else if (status === 2) {
          return "执行完成";
        } else if (status === 3) {
          return "执行异常";
        } else if (status === 4) {
          return "停止";
        }
      },
      getCIStatus(row, column) {
        let status = row[column.property];
        if (status == true) {
          return "是";
        } else {
          return "否";
        }
      },
      cloneSelf1(row, column){
        this.disableFlag = true;
        this.dialogCloneVisible = true;
        this.form.project_id = row['project_id'];
        this.form.id = row['id'];
        this.form.project = row['project'];
        this.form.desc = row['desc'];
        this.form.report_name = row['report_name'];
        this.form.to_mail = row['to_mail'];
        this.form.cc_mail = row['cc_mail'];
        this.form.stage_info = row['stage_info'];
      },

      // 点击定时任务后，获取该pipeline_id绑定的定时任务信息
      getSchedulesJobInfo(row, column) {
        this.disableFlag = true;
        this.dialogFormVisible = true;
        let self = this;
        self.schedule_form.pipeline_id = row['id'];
        self.schedule_form.to_mail = row['to_mail'];
        getSchedulesInfo(self.schedule_form.pipeline_id).then(function (response) {
          if (response.data.code == 200) {
            self.schedule_form.crontab_exp = response.data.Job_info.crontab_exp;
            self.schedule_form.is_active_cron = (response.data.Job_info.is_active==0)? true: false;
            self.schedule_form.next_run_time = (response.data.Job_info.next_run_time==null)? "<定时任务未激活,请激活后保存>": response.data.Job_info.next_run_time;
          } else {
            self.schedule_form.crontab_exp = '';
            self.schedule_form.is_active_cron = false;
            self.schedule_form.next_run_time = '';
          }
        });
      },

      // 保存定时任务信息
      saveScheduler() {
        let ref = this;
        var pipeline_id = ref.schedule_form.pipeline_id;
        var to_mail = ref.schedule_form.to_mail;
        editSchedules({
          "pipeline_id": pipeline_id,
          "crontab_exp": ref.schedule_form.crontab_exp,
          "platform": Cookies.get("platform"),
          "editor": ref.$store.state.user.uid_name,
          "to_mail": to_mail,
          "is_active_cron": ref.schedule_form.is_active_cron? 0: 1
        }).then(function(response){
          if (response.data.code === 200) {
            ref.$message.success(response.data.msg);
            ref.dialogFormVisible = false;
          } else {
            ref.$message.error(response.data.msg);
          }
        }).catch(function(err){});
      },

      deleteScheduler() {
        let ref = this;
        let pipeline_id = ref.schedule_form.pipeline_id;
        deleteSchedules(ref.schedule_form.pipeline_id).then(function (response) {
          if (response.data.code === 200) {
            ref.$message.success(response.data.msg);
            ref.dialogFormVisible = false;          }
          else {
            ref.$message.error(response.data.msg);
          }
        })
          .catch(function (err) {
          });
      },

      deleteSelf1(self) {
        let ref = this;
        this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteCIPipeline(self.id).then(function (response) {
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

      updateSelf1(self) {
        this.disableFlag = true;
        this.form.id = self.id;
        this.form.branch_name = self.branch_name;
        this.form.product = self.product;
        this.form.version = self.version;
        this.form.to_mail = self.to_mail;
        this.form.cc_mail = self.cc_mail;
        this.form.stage_info = self.stage_info;
        this.dialogFormVisible = true;
      },
      gotoDetail(self){
        console.log("self",self);
        //存入
        window.sessionStorage.setItem('programArray',JSON.stringify(self))
        this.$router.push({
          path: '/deviceManage/ciPipelineLog',
          name: 'CI执行详情',
          params: {
            dataObj: self
          }
        })
        this.$store.dispatch('app/toggleChildNav', '/deviceManage/ciPipeline')
      },
      runTask(self){
        let ref = self;
        let reg = this;
        let username = this.$store.state.user.uid_name
        username = username.toString().replace(" ", "").toLowerCase()
        runCIPipeline({
          'id': ref.id,
          'branch_name': ref.branch_name,
          'product': ref.product,
          'version': ref.version,
          'platform': Cookies.get("platform"),
          'editor': username,
          'to_mail': ref.to_mail
        }).then(function (response) {
          if (response.data.code === 200) {
            reg.$message.success("开始运行！");
            reg.dialogFormVisible = false;
            reg.getListByPage();
            reg.resetForm();
          }
          else {
            reg.$message.error(response.data.msg);
          }
        })

      },
      cancelPack(){
        let ref = this;
        this.$confirm('此操作将停止打包任务, 请务必谨慎操作! 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          cancelCIPipeline().then(function (response) {
            alert(response.data.code)
            if (response.data.code === 200) {
              ref.$message.success("已停止");
              ref.dialogFormVisible = false;
              ref.getListByPage();
              ref.resetForm();
            }
            else {
              ref.$message.info(response.data.msg);
            }
          })

        }).catch(() => {
          ref.$message({
            type: 'info',
            message: '已取消'
          });
        });
      },
      // 克隆保存
      saveRecord() {
        let ref = this;
        if (ref.form.ip === '') {
          ref.$message.error('请输入服务器IP')
          return false;
        }
        addCIPipeline({
          'id': ref.form.id,
          'ip': ref.form.ip,
          'project_id': ref.form.project_id,
          'project': ref.form.project,
          'desc': ref.form.desc,
          'report_name': ref.form.report_name,
          'to_mail': ref.form.to_mail,
          'cc_mail': ref.form.cc_mail,
          'stage_info': ref.form.stage_info,
          'editor': ref.$store.state.user.uid_name,
          'owner': ref.form.owner
        }).then(function (response) {
          if (response.data.code === 200) {
            ref.$message.success("保存成功！");
            ref.dialogCloneVisible = false;
            ref.getListByPage();
            ref.resetForm();

            ref.form = [{
              ip: '',
              project_id: '',
              project: '',
              desc: '',
              report_name: '',
              to_mail: '',
              cc_mail: '',
              stage_info: '',
              editor: ref.$store.state.user.uid_name,
              owner: ref.$store.state.user.uid_name
            }]
          }
          else {
            ref.$message.error(response.data.msg);
          }
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
      gotoAdd() {
        // 跳转到新增页面
        this.$router.push({
          path: '/deviceManage/addCIPipeline',
          name: '编辑CI配置'
        })
        this.$store.dispatch('app/toggleChildNav', '/deviceManage/ciPipeline')
      },
      gotoEdit(self) {
        // 跳转到新增页面
        this.$router.push({
          path: '/deviceManage/addCIPipeline',
          name: '编辑CI配置',
          params: {
            dataObj: self
          }
        })
        this.$store.dispatch('app/toggleChildNav', '/deviceManage/ciPipeline')
      },
      resetForm() {
        if (this.$refs["form"] != undefined) {
          this.$refs["form"].resetFields();
        }
      },
      dateFormat(date) {
        if (date === undefined || date == null) {
          return "";
        }
        return moment(date).utcOffset(0).format("YYYY-MM-DD HH:mm:ss");
      }
    }
  }
</script>
<style scoped>

  ._expand_table{
    background: #f0f9eb;
  }

  .block {
    float: right;
    margin-top: 15px;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
  .a {
    color: #99a9bf;
  }
</style>
