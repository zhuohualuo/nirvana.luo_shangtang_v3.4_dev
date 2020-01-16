<template>
    <div id="content">
        <el-row>
            <el-form :inline="true" class="_bottom0 demo-form-inline">
                 <el-form-item>
                    <el-button type="primary" size="small" @click="viewHistoryReports">查看历史聚合报告</el-button>
                </el-form-item>
                <el-form-item>
                    <el-checkbox v-model="form.worker_id" border size="small" @change="viewTask">只看我的</el-checkbox>
                </el-form-item>
                <div class="_right">
                    <el-form-item>
                        <el-select v-model="form.point" clearable filterable placeholder="测试名称">
                            <el-option v-for="(item,index) in pointList" :value="item" :key="index" :label="item"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-select v-model="form.result" clearable multiple placeholder="运行结果" >
                            <el-option value="SUCCESS" key="SUCCESS" label="成功"></el-option>
                            <el-option value="FAILED" key="FAILED" label="失败"></el-option>
                            <el-option value="STOPPED" key="STOPPED" label="已停止"></el-option>
                            <el-option value="RUNNING" key="RUNNING" label="运行中"></el-option>
                            <el-option value="WAITING" key="WAITING" label="待执行"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-input v-model="form.operator" placeholder="操作人" clearable ></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-select v-model="form.project" clearable placeholder="项目">
                            <el-option v-for="item in projectList" :value="item.id" :key="item.id" :label="item.name"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" size='mini' circle @click="seachCondition" icon="el-icon-search"></el-button>
                    </el-form-item>
                </div>
            </el-form>
        </el-row>
        <el-row>
            <tree-table :key="key" :default-expand-all="defaultExpandAll" :data="taskList.programData" :columns="columns" border @trIndex='trIndex'>
                <template slot="product" slot-scope="{scope}">
                    {{ projectFormat(scope.row.product)}}
                </template>
                 <template slot="create_time" slot-scope="{scope}" >
                    {{ scope.row.create_time }}{{scope.row.end_time?''+scope.row.end_time:''}}
                </template>
                <template slot-scope="{scope}" slot="result">
                  <span v-if="scope.row.result == 'RUNNING'" style="color: #E6A23C;"> 运行中</span>
                  <span v-else-if="scope.row.result == 'SUCCESS'" style="color: #43988A;"> 成功</span>
                  <span v-else-if="scope.row.result == 'FAILED'" style="color: #F56C6C;"> 失败</span>
                  <span v-else-if="scope.row.result == 'STOPPED'" style="color: #F56C6C;"> 已停止</span>
                  <span v-else-if="scope.row.result == 'WAITING'" style="color: #E6A23C;"> 待执行</span>
                </template>
                <template slot-scope='{scope}' slot="operation">
                    <el-col :span="5">
                        <el-button @click='getProgress(scope.row)' type='text' class="_primary" >进 度</el-button>
                    </el-col>
                    <el-col :span="5" :offset="1">
                            <el-button @click='getReport(scope.row)' type="text" class="_primary" >报 告</el-button>
                    </el-col>
                    <el-col :span="5" :offset="1">
                            <el-button @click='runTaskAgain(scope.row)' type="text" class="_warning" :disabled="scope.row.childs == 0?false:true">重新运行</el-button>
                    </el-col>
                    <el-col :span="5" :offset="2">
                      <el-dropdown placement="bottom">
                        <el-button type="text" icon="el-icon-more"></el-button>
                        <el-dropdown-menu slot="dropdown">
                              <el-dropdown-item>
                                <el-button @click='stopRunTask(scope.row)' type="text" class="_danger" :disabled="scope.row.result == 'RUNNING'?false:true">停 止</el-button>
                              </el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </el-col>
                    
                </template>
            </tree-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
            :page-sizes="[50, 100, 300, 500]"
            :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
            :total="taskList.count">
            </el-pagination>
        </div>
  <el-dialog title="测试任务进度" :visible.sync="progressVisible">
      <el-row style="line-height:28px;">
        <el-col :span="17">测试名称: {{rowObj.name}}</el-col>
        <el-col :span="5">状态:
            <span v-if="rowObj.result == 'RUNNING'" style="color: #E6A23C;"> 运行中</span>
            <span v-else-if="rowObj.result == 'SUCCESS'" style="color: #43988A;"> 成功</span>
            <span v-else-if="rowObj.result == 'FAILED'" style="color: #F56C6C;"> 失败</span>
            <span v-else-if="rowObj.result == 'STOPPED'" style="color: #F56C6C;"> 已停止</span>
            <span v-else-if="rowObj.result == 'WAITING'" style="color: #E6A23C;"> 待执行</span>
        </el-col>
        <el-col :span="2">
          <el-button size="mini" type="primary" @click="getProgressList(rowObj.id)">刷新</el-button>
        </el-col>
      </el-row>
      <div class="_table2 textBorder">
        <span v-for="(item,index) in progressForm" :key="index">
          {{item}}
          <br />
        </span>
      </div>
      <br />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="测试参数配置" :visible.sync="detailVisible">
      <div style="max-height: 500px;overflow: auto;">
        <el-form>
          <el-tag class="_configTitle">参数配置</el-tag>
          <el-form-item
            v-for="(item,index) in configForm"
            :label="index"
            :label-width="formLabelWidth"
            :key="index"
          >
            <el-input
              v-model="configForm[index]"
              :disabled="!isReload"
              class="_config"
              type="textarea"
              :autosize="{minRows: 1, maxRows: 4}"
              style="width: 90%"
            ></el-input>
          </el-form-item>
          <el-tag class="_configTitle">邮件发送至(请填写完整邮件地址，以英文逗号分隔)</el-tag>
          <el-form-item label="邮件发送至" :label-width="formLabelWidth">
            <el-input
              v-model="emailForm.to_mail"
              :disabled="!isReload"
              class="_config"
              type="textarea"
              :autosize="{minRows: 1, maxRows: 4}"
              style="width: 90%"
            ></el-input>
          </el-form-item>
          <el-form-item label="抄送至" :label-width="formLabelWidth">
            <el-input
              v-model="emailForm.cc_mail"
              :disabled="!isReload"
              class="_config"
              type="textarea"
              :autosize="{minRows: 1, maxRows: 4}"
              style="width: 90%"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <br />
      <div slot="footer" class="dialog-footer">
        <div v-if="isReload">
          <el-button @click="detailVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmRerun">执行任务</el-button>
        </div>
        <div v-else>
          <el-button type="primary" @click="detailVisible = false">确 定</el-button>
        </div>
      </div>
    </el-dialog>

        <el-dialog title="查看历史聚合报告" :visible.sync="dialogFormVisible">
            <el-form
                :model="formReport"
                label-width="82px"
                ref="formHistoryReport"
                class="demo-form-inline"
                :rules="formRule"
            >
                <el-col :span="12">
                <el-form-item prop="product" label="项目">
                    <el-select
                    v-model="formReport.product"
                    clearable
                    style="width: 100%"
                    @change="()=>{formReport.version='';formReport.name='';formReport.operator='';clearAdvFilter()}"
                    >
                    <el-option
                        v-for="item in projectList"
                        :value="item.id"
                        :key="item.id"
                        :label="item.name"
                    ></el-option>
                    </el-select>
                </el-form-item>
                </el-col>
                <el-col :span="12">
                <el-form-item prop="name" label="测试点名称">
                    <el-select
                    v-model="formReport.name"
                    clearable
                    style="width: 100%; "
                    :disabled="formReport.product===''"
                    @visible-change="getReportName"
                    @change="()=>{formReport.operator='';switchOptions();}"
                    >
                    <el-option
                        v-for="(item,index) in reportName"
                        :label="item.value"
                        :value="item.value"
                        :key="index"
                    ></el-option>
                    </el-select>
                </el-form-item>
                </el-col>
                <el-col :span="12">
                <el-form-item prop="operator" label="操作人">
                    <el-select
                    v-model="formReport.operator"
                    :disabled="formReport.name===''"
                    clearable
                    style="width: 100%"
                    @visible-change="getReportOperator"
                    >
                    <el-option
                        v-for="(item,index) in reportOperator"
                        :value="item.value"
                        :key="index"
                        :label="item.value"
                    ></el-option>
                    </el-select>
                </el-form-item>
                </el-col>
                <el-col :span="12">
                <el-form-item label="运行结果">
                    <el-select v-model="formReport.result" clearable style="width: 100%"  @change="switchOptions">
                    <el-option value="SUCCESS" key="SUCCESS" label="SUCCESS"></el-option>
                    <el-option value="FAILED" key="FAILED" label="FAILED"></el-option>
                    </el-select>
                </el-form-item>
                </el-col>
                <el-col :span="19">
                <el-form-item label="时间">
                    <el-date-picker
                    style="width:100%"
                    v-model="datePickerTime"
                    type="datetimerange"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :picker-options="pickerOptions2"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    :default-time="['00:00:00', '23:59:59']"
                    ></el-date-picker>
                </el-form-item>
                </el-col>
                <el-col :span="5">
                <el-form-item label-width="10px">
                    <el-button
                    type="primary"
                    round
                    size="small"
                    icon="el-icon-circle-plus"
                    @click="addConfigParam"
                    >高级筛选</el-button>
                </el-form-item>
                </el-col>
            </el-form>
            <div style="max-height:160px;width:100%; overflow-y:auto">
                <el-form label-width="82px">
                <el-form-item v-for="(item,i) in configBox" :key="i" label="筛选条件">
                    <el-col :span="12">
                    <el-select
                        placeholder="请选择"
                        filterable
                        style="width: 100%;"
                        v-model="item.name"
                        :key="'select1' + i"
                        @change="configBox[i].value=''"
                    >
                        <el-option
                        v-for="(op,inde) in configKey"
                        :label="op.label"
                        :value="op.label"
                        :key="inde"
                        :disabled="op.disabled"
                        ></el-option>
                    </el-select>
                    </el-col>
                    <el-col :span="10">
                    <el-select
                        placeholder="请选择"
                        filterable
                        style="width: 100%; "
                        v-model="item.value"
                        :key="'select2' + i"
                        @visible-change="getConfigValue(i)"
                        :disabled="configBox[i].name===''"
                    >
                        <el-option v-for="(op,ind) in configValue" :label="op" :value="op" :key="ind"></el-option>
                    </el-select>
                    </el-col>
                    <el-col :span="2">
                    <el-button
                        type="text"
                        icon="el-icon-remove"
                        size="mini"
                        @click="removeConfigParam(i)"
                    ></el-button>
                    </el-col>
                </el-form-item>
                </el-form>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveConfigManage">提 交</el-button>
            </div>
            </el-dialog>
  </div>
