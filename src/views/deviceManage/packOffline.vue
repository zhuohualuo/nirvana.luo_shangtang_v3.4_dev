<template>
  <div id="content">
    <el-row>
      <el-button type="primary" size='small' @click="addRecord" icon="el-icon-plus">新增</el-button>
      <el-button type="danger" size='small' @click="cancelPack" icon="el-icon-close">停止</el-button>
      <advance-filter :formData="form2" :filterArray="filterArray" @search="getListByPage"></advance-filter>
    </el-row>

    <el-row>
      <!--展开行效果-->
      <el-table
              height="690" class='_table' header-cell-class-name="_table-head"
              :row-key='getRowKeys'
              :expand-row-keys="expands"
              :data="pageList.programData"
              style="width: 100%" stripe border :key="Math.random()">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item label="ansible部署包">
                <span>{{ props.row.ansible_pack }}</span>
              </el-form-item>
              <el-form-item label="register离线包">
                <span>{{ props.row.registry_pack }}</span>
              </el-form-item>
              <el-form-item label="升级包">
                <span>{{ props.row.upgrad_pack }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="id" label="id" width="50"></el-table-column>
        <el-table-column show-overflow-tooltip prop="branch_name"  label="分支名称"></el-table-column>
        <el-table-column show-overflow-tooltip prop="product" label="产品名称"></el-table-column>
        <el-table-column show-overflow-tooltip prop="version"  label="版本"></el-table-column>
        <el-table-column show-overflow-tooltip prop="to_mail" label="邮件接收人"></el-table-column>
        <el-table-column show-overflow-tooltip prop="status" :formatter="getstatus" label="状态"></el-table-column>
        <el-table-column show-overflow-tooltip prop="updated_time" :formatter="dateFormat" label="操作日期"></el-table-column>
        <el-table-column show-overflow-tooltip prop="updated_time" :formatter="dateFormat" label="操作日期"></el-table-column>
        <table-operator :operateArray="operateArray"></table-operator>
      </el-table>
    </el-row>

    <div class="block">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                     :page-sizes="[10, 15, 20, 50, 100]"
                     :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                     :total="pageList.count">
      </el-pagination>
    </div>

    <el-dialog title="离线打包" :visible.sync="dialogFormVisible">
      <el-form :model="form"  ref="form">
        <el-form-item label="分支名称" :label-width="formLabelWidth" prop="branch_name" :rules="{ required: true }">
          <el-input v-model="form.branch_name" auto-complete="off" style="width: 400px;" :disabled="disableFlag"></el-input>
        </el-form-item>
        <el-form-item label="产品名称" :label-width="formLabelWidth" prop="product" :rules="{ required: true }">
          <el-input v-model="form.product" auto-complete="off" style="width: 400px;"></el-input>
        </el-form-item>
        <el-form-item label="版本" :label-width="formLabelWidth" prop="version" :rules="{ required: true }">
          <el-input type="input" v-model="form.version" auto-complete="off" style="width: 400px;"></el-input>
        </el-form-item>
        <el-form-item label="邮件接收人" :label-width="formLabelWidth" prop="to_mail" :rules="{ required: true }">
          <el-input v-model="form.to_mail" auto-complete="off" placeholder="英文;号分隔" style="width: 400px;"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRecord">保存</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
  import AdvanceFilter from "../../components/AdvanceFilter/index";
  import TableOperator from "../../components/TableOperator/index"; //表格按钮
  import {getPackOfflineList,addPackOffline,deletePackOffline,modifyPackOffline,runPackOffline,cancelPackOffline} from '@/api/packOffline';
  import moment from 'moment' //引入moment化简时间
  export default {
    name: 'packOffline',
    components: {AdvanceFilter,TableOperator},
    data() {
      return {
        //高级过滤
         filterArray: [
                    {key:'search_branch_name',name:'分支名称',type:'input'},
                    {key:'search_product',name:'产品名称',type:'input'},
                    {key:'search_version',name:'版本',type:'input'},
                ],
        //表格按键
         operateArray: [
                    {label:'运行打包', click:this.runpack},
                    {label:'编辑修改', click:this.updateSelf1},
                    {label:'删 除', type:"danger", click:this.deleteSelf1},
                ],
        disableFlag: false,
        getRowKeys(row) {
          return row.id
        },
        form : {
          id: '',
          branch_name: '',
          product: '',
          version: '',
          to_mail: '',
          updated_time: ''
        },
        form2:{
        pageNums: 10,//每页几条
        pageNum: 1, //当前是第几页
        search_branch_name: '',
        search_product: '',
        search_version: '',
        },
        rowObj: {},
        formLabelWidth: '120px',
        pageNums: 10,//每页几条
        pageNum: 1, //当前是第几页
        dialogFormVisible: false,
        search_branch_name: '',
        search_product: '',
        search_version: '',
        pageList: {
          page_no: 1,//页面开始页码
          page_size: 10,//每页条数
          count: 0,//总数目
          programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
        },
        expands: []
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
      getListByPage() {
        let self = this;
        if (self.user_name === 'me')
          self.form2.user_name = this.$store.state.user.uid_name

        getPackOfflineList({
          page_no: self.form2.pageNum,
          page_size: self.form2.pageNums,
          branch_name: self.form2.search_branch_name,
          product: self.form2.search_product,
          version: self.form2.search_version,
        }).then(function (response) {
          self.pageList = {
            page_no: self.form2.pageNum,
            page_size: 10 || self.form2.pageNums,
            count: response.data.total,
            programData: response.data.pack_offline
          }
        })
      },
      getstatus(row, column){
        let status = row[column.property];
        if (status === 0) {
          return "未打包";
        } else if (status === 1) {
          return "打包中";
        } else if (status === 2) {
          return "打包完成";
        } else if (status === 3) {
          return "打包异常";
        } else if (status === 4) {
          return "已停止";
        }
      },
      deleteSelf1(self) {
        let ref = this;
        this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deletePackOffline(self.id).then(function (response) {
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
        this.dialogFormVisible = true;
      },
      runpack(self){
        let ref = self;
        let reg = this;
        runPackOffline({
          'id': ref.id,
          'branch_name': ref.branch_name,
          'product': ref.product,
          'version': ref.version,
          'to_mail': ref.to_mail
        }).then(function (response) {
          if (response.data.code === 200) {
            reg.$message.success("开始打包！请关注后续邮件通知或本页面");
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
          cancelPackOffline().then(function (response) {
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

      saveRecord() {
        let ref = this;
        if (!ref.validateFormRule('form')) {
          return false;
        }
        if (ref.form.id ===''){
          addPackOffline({
            'branch_name': ref.form.branch_name,
            'product': ref.form.product,
            'version': ref.form.version,
            'to_mail': ref.form.to_mail
          }).then(function (response) {
            if (response.data.code === 200) {
              ref.$message.success("保存成功！");
              ref.dialogFormVisible = false;
              ref.getListByPage();
              ref.resetForm();
            }
            else {
              ref.$message.error(response.data.msg);
            }
          })
        } else {
          modifyPackOffline(
            ref.form.id,
            {
              'product': ref.form.product,
              'version': ref.form.version,
              'branch_name': ref.form.branch_name,
              'to_mail': ref.form.to_mail
            }
          ).then(function (response) {
            if (response.data.code === 200) {
              ref.$message.success("修改成功！");
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
        this.disableFlag = false;
        this.resetForm();
        this.dialogFormVisible = true;
      },
      resetForm() {
        if (this.$refs["form"] != undefined) {
            this.$refs["form"].resetFields();
        }
        //清空
        this.form.id = "";
        this.form.branch_name = "";
        this.form.product = "";
        this.form.version = "";
        this.form.to_mail = "";
      },
      dateFormat(row, column) {
        let date = row[column.property];
        if (date === undefined || date == null) {
          return "";
        }
        return moment(date).format("YYYY-MM-DD HH:mm:ss");
      },
      seachCondition(val) {
        this.form2 = val;
        this.pageNum = 1;
        this.getListByPage();
      },
    }
  }
</script>
<style scoped>
  .block {
    float: right;
    margin-top: 15px;
  }
  .demo-table-expand label {
    width: 290px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 100%;
  }
</style>
