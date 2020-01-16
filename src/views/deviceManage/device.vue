<template>
  <div id="content">

    <!--查询-->
    <el-row>
      <el-button type="primary" size="small" @click="goToAddDevice" icon="el-icon-plus" style="float:left">新 增</el-button>
       <el-form :inline="true" class="_bottom0 demo-form-inline" style="float:right">
        <el-form-item label="状态">
          <el-select v-model="form3.search_status" clearable style="width: 200px">
            <el-option label="空闲" value="idle"></el-option>
            <el-option label="忙碌" value="busy"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="租借人">
          <el-autocomplete
            class="inline-input"
            v-model="form3.search_renter"
            :fetch-suggestions="querySearch"
            placeholder="请输入租借人"
            clearable
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="form3.search_ip" style="width: 200px" placeholder="支持搜索集群中的机器" clearable></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form3.search_description" style="width: 200px" placeholder clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" class="el-button el-button--primary el-button--small is-circle" @click="whenSearch" icon="el-icon-search"></el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <!--表格-->
    <el-row>
      <el-table
              height="690" border class='_table' header-cell-class-name="_table-head"
              :data="pageList.programData"
              :key="Math.random()"
              :row-class-name="tableRowClassName">
        <el-table-column show-overflow-tooltip prop="id" width="40" label="ID"></el-table-column>
        <el-table-column type="index" width="90" label="序号" v-if="false"></el-table-column>
        <el-table-column show-overflow-tooltip prop="ip" label="IP" v-if="false"></el-table-column>
        <el-table-column show-overflow-tooltip prop="description" width="160" label="备注"></el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="status"
          width="60"
          :formatter="status_format"
          label="状态"
        ></el-table-column>
        <el-table-column show-overflow-tooltip prop="install_user"  label="安装用户"></el-table-column>
        <el-table-column show-overflow-tooltip prop="last_renter"  label="租借人"></el-table-column>
        <el-table-column show-overflow-tooltip prop="install_status" width="120" :formatter="install_status_Format" label="安装状态"></el-table-column>
        <el-table-column show-overflow-tooltip prop="env" label="env" width="100"></el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="distribution"
          label="distribution镜像包"
          width="180"
        ></el-table-column>
        <el-table-column show-overflow-tooltip prop="infra_ansible" label="ansible工具包" width="150"></el-table-column>
        <el-table-column show-overflow-tooltip prop="yum_version" label="yum源" width="120"></el-table-column>

        <!-- 折叠部分 -->
        <el-table-column type="expand" label="机器详情" width="100">
          <template slot-scope="props">
            <el-form label-position="left">
              <el-form-item label="更新时间：" prop="updated_time">
                <span>{{ props.row.updated_time }}</span>
              </el-form-item>
            </el-form>
            <el-table border stripe :row-style="tableRowStyle"
                :data="props.row.nodeinfo" @expand='rowExpand'
                :header-cell-style="tableHeaderColor">
              <el-table-column label="机器IP" prop="ip" width="120"></el-table-column>
              <el-table-column label="Cobbler_name" prop="cobbler_name"></el-table-column>
              <el-table-column label="MAC地址" prop="mac"></el-table-column>
              <el-table-column label="DNS" prop="dns"></el-table-column>
              <el-table-column label="Gateway" prop="gateway"></el-table-column>
              <el-table-column label="BMC_IP" prop="ipmi_host"></el-table-column>
              <el-table-column label="BMC_username" prop="ipmi_username"></el-table-column>
              <el-table-column label="BMC_password" prop="ipmi_password">
                <template
                  slot-scope="scope"
                >{{(((props.row.last_renter==user_name) && (props.row.status=='busy')) || (props.row.status=='idle')||(super_usr.some(val=>val==user_name)))?scope.row.ipmi_password:"********"}}</template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="rent_operation" label="租借/归还" width="150">
          <template slot-scope='props'>
            <el-row>
              <el-col :span='2'>
                  <el-button type="text"  @click='deviceRent(props.row)'>租借</el-button>
              </el-col>
              <el-col :span='2' :offset="11">
                  <el-button type="text"  @click='deviceReturn(props.row)' style="color:orange">归还</el-button>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
         <table-operator :operateArray="operateArray"></table-operator>
      </el-table>
    </el-row>

    <!-- 分页部分 -->
    <div class="block">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNum"
        :page-sizes="[10, 15, 20, 50, 100]"
        :page-size="pageNums"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageList.count"
      ></el-pagination>
    </div>

    <el-dialog title="重装系统服务" :visible.sync="rebiuldFormVisible" width="30%">
      <el-form :model="ruleForm3" ref="ruleForm3">
        <el-row>
          <el-form-item label="infra_id" :label-width="formLabelWidthInfra" v-if="false">
            <el-input v-model="infra_id" style="width: 55%" placeholder></el-input>
          </el-form-item>
          <el-form-item label="系统版本" prop="system_version">
            <el-select v-model="form2.version_id" placeholder="请选择" ref="selection">
              <el-option
                v-for="(item,index) in version"
                :key="index"
                :label="item.system_version"
                :value="item.description">
              </el-option>
            </el-select>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="reinstallSystem(ruleForm3)">开始重装</el-button>
        <el-button type="primary" @click="rebiuldFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="部署服务" :visible.sync="installFormVisible">
      <el-form :model="ruleForm2" ref="ruleForm2">
        <el-row>
          <el-form-item label="infra_id" :label-width="formLabelWidthInfra" v-if="false">
            <el-input v-model="infra_id" style="width: 55%" placeholder></el-input>
          </el-form-item>
          <el-form-item
            label="部署产品"
            prop="product"
            :label-width="formLabelWidthInfra"
            :rules="{ required: true, message: '请选择部署哪款产品', trigger: 'blur' }"
          >
            <el-radio-group v-model="ruleForm2.product" :change="changeForm()">
              <el-radio :label="'su'">su</el-radio>
              <el-radio :label="'foundry'">foundry</el-radio>
              <el-radio :label="'genting'">云顶</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            label="env"
            prop="env"
            v-if="env_flag"
            :label-width="formLabelWidthInfra"
            :rules="{ required: true, message: '请填写env', trigger: 'blur' }"
          >
            <el-input v-model="ruleForm2.env" style="width: 55%" placeholder></el-input>
          </el-form-item>

          <el-form-item
            label="su型号"
            prop="deploy_mode"
            v-if="deploy_mode_flag"
            :label-width="formLabelWidthInfra"
          >
            <el-select v-model="ruleForm2.deploy_mode" placeholder="请选择部署哪款su">
              <el-option label="静态2卡" value="unity-va-ut-ff1001"></el-option>
              <el-option label="静态4卡" value="unity-va-ut-ff1002"></el-option>
              <el-option label="静态8卡" value="unity-va-ut-ff1003"></el-option>
              <el-option label="图片流4卡" value="unity-va-ut-ff2102"></el-option>
              <el-option label="图片流8卡" value="unity-va-ut-ff2103"></el-option>
              <el-option label="视频流4卡" value="unity-va-ut-ff2202"></el-option>
              <el-option label="视频流8卡" value="unity-va-ut-ff2203"></el-option>
              <el-option label="图片视频混合8卡" value="unity-va-ut-ff2301"></el-option>
              <el-option label="结构化4卡" value="unity-va-ut-st1102"></el-option>
              <el-option label="结构化8卡" value="unity-va-ut-st1103"></el-option>
              <el-option label="网关4卡" value="unity-va-ut-gw1002"></el-option>
              <el-option label="网关8卡" value="unity-va-ut-gw1003"></el-option>
              <el-option label="动态人脸比对引擎-8路视频流渠道版" value="unity-va-ut-ff2291"></el-option>
              <el-option label="动态人脸比对引擎-12路视频流渠道版" value="unity-va-ut-ff2292"></el-option>
              <el-option label="动态人脸比对引擎-16路视频流渠道版" value="unity-va-ut-ff2293"></el-option>
              <el-option label="动态人脸比对引擎-20路视频流渠道版" value="unity-va-ut-ff2294"></el-option>
              <el-option label="动态人脸比对引擎-24路视频流渠道版" value="unity-va-ut-ff2295"></el-option>
              <el-option label="动态人脸比对引擎-28路视频流渠道版" value="unity-va-ut-ff2296"></el-option>
              <el-option label="动态人脸比对一体机-图片流1卡渠道版" value="unity-va-ut-ff2181"></el-option>
              <el-option label="动态人脸比对一体机-视频流1卡渠道版" value="unity-va-ut-ff2281"></el-option>
              <el-option label="动态人脸比对一体机-视频流2卡渠道版" value="unity-va-ut-ff2282"></el-option>
              <el-option label="动态人脸比对一体机-视频流4卡渠道版" value="unity-va-ut-ff2284"></el-option>
              <el-option label="动态人脸比对一体机-混合型4卡渠道版" value="unity-va-ut-ff2384"></el-option>
              <el-option label="静态人脸比对一体机-1卡渠道版" value="unity-va-ut-ff1081"></el-option>
              <el-option label="静态人脸比对一体机-3卡渠道版" value="unity-va-ut-ff1083"></el-option>
              <el-option label="视频结构化一体机-视频流双卡渠道版" value="unity-va-ut-sf1182"></el-option>
              <el-option label="fairy-16卡机" value="unity-va-ut-ff9527"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item
            label="是否重装系统"
            prop="is_reinstall_os"
            :label-width="formLabelWidthInfra"
            :rules="{ required: true, message: '请选择是否重装系统', trigger: 'blur' }"
          >
            <el-radio-group v-model="ruleForm2.is_reinstall_os">
              <el-radio label="true">是</el-radio>
              <el-radio label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="nas" prop="nas" v-if="nas_flag" :label-width="formLabelWidthInfra">
            <el-input v-model="ruleForm2.nas" style="width: 55%" placeholder="不挂可不填，格式ip:path"></el-input>
          </el-form-item>
          <el-form-item
            label="distribution镜像包"
            prop="distribution"
            :label-width="formLabelWidthInfra"
            :rules="{ required: true, message: '请填写distribution镜像包', trigger: 'blur' }"
          >
            <el-input v-model="ruleForm2.distribution" style="width: 55%" placeholder></el-input>
          </el-form-item>
          <el-form-item
            label="ansible工具包"
            prop="infra_ansible"
            :label-width="formLabelWidthInfra"
            :rules="{ required: true, message: '请填写ansible工具包', trigger: 'blur' }"
          >
            <el-input v-model="ruleForm2.infra_ansible" style="width: 55%" placeholder></el-input>
          </el-form-item>
          <el-form-item
            label="yum源"
            prop="yum_version"
            :label-width="formLabelWidthInfra"
            :rules="{ required: true, message: '请填写yum源', trigger: 'blur' }"
          >
            <el-input v-model="ruleForm2.yum_version" style="width: 55%" placeholder></el-input>
          </el-form-item>
          <el-form-item label="邮件接收人" :label-width="formLabelWidthInfra">
            <el-input v-model="ruleForm2.email" style="width: 55%" placeholder="多个邮箱请用英文;分隔"></el-input>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="getDeploy('ruleForm2')">部署</el-button>
        <el-button type="primary" @click="saveDeployRecord('ruleForm2')">保存</el-button>
        <el-button type="primary" @click="installFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="部署log" :visible.sync="progressVisible">
      <el-button size="small" type="primary" @click="getDeployLog(rowObj.id)">刷新</el-button>

      <el-table
       height="690" border class='_table' header-cell-class-name="_table-head"
      :data="progressForm"  :key="Math.random()">
        <el-table-column label="步骤">
          <template slot-scope="scope2">
            <span>
              {{scope2.row}}
              <i v-if="scope2.row === ''" class="el-icon-loading"></i>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <br />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {getManageMachine,saveDeployment,getDeployMsg} from "@/api/device";