</template>
<script>
import treeTable from "@/components/TreeTable";
import { mapGetters } from "vuex";
import { getProjectList, getVersionList } from "@/api/project";
import { getTaskList } from "@/api/precision";
import {
  getTaskProgress,
  reloadTask,
  getEmail,
  stopTask,
  downloadResult,
  getTaskListChild
} from "@/api/precision";
import {
  getReportName,
  getReportOperator,
  getReportConfig,
  getReportUrl
} from "@/api/precision";
import { openFile } from "@/api/others";
import moment, { defineLocale, defaultFormat } from "moment"; //引入moment格式化时间
const rootPath = process.env.BASE_API;

    export default {
        name: 'taskList',
        components: { treeTable },
        data() {
            return {
                formRule: {
                  product: [{ required: true, message: "请选择项目", trigger: "change" }]
                },
                pickerOptions2: {
                    shortcuts: [
                    {
                        text: "最近一周",
                        onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit("pick", [start, end]);
                        }
                    },
                    {
                        text: "最近一个月",
                        onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit("pick", [start, end]);
                        }
                    },
                    {
                        text: "最近三个月",
                        onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        picker.$emit("pick", [start, end]);
                        }
                    }
                    ]
                },
                checked: false,
                defaultExpandAll: false,
                key:1,
                columns:[
                    {
                        label: '序号',
                        key: '_indexXH',
                        width:100
                    },
                    {
                        label: '测试名称',
                        key: 'name',
                        align:'left',
                        expand:true
                    },
                    {
                        label: '项目',
                        key: 'product',
                        width:100
                    },
                    {
                        label: '开始时间/结束时间',
                        key: 'create_time',
                        width:150
                    },
                    {
                        label: '耗时/秒',
                        key: 'loss_time',
                        width:70
                    },
                    {
                        label: '运行结果',
                        key: 'result',
                        width:100
                    },
                    {
                        label: '操作人',
                        key: 'operator',
                        width:130
                    },
                    {
                        label: '操作',
                        key: 'operation',
                        width:250
                    }
                ],

                configKey:[],
                cloneConfigKey:[],
                configValue:[],
                datePickerTime: [new Date(new Date() - 7 * 24 * 3600 * 1000), new Date()], //时间
                formReport:{//历史报告form
                    product:'',
                    version:'',
                    name:'',
                    operator:'',
                    result:''
                },
                configBox:[],//用户输入的config
                reportConfig:[],//接口返回的config
                reportOperator:[],
                reportName:[],
                reportProduct:[],
                reportVersion:[],
                dialogFormVisible: false,//历史报告框
                loading: false,
                expands: [],
                expandRow: {},
                form: {
                    project: "",
                    version: "",
                    point: "",
                    result: "",
                    operator: "",
                    worker_id: false,
                    report_id:''
                },
                configForm: {},
                emailForm: {to_mail:'',cc_mail:''},
                arrayPara: [],
                progressForm: [],
                rowObj: {},
                multipleSelection: [],
                projectList: [],
                versionList: [],
                versionList1: [],
                pointList: [],
                pageNums: 50,//每页几条
                pageNum: 1, //当前是第几页
                formLabelWidth: '120px',
                detailVisible: false,
                progressVisible: false,
                isReload: false,
                taskList: {
                    page_no: 1,//页面开始页码
                    page_size: 50,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
            }
        },
        computed: {
          ...mapGetters(["name"])
        },
  mounted() {
    this.getProject();
    this.getAllVersion();
    this.getCaseListByPage();
  },
  watch: {
    configBox(){
      this.OptionValue();
    }
  },
  methods: {
    trIndex(e, index) {
      getTaskListChild({ task_id: e.id }).then(response => {
        if (response.data.code === 0) {
          let temArr = e._id.split("-");
          if (temArr) {
            switch (temArr.length) {
              case 1:
                this.$set(
                  this.taskList.programData[temArr[0]],
                  "children",
                  response.data.tasks
                );
                this.$nextTick(() => {
                  this.$set(
                    this.taskList.programData[temArr[0]],
                    "_expand",
                    true
                  );
                });
                return;
              case 2:
                this.$set(
                  this.taskList.programData[temArr[0]].children[temArr[1]],
                  "children",
                  response.data.tasks
                );
                this.$nextTick(() => {
                  this.$set(
                    this.taskList.programData[temArr[0]],
                    "_expand",
                    true
                  );
                  this.$set(
                    this.taskList.programData[temArr[0]].children[temArr[1]],
                    "_expand",
                    true
                  );
                });
                return;
              case 3:
                this.$set(
                  this.taskList.programData[temArr[0]].children[temArr[1]]
                    .children[temArr[2]],
                  "children",
                  response.data.tasks
                );
                this.$nextTick(() => {
                  this.$set(
                    this.taskList.programData[temArr[0]].children[temArr[1]]
                      .children[temArr[2]],
                    "_expand",
                    true
                  );
                });
                return;
              case 4:
                this.$set(
                  this.taskList.programData[temArr[0]].children[temArr[1]]
                    .children[temArr[2]].children[temArr[3]],
                  "children",
                  response.data.tasks
                );
                this.$nextTick(() => {
                  this.$set(
                    this.taskList.programData[temArr[0]].children[temArr[1]]
                      .children[temArr[2]].children[temArr[3]],
                    "_expand",
                    true
                  );
                });
                return;
              default:
                return "";
            }
          }
        } else {
          this.$message.error(response.data.msg);
        }
      });
    },
    addConfigParam() {
      if (this.formReport.name == "") {
        return this.$message.error("请填写测试点名称！");
      }
      if(this.configKey.length===0){
        return this.$message.warning("该测试用例暂无配置!");
      }
      this.configBox.splice(0, 0, { name: "", value: "" });
    },
    removeConfigParam(index) {
      this.configBox.splice(index, 1);
    },
    saveConfigManage(){
        if(this.validateFormRule('formHistoryReport')){
            getReportUrl({
                product:this.formReport.product,
                name:this.formReport.name,
                operator:this.formReport.operator,
                result:this.formReport.result,
                time:this.datePickerTime,
                config:this.configBox,
            }).then(e=>{
                if(e.data.code == 0){
                    var ow = window.open();
                    ow.document.write(e.data.data);
                }else{
                    this.$message.error(e.data.msg)
                }
            })
        }
    },
    getConfigValue(i) {
      this.configValue = [];
      if (this.configBox && this.configBox.length >= i) {
        for(let key in this.reportConfig){
            if (this.configBox[i].name == key) {
              this.configValue = this.reportConfig[key];
            }
        }
      }
    },
    getReportConfig() {
      getReportConfig({
        product: this.formReport.product,
        name: this.formReport.name,
        operator: this.formReport.operator
      }).then(e => {
        this.configKey = [];
        this.cloneConfigKey=[];
        if(e.data.code == 0) {
          this.reportConfig = e.data.data;
          for(let key in this.reportConfig){
            if(this.reportConfig[key].length!=0){
              this.configKey.push({label:key+'',value:this.reportConfig[key]+''});
              this.cloneConfigKey.push({label:key+'',value:this.reportConfig[key]+''});
            }
          }
        } else {
          this.$message.error(e.data.msg);
        }
      });
    },
    getReportOperator() {
      getReportOperator({
        product: this.formReport.product,
        name: this.formReport.name
      }).then(e => {
        if (e.data.code == 0) {
          this.reportOperator = e.data.data;
        } else {
          this.$message.error(e.data.msg);
        }
      });
    },
    getReportName() {
      getReportName({
        product: this.formReport.product,
      }).then(e => {
        if (e.data.code == 0) {
          this.reportName = e.data.data;
        } else {
          this.$message.error(e.data.msg);
        }
      });
    },
    getReportVersion() {
      getVersionList({ project_id: this.formReport.product }).then(e => {
        if (e.data.code == 0) {
          this.reportVersion = e.data.version;
        } else {
          this.$message.error(e.data.msg);
        }
      });
    },
    viewHistoryReports() {
      this.formReport = {
        //历史报告form
        product: "",
        version: "",
        name: "",
        operator: "",
        result: ""
      };
      this.configBox=[];
      this.dialogFormVisible = true;
    },
    getRowClassName({ row, rowIndex }) {
      //隐藏>符号
      if (row.childs && row.childs.length == 0) {
        return "row-expand-cover";
      }
    },
    projectFormat: function(value) {
      if (value == undefined || this.projectList.length == 0) return "无";
      let tmp = this.projectList.filter(function(item) {
        return item.id == value;
      });
      if (tmp.length > 0) {
        return tmp[0].name;
      } else {
        return "项目不存在";
      }
    },
    versionFormat: function(value) {
      if (value == undefined || this.versionList.length == 0) return " / 无";
      let tmp = this.versionList.filter(function(item) {
        return item.id == value;
      });
      if (tmp.length > 0) {
        return " / " + tmp[0].version;
      } else {
        return " / 版本不存在";
      }
    },
    getCaseListByPage() {
      let self = this;
      let params = {
        page_no: this.pageNum,
        page_size: this.pageNums,
        product: this.form.project,
        name: this.form.point,
        result: this.form.result.join(","),
        operator: this.form.operator,
        report_id: this.form.report_id
      };
      if (this.form.worker_id) {
        params["operator"] = this.name;
      }
      getTaskList(params)
        .then(function(response) {
          self.taskList = {
            page_no: self.pageNum,
            page_size: 50 || self.pageNums,
            count: response.data.total,
            programData: response.data.result
          };
          self.pointList =
            self.pointList.length == 0
              ? response.data.task_name
              : self.pointList;
        })
        .catch(function(err) {});
    },
    para2Str(obj) {
      this.arrayPara = [];
      let tmp = {};
      for (var key in obj) {
        let value = obj[key];
        let type = Object.prototype.toString.call(value);
        if (type === "[object Array]") {
          value = value.join(",");
          this.arrayPara.push(key);
        }
        this.$set(tmp, key, value);
      }
      return tmp;
    },
    getProgressList(id) {
      let self = this;
      getTaskProgress({ task_id: id })
        .then(function(response) {
          self.progressForm = response.data.progress;
          if (response.data.result == "RUNNING") {
            self.progressForm.push("");
          }
        })
        .catch(function(err) {});
    },
    runTaskAgain(self) {
      this.rowObj = self;
      this.isReload = true;
      this.detailVisible = true;
      getEmail({ task_id: self.id }).then(e => {
        this.emailForm = {
          to_mail: e.data.mail ? e.data.mail.to_mail.join(",") : "",
          cc_mail: e.data.mail ? e.data.mail.cc_mail.join(",") : ""
        };
        this.configForm = this.para2Str(e.data.config);
      });
    },
    para2Arr(obj) {
      let tmp = {};
      for (var key in obj) {
        let value = obj[key];
        if (this.arrayPara.indexOf(key) !== -1) {
          value = value.split(",");
        }
        this.$set(tmp, key, value);
      }
      return tmp;
    },
    confirmRerun() {
      for (let i in this.configForm) {
        if (!this.configForm[i]) return this.$message.error(`${i} 不可以为空`);
      }
      let ref = this;
      reloadTask({
        task_id: this.rowObj.id,
        product: this.rowObj.product,
        config: this.para2Arr(this.configForm),
        mail: {
          to_mail:
            this.emailForm.to_mail === ""
              ? []
              : this.emailForm.to_mail.split(","),
          cc_mail:
            this.emailForm.cc_mail === ""
              ? []
              : this.emailForm.cc_mail.split(",")
        }
      })
        .then(function(response) {
          if (response.data.code === 0) {
            ref.$message.success("任务已重新执行，请稍后查看进度和报告！");
            ref.detailVisible = false;
            ref.pageNum = 1;
            ref.getCaseListByPage();
            ref.expands = [];
            ref.expandRow = {};
            setTimeout(()=>{
              ref.getCaseListByPage();
            },3000)
          } else {
            ref.$message.error(response.data.msg);
          }
        })
        .catch(function(err) {});
    },
    stopRunTask(self) {
      let ref = this;
      this.$confirm("此操作将无法撤销, 是否继续?", "停止执行", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        stopTask({ task_id: self.id })
          .then(function(response) {
            if (response.data.code == 0) {
              ref.$message.success("任务已停止执行！");
            } else {
              ref.$message.error(response.data.msg);
            }
          })
          .catch(function(err) {});
      });
    },
    getProgress(self) {
      this.progressVisible = true;
      this.rowObj = self;
      this.getProgressList(self.id);
    },
    getReport(self) {
      window.open(
        `${rootPath}/precision/report/get?task_id=${self.id}`
      );
    },
    getProject() {
      let self = this;
      getProjectList()
        .then(function(response) {
          self.projectList = response.data.projects;
        })
        .catch(function(err) {});
    },
    getAllVersion() {
      let self = this;
      getVersionList()
        .then(function(response) {
          self.versionList = response.data.version;
        })
        .catch(function(err) {});
    },
    getVersion(flag) {
      if (flag === true) {
        let self = this;
        getVersionList({ project_id: self.form.project }).then(function(
          response
        ) {
          self.versionList1 = response.data.version;
        });
      }
    },
    dateFormat(row, column) {
      var date = row[column.property];
      if (date == undefined) {
        return "";
      }
      return moment(date).format("YYYY-MM-DD HH:mm:ss");
    },
    handleSizeChange(val) {
      this.pageNum = 1;
      this.pageNums = val;
      this.getCaseListByPage();
    },
    handleCurrentChange(val) {
      //改变页码
      this.pageNum = val;
      this.getCaseListByPage();
    },
    seachCondition() {
      this.pageNum = 1;
      this.getCaseListByPage();
    },
    viewTask() {
      this.pageNum = 1;
      this.expands = [];
      this.expandRow = {};
      this.getCaseListByPage();
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
    OptionValue(a){
      this.configKey = JSON.parse(JSON.stringify(this.cloneConfigKey));
        for(let index=0;index<this.configKey.length;index++){
          for(let i=0;i<this.configBox.length;i++){
            if(this.configBox.length!=0){
              if(this.configKey[index].label==this.configBox[i].name){
                this.configKey[index].disabled=true;
              }
            }
          }
        }
    },
    clearAdvFilter(){
      this.configBox=[];
    },
    switchOptions(){
      this.clearAdvFilter();
      this.getReportConfig();
    },
  }
};
</script>
<style scoped>
._right {
  display: block;
  float: right;
}

._table {
  height: 690px;
  overflow: auto;
  margin-top: 15px;
}

._table2 {
  height: 490px;
  overflow: auto;
  margin-top: 20px;
}

.el-table::before {
  height: 0;
}

.block {
  float: right;
  margin-top: 15px;
}

.el-tag + .el-tag {
  margin-left: 10px;
  margin-top: 8px;
}
._filter.demo-form-inline .el-form-item {
  margin-bottom: 0;
}
.textBorder {
  border: 1px solid #cccccc;
  padding-left: 1%;
}
</style>
<style>
.row-expand-cover .el-icon-arrow-right {
  visibility: hidden;
}
._config.el-textarea.is-disabled .el-textarea__inner {
  color: #606266;
  border: none;
}
._primary:not(.is-disabled){
  color: #43988A;
  text-decoration:underline;
}
._danger:not(.is-disabled){
  color: #F56C6C;
  text-decoration:underline
}
._warning:not(.is-disabled){
  color: #E6A23C;
  text-decoration:underline
}
._info:not(.is-disabled){
  color: #606266;
  text-decoration:underline
}
._configTitle{
    font-size: 16px;
    margin: 10px 0;
}
</style>
