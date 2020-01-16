<template>
  <div id="content">
    <el-row>
      <el-form :inline="true" class="_bottom0 demo-form-inline">
        <el-form-item label="组件名称">
          <el-select v-model="search_pod_name" clearable style="width: 200px">
            <el-option label="sfd" value="engine-static-feature-db"></el-option>
            <el-option label="afd" value="engine-alert-feature-db"></el-option>
            <el-option label="人脸时空库" value="engine-timespace-face-feature-db"></el-option>
            <el-option label="人体时空库" value="engine-timespace-pedestrian-feature-db"></el-option>
            <el-option label="struct-db" value="engine-struct-db"></el-option>
            <el-option label="iis" value="engine-image-ingress-service"></el-option>
            <el-option label="ips" value="engine-image-process-service"></el-option>
            <el-option label="vis" value="engine-video-ingress-service"></el-option>
            <el-option label="vps" value="engine-video-process-service"></el-option>
            <el-option label="fe" value="engine-face-extract-service"></el-option>
            <el-option label="pe" value="engine-pach-extract-service"></el-option>
          </el-select>

        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="search_ip" style="width: 200px" placeholder=""></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size='small' @click="getListByPage" icon="el-icon-search"></el-button>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size='small' @click="addRecord">新 增</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <el-row>
      <el-table :data="pageList.programData" stripe class='_table' :key="Math.random()">
        <el-table-column show-overflow-tooltip prop="id" label="id" width="50"></el-table-column>
        <el-table-column show-overflow-tooltip prop="ip"  label="服务器ip"></el-table-column>
        <el-table-column show-overflow-tooltip prop="pod_name" label="模块名称"></el-table-column>
        <el-table-column show-overflow-tooltip prop="branch_name"  label="分支名称"></el-table-column>
        <el-table-column show-overflow-tooltip prop="is_reinstall_os" :formatter="is_reinstall_os_Format" label="是否重装系统"></el-table-column>
        <el-table-column show-overflow-tooltip prop="is_test" :formatter="is_test_Format"  label="是否测试"></el-table-column>
        <el-table-column show-overflow-tooltip prop="env" label="env"></el-table-column>
        <el-table-column show-overflow-tooltip prop="tomail" label="邮件接收人"></el-table-column>
        <el-table-column show-overflow-tooltip prop="updated_time" :formatter="dateFormat" label="操作日期"></el-table-column>
        <el-table-column prop="operation" label="操作" width="200">
          <template slot-scope='props'>
            <el-row>
              <el-col :span="2" :offset="4">
                <el-tooltip content="触发CI" placement="top" :open-delay="500">
                  <el-button @click='updateSelf1(props.row)' type="info" size="mini" icon="el-icon-caret-right" plain></el-button>
                </el-tooltip>
              </el-col>
              <el-col :span="2" :offset="4">
                <el-tooltip content="删 除" placement="top" :open-delay="500">
                  <el-button @click='deleteSelf1(props.row)' type="warning" size="mini" icon="el-icon-delete" plain></el-button>
                </el-tooltip>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <div class="block">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                     :page-sizes="[10, 15, 20, 50, 100]"
                     :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                     :total="pageList.count">
      </el-pagination>
    </div>

    <el-dialog title="模块化CI" :visible.sync="dialogFormVisible">
      <el-form :model="form"  ref="form">

        <el-form-item label="机器IP" :label-width="formLabelWidth" prop="hostname">
          <el-input v-model="form.ip" auto-complete="off" style="width: 400px;" :disabled="is_update_flag"></el-input>
        </el-form-item>

        <el-form-item label="组件名称" prop="pod_name" :label-width="formLabelWidth" >
          <el-select v-model="form.pod_name" >
            <el-option label="sfd" value="engine-static-feature-db"></el-option>
            <el-option label="afd" value="engine-alert-feature-db"></el-option>
            <el-option label="人脸时空库" value="engine-timespace-face-feature-db"></el-option>
            <el-option label="人体时空库" value="engine-timespace-pedestrian-feature-db"></el-option>
            <el-option label="struct-db" value="engine-struct-db"></el-option>
            <el-option label="iis" value="engine-image-ingress-service"></el-option>
            <el-option label="ips" value="engine-image-process-service"></el-option>
            <el-option label="vis" value="engine-video-ingress-service"></el-option>
            <el-option label="vps" value="engine-video-process-service"></el-option>
            <el-option label="fe" value="engine-face-extract-service"></el-option>
            <el-option label="pe" value="engine-pach-extract-service"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="分支名称" :label-width="formLabelWidth" prop="branch_name" >
          <el-input v-model="form.branch_name" auto-complete="off" style="width: 400px;"></el-input>
        </el-form-item>
        <el-form-item label="是否重装系统" prop="is_reinstall_os" :label-width="formLabelWidth" :rules="{ required: true, message: '请选择是否全新安装', trigger: 'blur' }">
          <el-radio-group v-model="form.is_reinstall_os" >
            <el-radio label="True">重装</el-radio>
            <el-radio label="False">不重装</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否测试" prop="is_test" :label-width="formLabelWidth" :rules="{ required: true, message: '请选择是否进行后续测试', trigger: 'blur' }">
          <el-radio-group v-model="form.is_test" >
            <el-radio label="True">是</el-radio>
            <el-radio label="False">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="部署env" :label-width="formLabelWidth" prop="env" >
          <el-input type="input" v-model="form.env" auto-complete="off" style="width: 400px;"></el-input>
        </el-form-item>
        <el-form-item label="收件人" :label-width="formLabelWidth" prop="tomail">
          <el-input v-model="form.tomail" auto-complete="off" placeholder="英文;号分隔" style="width: 400px;"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRecord">开始执行</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
  import {getModulesCIList,addModulesCI,updateModulesCI,deleteModulesCI} from '@/api/modulesCI';
  import moment from 'moment' //引入moment化简时间
  export default {
    name: 'modulesCI',
    data() {
      return {
        form: {
          id: '',
          pod_name: '',
          ip: '',
          branch_name: '',
          env: '',
          is_reinstall_os: "False",
          is_test: "True",
          tomail: '',
          updated_time: ''
        },
        form2: {
          project_id: ''
        },
        rowObj: {},
        progressVisible: false,
        file_name_flag: true,
        progressForm: [],
        formLabelWidth: '120px',
        pageNums: 10,//每页几条
        pageNum: 1, //当前是第几页
        dialogFormVisible: false,
        search_ip: '',
        search_pod_name: '',
        is_update_flag: false,
        pageList: {
          page_no: 1,//页面开始页码
          page_size: 10,//每页条数
          count: 0,//总数目
          programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
        }
      }
    },

    computed: {},

    mounted() {
      this.getListByPage();
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
      is_test_Format(row, column) {
        let type = row[column.property];
        if (type === "True") {
          return "是";
        } else if (type === "False") {
          return "否";
        }
      },
      is_reinstall_os_Format(row, column) {
        let type = row[column.property];
        if (type === "True") {
          return "是";
        } else if (type === "False") {
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
        }
      },
      getListByPage() {
        let self = this;
        if (self.user_name === 'me')
          self.user_name = this.$store.state.user.uid_name

        getModulesCIList({
          page_no: self.pageNum,
          page_size: self.pageNums,
          ip: self.search_pod_ip,
          pod_name: self.search_pod_name
        }).then(function (response) {
          console.log(response.data.modules_ci)
          self.pageList = {
            page_no: self.pageNum,
            page_size: 10 || self.pageNums,
            count: response.data.total,
            programData: response.data.modules_ci
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
          deleteModulesCI(self.id).then(function (response) {
            console.log(response)
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
        this.form.id = self.id;
        this.form.pod_name = self.pod_name;
        this.form.ip = self.ip;
        this.form.branch_name = self.branch_name;
        this.form.env = self.env;
        this.form.is_reinstall_os = self.is_reinstall_os;
        this.form.is_test = self.is_test;
        this.form.tomail = self.tomail;
        this.is_update_flag = true;

        this.dialogFormVisible = true;
        console.log(this.form.baseEnv_package)
      },
      saveRecord() {
        let ref = this;
        if (!ref.validateFormRule('form')) {
          return false;
        }
        console.log(ref.form.id)
        if (ref.form.id ===''){
          addModulesCI({
            'pod_name': ref.form.pod_name,
            'ip': ref.form.ip,
            'branch_name': ref.form.branch_name,
            'env': ref.form.env,
            'is_reinstall_os': ref.form.is_reinstall_os,
            'is_test': ref.form.is_test,
            'tomail': ref.form.tomail
          }).then(function (response) {
            console.log(response)
            if (response.data.code === 200) {
              ref.$message.success("触发成功！");
              ref.dialogFormVisible = false;
              ref.getListByPage();
              ref.resetForm();
            }
            else {
              ref.$message.error(response.data.msg);
            }
          })
        }else {
          console.log('进行更新')
          updateModulesCI(ref.form.id,{
            'id': ref.form.id,
            'pod_name': ref.form.pod_name,
            'ip': ref.form.ip,
            'branch_name': ref.form.branch_name,
            'env': ref.form.env,
            'is_reinstall_os': ref.form.is_reinstall_os,
            'is_test': ref.form.is_test,
            'tomail': ref.form.tomail
          }).then(function (response) {
            console.log(response)
            if (response.data.code === 200) {
              ref.$message.success("触发成功！");
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
      }
    }
  }
</script>
<style scoped>
  ._table {
    height: 650px;
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
</style>