import TableOperator from "../../components/TableOperator/index"; //表格按钮
  import {
    getDeviceList,
    deleteDevice,
    rentDevice,
    returnDevice,
    reinstallSystemDevice,
    reinstallInfraDevice,
    getDeployLogList,
    getLicenseList,
    addDevice,
    updateDevice,
    triggerDeploy,
    getSystemVersion
  } from '@/api/deviceResource';
  import moment from 'moment'; //引入moment化简时间
  import Cookies from "js-cookie";
  let super_user = 'caolin,liuyuan,yangaolin,yiyuan';
  export default {
    name: 'deviceList',
    components: {TableOperator},
    data() {
      return {
                 operateArray: [
                    {label:'编辑', click:this.gotoEdit},
                    {label:'重装', click:this.viewRebuild},
                    {label:'部署', type:"danger", click:this.viewinstall},
                    {label:'日志', type:"danger", click:this.goToViewLog},
                    {label:'执行情况', type:"danger", click:this.goTosystemLog},
                    {label:'删除', type:"danger", click:this.deleteSelf1},
                ],
        user_name:"",
        expands: [],
        isTask: true,
        macvisible: false,
        formLabelWidth: '100px',
        addDevieFormVisible:false,
        disableFlag: false,
        renter:[],
        ruleForm: {
          editableTabsValue: '1',
          ip_flag: false,
          editableTabs: [{
            ip: '',
            ipmi_username: '',
            ipmi_password: '',
            ipmi_host: ''
          }],
          id: '',
          description: ''
        },

        form1: {
          description: '',
          ip: '',
          ipmi_host: '',
          ipmi_username: '',
          ipmi_password: '',
        },

        form2: {
          project_id: '',
          version_id: '',
          scene_id: '',
        },
        form3:{
          search_status: '',
          search_renter: this.$store.state.user.uid_name,
          search_ip: '',
          search_description: '',
        },
        licenseList: [],
        versionList: [],
        sceneList: [],
        progressForm: [],
        rowObj: {},
        progressVisible: false,
        pageNums: 10,//每页几条
        pageNum: 1, //当前是第几页
        pageList: {
          page_no: 1,//页面开始页码
          page_size: 10,//每页条数
          count: 0,//总数目
          programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
        },
        dialogFormVisible: false,
        installFormVisible: false,
        rebiuldFormVisible: false,
        secretFormVisible: false,
        formLabelWidth: "120px",
        formLabelWidthInfra: "150px",
        currentRow: {},
        infra_id: '',
        env_flag: false,
        deploy_mode_flag: true,
        nas_flag: true,
        license_flag: false,
        license_name_flag: true,
        ruleForm2:{
          env: '',
          distribution: '',
          infra_ansible: '',
          yum_version: '',
          email: '',
          product: '',
          is_reinstall_os: '',
          nas: '',
          deploy_mode: ''
        },
        ruleForm3: {
          system_version: '7.4'
        },
        return_id: '',
        isRent: false,
        version:[] //版本号
      }
  },

    computed: {},


    filters: {
      protect: function(value, self) {
        if (!value) {
          return ''
        };
        if ((self.status === 'idle') || (super_user.indexOf(this.user_name) > -1) || (self.status === 'busy' && self.last_renter === this.user_name)) {
          return value
        } else {
          return '********'
        }
    },
    },
    created(){

      },

    mounted() {
      //取出
      this.form3=JSON.parse(window.sessionStorage.getItem("form3"))
      if(this.form3===null){
        this.form3={
          search_status: '',
          search_renter: this.$store.state.user.uid_name,
          search_ip: '',
          search_description: '',
        }
      }
      //加载页面数据
      this.getSystemVersionList()

      if(this.$route.params.dataObj){
        this.form3.search_renter = this.$route.params.dataObj.search_renter;
        this.form3.search_status = this.$route.params.dataObj.search_status;
        this.form3.search_ip = this.$route.params.dataObj.search_ip;
        this.form3.search_description = this.$route.params.dataObj.search_description;
        this.project_id = this.$route.params.dataObj.project_id;
        this.initList();
      } else {
        this.initList();
      };
      this.user_name = this.$store.state.user.uid_name;
      this.super_usr = ["caolin", "liuyuan", "yangaolin"]
      this.renter = this.loadAll();
    },

    methods: {
       //部署
      getDeploy(self){
        let ref=this
        ref.$confirm('此操作将无法撤销, 是否继续?', '是否部署', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
        triggerDeploy(ref.$store.state.user.uid_name, ref.infra_id,{
              "env":ref.ruleForm2.env,
              "product": ref.ruleForm2.product,
              "distribution":ref.ruleForm2.distribution,
              "infra_ansible": ref.ruleForm2.infra_ansible,
              "yum_version": ref.ruleForm2.yum_version,
              "deploy_mode": ref.ruleForm2.deploy_mode,
              "nas": ref.ruleForm2.nas,
              "email": ref.ruleForm2.email,
              "is_reinstall_os": ref.ruleForm2.is_reinstall_os
        }).then(function(response){
          if(response.data.code==200){
            ref.$message({
              type:"success",
              message:response.data.msg
            })
            ref.installFormVisible=false
            ref.initList()
          }else{
            ref.$message(response.data.msg)
          }
        }).catch(function(err){})
        }).catch(()=>{
          this.$message({
            type:"info",
            message:"已取消部署"
          })
        })
      },
      //执行情况
      goTosystemLog(self){
          this.$router.push({
            path: '/deviceManage/addExecutive',
            name: '执行情况',
            params: {
              dataObj: self
            }
          })
           this.$store.dispatch('app/toggleChildNav', '/deviceManage/device')
      },
      //页面加载后获取
      getSystemVersionList(){
        let self=this;
         getSystemVersion().then(function (response) {
         self.version=response.data.system_version_args
          }).catch(function(err){})
      },
      // 选择重装系统后版本出现
      changeRebuild() {
        if (this.ruleForm2.is_reinstall_os === 'true') {
          this.system_version_flag = true;
        } else {
          this.system_version_flag = false;
        }
      },

      // 跳转到查看日志页面
      goToViewLog(self){
        self.log_info = '/ci/viper-deploy-logs/viper_deploy_' + self.ip + '.log';
        // 将搜索参数带过去
        self.search_status = this.form3.search_status;
        self.search_renter = this.form3.search_renter;
        self.search_ip = this.form3.search_ip;
        self.search_description = this.form3.search_description;
        self.project_id = this.project_id;
        this.$router.push({
          path: '/deviceManage/viewLog',
          name: "CI执行日志",
          params: {
            dataObj: self
          }
        })
        this.$store.dispatch('app/toggleChildNav', '/deviceManage/device')
      },

      querySearch(queryString, cb) {
        var renter = this.renter;
        var results = queryString ? renter.filter(this.createFilter(queryString)) : renter;
        // 调用 callback 返回建议列表的数据
        cb(results);
      },
      createFilter(queryString) {
        return (renter) => {
          return (renter.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        };
      },
      loadAll() {
        return [
          { "value": this.$store.state.user.uid_name },
        ]
      },
      handleSizeChange(val) {
        this.pageNum = 1;
        this.pageNums = val;
        this.initList();
      },
      handleCurrentChange(val) {//改变页码
        this.pageNum = val;
        this.initList();
      },
      tableRowStyle({ row, rowIndex }) {
        return 'background-color: #f5f7fa'
      },
      tableHeaderColor({ row, column, rowIndex, columnIndex }) {
        if (rowIndex === 0) {
          return 'background-color: #d6eccb'
        }
      },
      rowExpand:function(row){
      },
      // 跳转到增加机器界面
      goToAddDevice(){
        this.$router.push({
          path: 'deviceManage/addDeviceResource',
          name: "addDeviceResource"
        })
        this.$store.dispatch('app/toggleChildNav', '/deviceManage/device')
      },

      initList() {
        let self = this;
        self.pageList.programData = []
        let params = {
          page_no: self.pageNum,
          page_size: self.pageNums,
          last_renter: self.form3.search_renter.trim(),
          status: self.form3.search_status,
          ip: self.form3.search_ip.trim(),
          description: self.form3.search_description.trim(),
          project_id: Cookies.get("platform")
        }

        getDeviceList(params).then(function (response) {
          if (response.data.code == 200) {
            //存入
            window.sessionStorage.setItem("form3",JSON.stringify({
              search_status: self.form3.search_status,
              search_renter: self.form3.search_renter,
              search_ip: self.form3.search_ip,
              search_description: self.form3.search_description,
            }))
            self.pageList.page_no = self.pageNum;
            self.pageList.page_size = 10 || self.pageNums;
            self.pageList.count = response.data.total
            for (var key in response.data.servers) {
              let item = response.data.servers[key];
              self.pageList.programData.push({
                id: item.id,
                ip: item.ip,
                description: item.description,
                status: item.status,
                last_renter: item.last_renter,
                install_user: item.install_user,
                install_status: item.install_status,
                product: item.product,
                nas: item.nas,
                // license: false,
                deploy_mode: item.deploy_mode,
                env: item.env,
                distribution: item.distribution,
                infra_ansible: item.infra_ansible,
                yum_version: item.yum_version,
                email: item.email,
                is_reinstall_os: item.is_reinstall_os,
                nodeinfo: item.nodeinfo,
                updated_time: moment(item.updated_time).utcOffset(0).format("YYYY-MM-DD HH:mm:ss")
              })
            }
          }
        })

      },

      // 搜索时候用到的
      whenSearch(){
        this.pageNum = 1;
        this.initList();
      },

      resetForm() {
        if (this.$refs["form1"] != undefined) {
          this.$refs["form1"].resetFields();
        }
      },

      validateFormRule(formName) {
        let result = false;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            // console.log("validate true")
            result = true;
          }
          else {
            // console.log("validate false")
          }
        })
        return result;
      },

      getProgress(self){
        this.progressVisible = true;
        this.rowObj = self;
        this.getDeployLog(self.id);
      },

      getDeployLog(id){
        let self = this;
        getDeployLogList(id).then(function (response) {
          self.progressForm = response.data.loglist;
        }).catch(function (err) {
          console.log('获取进度异常')
        });
      },

      changeForm(self) {
        // 非su要填写env，是su要选择部署哪款su以及nas license
        if (this.ruleForm2.product !== 'su') {
          this.env_flag = true
          this.deploy_mode_flag = false
          this.nas_flag = false
          this.license_flag = false
          this.license_name_flag = false
        } else {
          this.env_flag = false
          this.deploy_mode_flag = true
          this.nas_flag = true
          this.license_flag = true
          this.license_name_flag = true
        }
      },


      tableRowClassName({row, rowIndex}) {
        if (row.status === 'busy') {
          // console.log("row.status",row);
          return 'warning-row';
        } else if (row.status === 'idle') {
          return 'success-row';
        }
        return '';
      },

      gotoEdit(self) {
        let username = this.$store.state.user.uid_name
        username = username.toString().replace(" ", "").toLowerCase()
        if((self.status === 'idle') ||(super_user.indexOf(username) > -1)|| (self.status === 'busy' && self.last_renter === username)){
          this.$router.push({
            path: 'deviceManage/addDeviceResource',
            name: 'addDeviceResource',
            params: {
              dataObj: self
            }
          })
          this.$store.dispatch('app/toggleChildNav', '/deviceManage/device')
        } else{
          this.open4()
        }

      },

      viewinstall(self) {
        // 检查是否是租借人操作
        let username = this.$store.state.user.uid_name
        username = username.toString().replace(" ", "").toLowerCase()

        if ((super_user.indexOf(username) > -1) || (self.status === 'busy' && self.last_renter === username)) {
          this.infra_id = self.id
          this.ruleForm2.product = self.product
          this.ruleForm2.is_reinstall_os = self.is_reinstall_os
          // this.ruleForm2.license = false
          this.ruleForm2.deploy_mode = self.deploy_mode
          this.ruleForm2.nas = self.nas
          this.ruleForm2.env = self.env
          this.ruleForm2.distribution = self.distribution
          this.ruleForm2.infra_ansible = self.infra_ansible
          this.ruleForm2.yum_version = self.yum_version
          this.ruleForm2.email = self.email
          this.installFormVisible = true;
        } else {
          this.$message({
            showClose: true,
            message: '此机器不在您名下或还未租借，无法进行部署操作！',
            type: 'fail'
          });
        }

      },

      viewRebuild(self) {
        // 检查是否是租借人操作
        let username = this.$store.state.user.uid_name
        username = username.toString().replace(" ", "").toLowerCase()
        if ((super_user.indexOf(username) > -1) || (self.status === 'busy' && self.last_renter === username)) {
          this.infra_id = self.id
          this.rebiuldFormVisible = true;
        } else {
          this.$message({
            showClose: true,
            message: '此机器不在您名下或还未租借，无法进行重装操作！',
            type: 'fail'
          });
        }

      },
      validateFormRule(form){
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

      reinstallSystem(self) {
        let ref = this;
        if(this.$refs.selection.selectedLabel==""){
          this.$message('请输入版本号');
          return
        }
        // 检查是否是租借人操作
        let username = this.$store.state.user.uid_name
        username = username.toString().replace(" ","").toLowerCase()

        let params = username + '/' + this.infra_id+'/'+this.$refs.selection.selectedLabel

        this.$confirm('此操作将覆盖现有机器, 请务必谨慎操作! 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
        ).then(() => {
          reinstallSystemDevice(params).then(function (response) {
            if (response.data.code === 200) {
              ref.$message({
                type: 'success',
                message: response.data.msg
              });
              ref.rebiuldFormVisible = false
              ref.initList();
            }
            else {
              ref.open3(response.data.msg);
            }
          })
            .catch(function (err) {
            });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消重装系统'
          });
        });

      },

      saveDeployRecord(formName) {
        let ref = this
        let params = this.$store.state.user.uid_name + '/' + this.infra_id
        this.$refs[formName].validate((valid) => {
              saveDeployment({
              "env":ref.ruleForm2.env,
              "product": ref.ruleForm2.product,
              "distribution":ref.ruleForm2.distribution,
              "infra_ansible": ref.ruleForm2.infra_ansible,
              "yum_version": ref.ruleForm2.yum_version,
              "deploy_mode": ref.ruleForm2.deploy_mode,
              "nas": ref.ruleForm2.nas,
              "email": ref.ruleForm2.email,
              "is_reinstall_os": ref.ruleForm2.is_reinstall_os
              }, ref.infra_id).then(function (response) {
                if (response.data.code === 200) {
                  ref.$message( response.data.msg);
                  ref.installFormVisible = false;
                  ref.initList()
            }else {
                  // ref.open3(response.data.msg);
                ref.$message( response.data.msg);
                ref.installFormVisible = false;
                }
              }).catch(function (err) {});
            } )

      },

      // 能删除的情况：超级用户，租借人，空闲的状态
      deleteSelf1(self) {
        let ref = this;
        let username = this.$store.state.user.uid_name;
        if ((self.status === 'idle') || (super_user.indexOf(username) > -1) || (self.status === 'busy' && self.last_renter === username)) {
          this.$confirm('此操作将永久删除该机器[' + self.description + '], 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            deleteDevice(self.id).then(function (response) {
              if (response.data.code === 200) {
                ref.$message({
                  type: 'success',
                  message: '删除成功!'
                });
                ref.initList();
              }
              else {
                ref.open3(response.data.msg);
              }
            })
              .catch(function (err) {
              });

          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });
          });
        } else {
          this.open5()
        }
      },

      // 租借机器
      deviceRent(self) {
        let ref = this;
        // 机器busy，无法租借
        let username = this.$store.state.user.uid_name
        username = username.toString().replace(" ","").toLowerCase()
        if (self.status === 'busy'){
          this.$message({
            showClose: true,
            message: '机器被占用，请先归还！',
            type: 'fail'
          });
          return false
        }
        ;

        this.$confirm('此操作将把机器[' + self.description + ']租借到您名下，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          rentDevice({
            renter: this.$store.state.user.uid_name
          }, self.id).then(function (response) {
            if (response.data.code === 200) {
              ref.$message({
                type: 'success',
                message: '租借成功!'
              });
              ref.initList();
            }
            else {
              ref.open3(response.data.msg);
            }
          })
            .catch(function (err) {
            });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消租借'
          });
        });
      },

      // 归还机器
      deviceReturn(self) {
        let ref = this;
        // 检查是否是租借人操作
        let username = this.$store.state.user.uid_name
        username = username.toString().replace(" ","").toLowerCase()

        // 机器无需归还，因为是空闲的
        if (self.status === 'idle') {
          this.$message({
            showClose: true,
            message: '空闲的机器无法归还，可以直接租借！',
            type: 'fail'
          });
          return false
        }
        ;

        // 不是当前用户在操作，提示无法归还
        if (self.last_renter != username) {
          this.$message({
            showClose: true,
            message: '机器不在您名下，无法归还！',
            type: 'fail'
          });
          return false
        }
        ;

        this.$confirm('此操作将把机器[' + self.description + ']归还，是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {

          returnDevice({
            renter: this.$store.state.user.uid_name
          }, self.id).then(function (response) {
            if (response.data.code === 200) {
              ref.$message({
                type: 'success',
                message: '归还成功!'
              });
              ref.initList();
            }
            else {
              ref.open3(response.data.msg);
            }
          })
            .catch(function (err) {
            });
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消归还！'
          });
        });
      },

      open2() {
        this.$message({
          showClose: true,
          message: '保存成功！',
          type: 'success'
        });
      },
      open3(msg) {
        this.$message({
          showClose: true,
          message: msg,
          type: 'fail'
        });
      },

      open4() {
        this.$message({
          showClose: true,
          message: '机器不在你名下，请在租借或者在空闲状态下进行编辑！',
          type: 'fail'
        });
      },

      // 无法删除提示
      open5() {
        this.$message({
          showClose: true,
          message: '请在租借或者在空闲状态下进行删除！',
          type: 'fail'
        });
      },

      dateFormat(row, column) {
        let date = row[column.property];
        if (date === undefined || date == null) {
          return "";
        }
        return moment(date).format("YYYY-MM-DD HH:mm:ss");
      },
      status_format(row, column) {
        let type = row[column.property];
        if (type === "busy") {
          return "忙碌";
        } else if (type === "idle") {
          return "空闲";
        }
      },

      install_status_Format(row, column) {
        let type = row[column.property];
        if (type === "0") {
          return "待执行";
        } else if (type === "1") {
          return "机器重装中";
        } else if (type === "2") {
          return "机器重装成功";
        } else if (type === "3") {
          return "机器重装异常";
        } else if (type === "4") {
          return "机器部署中";
        } else if (type === "5") {
          return "机器部署成功";
        } else if (type === "6") {
          return "机器部署异常";
        }
      },

      // 修改表头颜色
      created() {
      }


    }
  }
</script>

<style scoped>
  .inquireRow {
    border: 0px solid #dddddd;
  }

  .small_font {
    font-size: 12px;
    margin-top: 12px;
  }

  .block {
    float: right;
    margin-top: 15px;
  }

  .el-tag + .el-tag {
    margin-left: 10px;
    margin-top: 8px;
  }

  .demo--label {
    display: inline-block;
  }

  .demo--radio {
    display: none;
  }

  .demo--radioInput {
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 100%;
    display: inline-block;
    height: 16px;
    margin-right: 10px;
    margin-top: -1px;
    vertical-align: middle;
    width: 16px;
    line-height: 1;
  }

  .demo--radio:checked + .demo--radioInput:after {
    background-color: #409eff;
    border-radius: 100%;
    content: "";
    display: inline-block;
    height: 10px;
    margin: 2px;
    width: 10px;
  }

  .demo--checkbox.demo--radioInput,
  .demo--radio:checked + .demo--checkbox.demo--radioInput:after {
    border-radius: 0;
  }

  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
</style>
