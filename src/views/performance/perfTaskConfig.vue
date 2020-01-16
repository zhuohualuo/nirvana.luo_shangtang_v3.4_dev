<template>
  <div id="content">
    <el-row>
      <div class="_left">
        <el-button type="primary" size='small' @click="addConfig" icon="el-icon-plus">新 增</el-button>
      </div>
      <advance-filter :formData="form2" :filterArray="filterArray" @search="seachCondition"></advance-filter>
    </el-row>

    <el-row>
      <el-table :data="pageList.programData"
                height="680" border class='_table' header-cell-class-name="_table-head">
        <el-table-column type="index" width="55" label="序号"></el-table-column>
        <el-table-column show-overflow-tooltip prop="id" label="ID" width="70"></el-table-column>
        <el-table-column show-overflow-tooltip prop="cfg_name" label="配置名称"></el-table-column>
        <el-table-column show-overflow-tooltip prop="project" label="项目" width="200"></el-table-column>
        <el-table-column show-overflow-tooltip prop="executor" label="创建人" width="150"></el-table-column>
        <el-table-column show-overflow-tooltip prop="created_time" label="创建日期" :formatter="dateFormat" width="170"></el-table-column>
        <el-table-column show-overflow-tooltip prop="updated_time" label="修改日期" :formatter="dateFormat" width="170"></el-table-column>
        <table-operator :operateArray="operateArray"></table-operator>
      </el-table>
    </el-row>

    <div class="block">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                     :page-sizes="[20, 30, 50, 100, 150]"
                     :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                     :total="pageList.count">
      </el-pagination>
    </div>

    <el-dialog :title="isEdit?'编辑配置':'新增配置'" :visible.sync="dialogFormVisible">
      <el-row>
        <el-col :span="20">
          <el-form :model="form" :rules="formRule" ref="form" :inline="true" class="demo-form-inline">
            <el-form-item label="项目" prop="project_id">
              <el-select v-model="form.project_id" auto-complete="off">
                <el-option
                        v-for="(item,index) in projectList"
                        :label="item.name"
                        :value="item.id"
                        :key="index">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="名称" prop="cfg_name">
              <el-input v-model.trim="form.cfg_name" auto-complete="off"></el-input>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="4">
          <el-input v-model="configFilter" placeholder="筛选Key" auto-complete="off" suffix-icon="el-icon-search" clearable></el-input>
        </el-col>
      </el-row>
      <div class="_left" style="margin-bottom: 5px">
        <el-button type="primary" size='small' @click="addConfigParam" icon="el-icon-plus">新 增</el-button>
      </div>
      <el-table :data="configShowList" height="490" border class='_table' header-cell-class-name="_table-head">
        <el-table-column show-overflow-tooltip>
          <template slot="header" slot-scope="scope">
            <span style="color: #F56C6C">* </span><span>参数</span>
          </template>
          <template slot-scope='props'>
            <el-input v-model="props.row.name"></el-input>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip>
          <template slot="header" slot-scope="scope">
            <span style="color: #F56C6C">* </span><span>值</span>
          </template>
          <template slot-scope='props'>
            <el-input v-model="props.row.value"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90">
          <template slot-scope='props'>
            <el-button type="text" @click="removeConfigParam(props.$index)" class="op-btm">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveConfigManage">保 存</el-button>
      </div>
    </el-dialog>

    <el-dialog title="查看配置" :visible.sync="detailVisible" width="40%">
      <el-table :data="configForm"
                height="490" border class='_table' header-cell-class-name="_table-head">
        <el-table-column show-overflow-tooltip prop="name" label="Key"></el-table-column>
        <el-table-column show-overflow-tooltip prop="value" label="Value"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailVisible = false">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="克隆配置" :visible.sync="cloneVisible" width="40%">
      <el-input v-model.trim="form.cfg_name">
        <span slot="prepend">新配置名称</span>
      </el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cloneVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitClone">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import AdvanceFilter from "../../components/AdvanceFilter/index";
  import TableOperator from "../../components/TableOperator/index";
  import { FilterProject, FilterVersion, FilterModule, FilterCaseType, FilterKey } from '@/common/index';
  import { getConfigList, createConfig, cloneConfig, updateConfig, deleteConfig } from '@/api/performance';
  import { getKeyList } from '@/api/config';
  import { getProjectList } from '@/api/project';
  import moment from 'moment' //引入moment化简时间

  export default {
    name: "perfTaskConfig",
    components: {TableOperator, AdvanceFilter},
    data() {
      return {
        form: {
          id: 0,
          project_id: '',
          cfg: {},
          cfg_name: ''
        },
        form2: {
          project_id: '',
          id: '',
          title: '',
          executor:'',
        },
        projectList: [],
        paramsForm: [],
        configForm: [],
        configFilter: '',
        formLabelWidth: '150px',
        pageNums: 20,//每页几条
        pageNum: 1, //当前是第几页
        dialogFormVisible: false,
        detailVisible: false,
        cloneVisible: false,
        isEdit: false,
        pageList: {
          page_no: 1,//页面开始页码
          page_size: 20,//每页条数
          count: 0,//总数目
          programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
        },
        formRule: {
          project_id: [
            { required: true, message: '请选择项目', trigger: 'change' },
          ],
          cfg_name: [
            { required: true, message: '请填写名称', trigger: 'change' },
          ]
        },
        filterArray: [
          {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject},
          {key:'id',name:'ID',type:'input'},
          {key:'title',name:'配置名称',type:'input'},
          {key:'executor',name:'创建人',type:'input'},
        ],
        operateArray: [
          {label:'查看', click:this.viewSelf1},
          {label:'编辑', click:this.updateSelf1},
          {label:'克隆', click:this.cloneSelf1},
          {label:'删除', click:this.deleteSelf1}
        ],
      }
    },

    computed: {
      configShowList: function() {
        let filter = this.configFilter || '';
        return this.configForm.filter(function(item) {
          return item.name.match('.*' + filter + '.*')
        })
      }
    },

    mounted() {
      this.getListByPage();
      this.getProject();
    },

    methods: {
      handleSizeChange(val) {
        this.pageNum = 1;
        this.pageNums = val;
        this.getListByPage();
      },
      handleCurrentChange(val) {//改变页码
        this.pageNum = val;
        this.getListByPage();
      },
      getListByPage() {
        let self = this;
        getConfigList({
            page_no: self.pageNum,
            page_size: self.pageNums,
            project_id: self.form2.project_id,
            id: self.form2.id,
            title: self.form2.title,
            executor : self.form2.executor,
        }).then(function (response) {
          console.log(response)
          self.pageList = {
            page_no: self.pageNum,
            page_size: 20 || self.pageNums,
            count: response.data.total,
            programData: response.data.keys
          }
        })
      },
      rowToFrom(self){
        this.form.id = self.id;
        this.form.project_id = self.project_id;
        this.form.cfg_name = self.cfg_name;
        this.form.cfg = self.cfg;
        this.configForm = [];
        for(var key in self.cfg){
          this.configForm.push({name: key, value: self.cfg[key].toString()})
        }
      },
      viewSelf1(self){
        this.rowToFrom(self);
        this.detailVisible = true;
      },
      updateSelf1(self) {
        this.configFilter = '';
        this.isEdit = true;
        this.rowToFrom(self);
        this.dialogFormVisible = true;
      },
      addConfigParam(){
        this.configFilter = '';
        this.configForm.splice(0,0,{name: '', value: ''})
      },
      removeConfigParam(index){
        this.configForm.splice(index,1)
      },
      cloneSelf1(self){
        this.form= {
          id: self.id,
          project_id: '',
          cfg: {},
          cfg_name: ''
        }
        this.cloneVisible = true;
      },
      deleteSelf1(self) {
        let ref = this;
        this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(()=> {
          deleteConfig(self.id).then(function (response) {
            console.log(response)
            if (response.data.code === 0) {
              ref.$message.success("删除成功！");
              ref.getListByPage();
            }
            else {
              ref.$message.error(response.data.msg);
            }
          })
            .catch(function (err) {
            });
        }).catch(() => {})
      },
      submitClone(){
        if(this.form.cfg_name === ''){
          this.$notify.error("新配置名称不可以为空！");
          return false;
        }
        let ref = this;
        cloneConfig({
          id: ref.form.id,
          name: ref.form.cfg_name,
        }).then(function (response) {
          console.log(response)
          if (response.data.code === 0) {
            ref.$message.success("克隆成功！");
            ref.cloneVisible = false;
            ref.getListByPage();
            ref.resetForm();
          }
          else {
            ref.$message.error(response.data.msg);
          }
        })
      },
      saveConfigManage() {
        if (!this.validateFormRule('form')) {
          return false;
        }
        this.form.cfg = {};
        for(let item of this.configForm){
          if(item.name === '' || item.value === ''){
            this.$notify.error("参数名或值不可以为空！");
            return false;
          }
          else{
            this.form.cfg[item.name] = item.value;
          }
        }
        let ref = this;
        //id大于0时为编辑，小于等于0为新增
        if(ref.form.id > 0){
          updateConfig(ref.form.id, ref.form).then(function (response) {
            console.log(response)
            if (response.data.code === 0) {
              ref.$message.success("保存成功！");
              ref.dialogFormVisible = false;
              ref.getListByPage();
              ref.resetForm();
            }
            else {
              ref.$message.error(response.data.msg);
            }
          })
        }
        else{
          createConfig(ref.form).then(function (response) {
            console.log(response)
            if (response.data.code === 0) {
              ref.$message.success("保存成功！");
              ref.dialogFormVisible = false;
              ref.getListByPage();
              ref.resetForm();
            }
            else {
              ref.$message.error(response.data.msg);
            }
          })
        }
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
      addConfig(){
        this.resetForm();
        this.isEdit = false;
        this.dialogFormVisible = true;
      },
      resetForm()
      {
        if(this.$refs["form"] != undefined){
          this.$refs["form"].resetFields();
        }
        this.form = {
          id: 0,
          project_id: '',
          cfg: {},
          cfg_name: ''
        }
        this.configForm = [];
        this.paramsForm = []
      },
      dateFormat(row, column) {
        let date = row[column.property];
        if (date === undefined) {
          return "";
        }
        return moment(date).format("YYYY-MM-DD HH:mm:ss");
      },
      getProject(){
        let self = this;
        getProjectList().then(function (response) {
          // console.log(response)
          self.projectList = response.data.projects;
        }).catch(function (err) {
        });
      },
      getParams(flag){
        let self = this;
        if(flag == true){
          getKeyList({project_id: self.form.project_id}).then(function (response){
            console.log(response)
            self.paramsForm = response.data.keys;
          }).catch(function (err) {
          });
        }
      },
      getFilterProject(item){
        FilterProject(item)
      },
      seachCondition() {
        this.pageNum = 1;
        this.getListByPage();
      },
    }
  }
</script>

<style scoped>
  .el-textarea.is-disabled .el-textarea__inner {
    color: #606266;
    border: none;
    width: 100%;
  }

  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }

  .block {
    float: right;
    margin-top: 15px;
  }

  .el-tag + .el-tag {
    margin-left: 10px;
    margin-top: 8px;
  }

  .op-btm {
    text-decoration:underline;
  }
</style>
