<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' @click="addTestPlan" icon="el-icon-plus">新 增</el-button>
                <el-button type="danger" size="small" @click="delTestPlanBatch">删 除</el-button>
            </div>
            <advance-filter :formData="form2" :filterArray="filterArray" @search="seachCondition" :show-number="4" storeName="testPlanList"></advance-filter>
        </el-row>

        <el-row>
            <el-table :data="testPlanList.programData" ref="table"
                      height="680" border class='_table' header-cell-class-name="_table-head"
                      @selection-change="handleSetSelectionChange">
                <el-table-column type="selection"></el-table-column>
                <el-table-column type="index" label="序号" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip prop="id" label="ID" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="测试任务名称"></el-table-column>
                <el-table-column show-overflow-tooltip label="项目版本" width="200">
                    <template slot-scope="scope">
                        <span>{{scope.row.project_name}} / {{scope.row.version_name}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip label="运行状态" width="200">
                    <template slot-scope="scope">
                        <el-progress v-if="statusList[scope.row.id] == 2" :stroke-width="8" :percentage="progressList[scope.row.id]"></el-progress>
                        <span v-if="statusList[scope.row.id] != 2" :class="'span-'+statusTagType(statusList[scope.row.id])">{{statusTagFormat(statusList[scope.row.id])}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="start_time" label="执行时间" :formatter="dateFormat" width="170"></el-table-column>
                <el-table-column show-overflow-tooltip prop="creator" label="创建人" width="120"></el-table-column>
                <el-table-column show-overflow-tooltip prop="modifiedby" label="修改人" width="120"></el-table-column>
                <table-operator :operateArray="operateArray" :width="280"></table-operator>
            </el-table>
        </el-row>
        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[20, 30, 50, 100, 150]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="testPlanList.count">
            </el-pagination>
        </div>

        <el-dialog title="填写配置" :visible.sync="configVisible">
            <div style="text-align: center">
                <el-checkbox v-model="customConfig.setup" border>启用Setup&Teardown</el-checkbox>
                <el-checkbox v-model="customConfig.host" border>启用自定义配置</el-checkbox>
                <hr style="height: 1px;border: none;background-color: #E6E6E6;" />
            </div>
            <div v-show="customConfig.setup">

                <el-tag class="_configTitle">Setup</el-tag>
                <div style="margin-left: 60px">
                    <el-checkbox-group v-model="choosedSetup" size="small">
                        <el-checkbox v-for="(item,index) in setupList" :label="item.description" :key="index" border style="margin: 5px"></el-checkbox>
                    </el-checkbox-group>
                </div>
                <el-tag class="_configTitle">Teardown</el-tag>
                <div style="margin-left: 60px">
                    <el-checkbox-group v-model="choosedTeardown" size="small">
                        <el-checkbox v-for="(item,index) in TeardownList" :label="item.description" :key="index" border style="margin: 5px"></el-checkbox>
                    </el-checkbox-group>
                </div>
                <hr style="height: 1px;border: none;background-color: #E6E6E6;" />
            </div>
            <div v-show="customConfig.host">
                <el-tag class="_configTitle">自定义参数</el-tag>
                <el-form class="_configForm _bottom0 demo-form-inline" >
                    <el-row>
                        <el-col :span="10">
                            <el-form-item label="Host" label-width="68px">
                                <el-input v-model="user_config.host" size="small" placeholder="Host，格式为ip:port" title="Tips:当勾选多个测试任务时，所有测试任务均使用此Host" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="10">
                            <el-form-item label="特征版本" label-width="90px">
                                <el-input v-model="user_config.feature_version" size="small" placeholder="特征版本" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="4">
                            <el-form-item label-width="30px">
                                <el-button type="text" icon="el-icon-circle-plus" @click="addConfigParam">增加参数</el-button>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" v-for="(item,index) in extraConfig" :key="index">
                            <el-form-item  :label-width="index%2 == 0?'68px':'30px'">
                                <el-input v-model="item.name" size="small" placeholder="key" auto-complete="off" style="width:35%"></el-input>
                                <el-input v-model="item.value" size="small" placeholder="value" auto-complete="off" style="width:45%"></el-input>
                                <el-button type="text" icon="el-icon-remove" @click="removeConfigParam(index)"></el-button>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <hr style="height: 1px;border: none;background-color: #E6E6E6;" />
            </div>

            <el-form :inline="true" class="demo-form-inline">
                <el-form-item label="请求协议" label-width="120px">
                    <el-select v-model="user_config.protocol" size="small">
                        <el-option value="HTTP" key="HTTP" label="HTTP"></el-option>
                        <el-option value="HTTPS" key="HTTPS" label="HTTPS"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="执行方式">
                    <el-select v-model="concurrent" size="small">
                        <el-option :value="0" label="串行"></el-option>
                        <el-option :value="1" label="并行"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="是否release版本" label-width="120px">
                    <el-switch
                            v-model="release"
                            active-color="#13ce66">
                    </el-switch>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="configVisible = false">取 消</el-button>
                <el-button type="primary" @click="runPlan">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="邮件发送报告" :visible.sync="reportVisible">
            <div>
                <el-tag class="_configTitle">请填写完整邮件地址，多个地址以英文逗号分隔</el-tag>
                <el-form style="width: 80%">
                    <el-form-item label="收件人：" label-width="100px" required>
                        <el-input v-model="email" size="small" placeholder="收件人邮箱地址" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="抄送：" label-width="100px">
                        <el-input v-model="cc" size="small" placeholder="抄送人邮箱地址" auto-complete="off"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="reportVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmSendReport">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="克隆任务" :visible.sync="cloneVisible" width="40%">
            <el-form :inline="true" class="demo-form-inline">
                <el-form-item label="新测试任务名称" label-width="120px" required>
                    <el-input v-model.trim="clonePlan.title" style="width: 450px"></el-input>
                </el-form-item>
                <el-form-item label="项目" label-width="120px" required>
                    <el-select v-model="clonePlan.project_id"
                               @change="clonePlan.version_id=''">
                        <el-option
                                v-for="(item,index) in projectList"
                                :label="item.name"
                                :value="item.id"
                                :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="版本" label-width="50px" required>
                    <el-select v-model="clonePlan.version_id"
                               style="width: 90%;"
                               @visible-change="getVersion">
                        <el-option
                                v-for="(item,index) in versionList"
                                :label="item.version"
                                :value="item.id"
                                :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
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
    import { FilterProject, FilterVersion, FilterModule } from '@/common/index';
    import { getProjectList, getVersionList } from '@/api/project';
    import { remarkCase } from '@/api/case';
    import { stopTestset, getTestsetLog, getSetup } from '@/api/testset';
    import { getTestPlanList, deleteTestPlan, deleteTestPlanBatch, cloneTestPlan } from '@/api/testPlan';
    import { getPlanProgress, getPlanSetProgress, getPlanSetDetail, setPlanSetCaseResult } from '@/api/testPlan';
    import { runTestPlan, createSetReport, getTestPlanReport, getPlanSetReport } from '@/api/testPlan';
    import moment from 'moment' //引入moment化简时间
    const rootPath = process.env.BASE_API;

    export default {
        name: 'testPlanList',
        components: {AdvanceFilter, TableOperator},
        data() {
            return {
                intervalId: true,
                form2: {
                    project_id: '',
                    version_id: '',
                    title:'',
                    run_status:'',
                    modifier:'',
                    id: '',
                },
                email: '',
                cc: '',
                release: false,
                concurrent: 0,
                user_config: {
                    host :'',
                    feature_version:'',
                    protocol:'HTTP'
                },
                extraConfig:[],
                customConfig:{
                    setup: false,
                    host: false,
                },
                statusList: {},
                progressList: {},
                testPlanList: {
                    page_no: 1,//页面开始页码
                    page_size: 20,//每页条数
                    count: 0,//总数目
                    programData: [], //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                projectList: [],
                versionList: [],
                choosedPlanList: [],
                pageNums: 20,//每页几条
                pageNum: 1, //当前是第几页
                dialogFormVisible: false,
                configVisible: false,
                reportVisible: false,
                cloneVisible: false,
                setupList:[],
                TeardownList:[],
                choosedSetup: [],
                choosedTeardown:[],
                clonePlan: {
                    title: '',
                    project_id: '',
                    version_id: ''
                },
                currentRow: {},
                isEdit:false,
                operateArray: [
                    {label:'执行', click:this.handleRunPlan,disable: (row)=>{return [2,5,6].includes(this.statusList[row.id])}},
                    {label:'停止', type:"danger", click:this.handleStopPlan, dropdown:true,
                        disable: (row)=>{return ![2,5,6].includes(this.statusList[row.id])},
                        dropList:[
                            {label:'等待停止', command:1},
                            {label:'立即停止', command:2},
                        ]
                    },
                    {label:'执行详情', click:this.goToSetDetail},
                    {label:'编辑', click:this.updateSelf1},
                    {label:'克隆', click:this.cloneSelf1},
                    {label:'发送报告', click:this.sendReport},
                ],
                filterArray: [
                    {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject,
                        change:()=>{this.form2.version_id=''}},
                    {key:'version_id',name:'版本',type:'select',optionList:[],visible: this.getFilterVersion,
                        disable:()=>{return this.form2.project_id===''}},
                    {key:'id',name:'ID',type:'input'},
                    {key:'title',name:'测试任务名称',type:'input'},
                    {key:'run_status',name:'运行状态',type:'select',optionList:[
                            {label:"待执行", value:'0'},
                            {label:"已完成", value:'1'},
                            {label:"执行中", value:'2'},
                            {label:"已停止", value:'3'},
                            {label:"执行异常", value:'4'},
                        ]
                    },
                    {key:'modifier',name:'修改人',type:'input'},
                ]
            }
        },
        directives:{
            loadmore: {
                // 指令的定义
                bind: function (el,binding) {
                    // 获取element-ui定义好的scroll盒子
                    const TABLEWRAP_DOM = el.querySelector('.el-table__body-wrapper');
                    TABLEWRAP_DOM.addEventListener('scroll', function() {
                        /*
                         * scrollHeight 获取元素内容高度(只读)
                         * scrollTop 获取或者设置元素的偏移值,常用于计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
                         * clientHeight 读取元素的可见高度(只读)
                         * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
                         * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
                         */
                        if(this.scrollHeight - this.scrollTop === this.clientHeight){
                            binding.value(this.scrollTop);
                        }
                    })
                }
            }
        },

        mounted() {
            if(window.sessionStorage.getItem("testPlanList")){
                this.form2 = JSON.parse(window.sessionStorage.getItem("testPlanList"));
                this.getFilterProject(this.filterArray[0]);
                this.getFilterVersion(this.filterArray[1]);
            }
            this.initList();
            this.getProject();
            this.intervalId = setInterval(() => {
                this.getTestPlanProgress();
            }, 5000)
        },
        beforeDestroy() {
            clearInterval(this.intervalId)
        },
        methods: {
            goToSetDetail(self){
                  //存入 
                window.sessionStorage.setItem("objSelf",JSON.stringify(self))
                this.$router.push({
                    path: '/autoTest/planSetList',
                    name: 'planSetList',
                    params: {
                        dataObj: self
                    }
                })
                this.$store.dispatch('app/toggleChildNav', '/autoTest/testPlan')
            },
            initList() {
                let self = this;
                getTestPlanList({
                    page_no: this.pageNum,
                    page_size: this.pageNums,
                    project_id: this.form2.project_id,
                    version_id: this.form2.version_id,
                    title: this.form2.title,
                    run_status: this.form2.run_status,
                    modifier: this.form2.modifier,
                    id: this.form2.id
                }).then(function(response){
                    self.testPlanList = {
                        page_no: self.pageNum,
                        page_size: 20 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.collections
                    }
                    self.getTestPlanProgress();
                })
            },
            getTestPlanProgress(){
                let list = [];
                this.testPlanList.programData.forEach(function(item) {
                    list.push(item.id);
                })
                if(list.length === 0){
                    return
                }
                let self = this;
                getPlanProgress({collection_ids: list}).then(function (response) {
                    for(var key in response.data){
                        var plan = response.data[key];
                        if(plan.code == 0){
                            if(plan.status==2){
                                let tmp = (plan.progress * 100).toFixed(2);
                                self.$set(self.progressList, key, parseFloat(tmp));
                            }
                            else{
                                self.$set(self.progressList, key, 0);
                            }
                            self.$set(self.statusList, key, plan.status);
                        }
                        else{
                            self.$set(self.progressList, key, 0);
                            self.$set(self.statusList, key, plan.msg);
                        }
                    }
                })
            },
            getPlanSetup(){
                let self = this;
                getSetup({collection_id: this.currentRow.id}).then(function(response){
                    if(response.data.code === 0) {
                        self.setupList = response.data.setup
                        self.TeardownList = response.data.teardown
                    }
                    else{
                        console.log(response.data.msg)
                    }
                })
            },
            addTestPlan(){
                window.sessionStorage.setItem("updateSelf",JSON.stringify({}))
                this.$router.push({
                    path: 'autoTest/addTestPlan',
                    name: 'addTestPlan',
                })
                this.$store.dispatch('app/toggleChildNav', '/autoTest/testPlan')
            },
            updateSelf1(self){
                //存入
                window.sessionStorage.setItem("updateSelf",JSON.stringify(self))
                this.$router.push({
                    path: 'autoTest/editTestPlan',
                    name: 'editTestPlan',
                    params:{
                        dataObj: self
                    }
                })
                this.$store.dispatch('app/toggleChildNav', '/autoTest/testPlan')
            },
            cloneSelf1(self){
                this.currentRow = self;
                this.clonePlan.project_id = self.project_id;
                this.clonePlan.version_id = self.version_id;
                this.getVersion(true);
                this.cloneVisible = true;
            },
            submitClone(){
                if(this.clonePlan.title === ''){
                    this.$notify.error("测试任务名称不可以为空！");
                    return false;
                }
                let ref = this;
                cloneTestPlan(ref.currentRow.id,ref.clonePlan).then(function (response) {
                    if(response.data.code === 0){
                        ref.$message.success("克隆成功！");
                        ref.cloneVisible = false;
                        ref.clonePlan = {
                            title: '',
                            project_id: '',
                            version_id: ''
                        };
                        ref.initList();
                    }
                    else{
                        ref.$message.error(response.data.msg);
                    }
                })
            },
            sendReport(self){
                this.currentRow = self;
                this.reportVisible = true;
            },
            confirmSendReport(){
                let ref = this;
                let emailList = ref.email.split(",");
                let ccList = ref.cc.split(",");
                this.$message.info("正在生成并发送报告，请稍后...");
                getTestPlanReport({
                    collection_id: this.currentRow.id,
                    email: ref.email == "" ? [] : emailList,
                    cc: ref.cc == "" ? [] : ccList
                }).then(function (response) {
                    if(response.data.code === 0){
                        ref.reportVisible = false;
                        ref.$message.success("报告发送成功！");
                        setTimeout(() => {
                            window.open(rootPath + '/common/report/' + response.data.path)
                        }, 1000)
                    }
                    else{
                        ref.$message.error(response.data.msg)
                    }
                })
            },
            delTestPlanBatch(){
                if(this.choosedPlanList.length < 1){
                    this.$message.error("请至少选择一个测试任务！");
                    return
                }
                let set_ids = this.getIdFromList(this.choosedPlanList);
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '批量删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteTestPlanBatch({set_ids:set_ids}).then(function (response) {
                        ref.$message.info(response.data.msg);
                        ref.initList();
                    }).catch(function (err) {
                    });
                }).catch(() => {})
            },
            handleRunPlan(self){
                this.currentRow = self;
                this.resetForm();
                this.getPlanSetup();
                this.configVisible = true;
            },
            handleStopPlan(val, self){
                let ref = this;
                this.$confirm('将停止执行该任务下所有测试集，此操作无法撤销, 是否继续?', '停止执行', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    stopTestset({
                        collection_id: self.id,
                        set_id: self.set_ids,
                        choice: val
                    }).then(function (response) {
                        if(response.data.code === 0){
                            ref.$message.success(response.data.msg);
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
                    .catch(function (err) {
                    });
                }).catch(() => {})
            },
            addConfigParam(){
                this.extraConfig.splice(0,0,{name: '', value: ''})
            },
            removeConfigParam(index){
                this.extraConfig.splice(index,1)
            },
            checkUserConfig(){
                for(var item of this.extraConfig){
                    if(item.name){
                        this.$set(this.user_config, item.name, item.value)
                    }
                }
                for(var key in this.user_config){
                    if(this.user_config[key] === ""){
                        delete this.user_config[key]
                    }
                }
            },
            convertSetupMap(){
                if(this.choosedSetup.length === 0){
                    return {};
                }
                let map = {};
                let self = this;
                this.setupList.forEach(function(item){
                    if(self.choosedSetup.indexOf(item.description) !== -1){
                        map[item.name] = true;
                    }
                })
                return map;
            },
            convertTeardownMap(){
                if(this.choosedTeardown.length === 0){
                    return {};
                }
                let map = {};
                let self = this;
                this.TeardownList.forEach(function(item){
                    if(self.choosedTeardown.indexOf(item.description) !== -1){
                        map[item.name] = true;
                    }
                })
                return map;
            },
            runPlan() {
                let ref = this;
                this.checkUserConfig();
                runTestPlan({
                    collection_id: ref.currentRow.id,
                    release: ref.release,
                    concurrent: ref.concurrent,
                    user_config: ref.customConfig.host ? ref.user_config : {},
                    setup: ref.customConfig.setup ? ref.convertSetupMap() : {},
                    teardown: ref.customConfig.setup ? ref.convertTeardownMap() : {},
                }).then(function (response) {
                    if(response.data.code === 0){
                        ref.$message.success("后台正在执行！");
                        ref.configVisible = false;
                        ref.getTestPlanProgress();
                    }
                    else {
                        ref.$message.error(response.data.msg);
                    }
                })
                .catch(function (err) {
                });
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
            seachCondition() {
                this.pageNum = 1;
                this.initList();
            },
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined || date === null) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            statusTagType(status){
                switch(status){
                    case 0:
                        return "warning";
                    case 3:
                        return "info";
                    case 4:
                        return "danger";
                    default:
                        return "success";
                }
            },
            statusTagFormat(status){
                switch(status){
                    case 0:
                        return "待执行";
                    case 1:
                        return "已完成";
                    case 3:
                        return "已停止";
                    case 4:
                        return "执行异常";
                    case 5:
                        return "正在执行Setup";
                    case 6:
                        return "正在执行TearDown";
                    default:
                        return status;
                }
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getVersion(flag){
                let self = this;
                if(flag == true){
                    getVersionList({project_id: self.clonePlan.project_id}).then(function (response) {
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            getFilterProject(item){
                FilterProject(item)
            },
            getFilterVersion(item){
                FilterVersion(item, this.form2)
            },
            handleSetSelectionChange(val){
                this.choosedPlanList = val;
            },
            getIdFromList(list){
                let tmp = [];
                list.forEach(function(item){
                    tmp.push(item.id)
                })
                return tmp;
            },
            handleSizeChange(val) {
                this.pageNums = val;
                this.pageNum = 1;
                this.initList();
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.initList();
            },
            resetForm(){
                this.user_config = {host :'',feature_version:'',protocol:'HTTP'};
                this.extraConfig = [];
                this.release = false;
                this.concurrent = 0;
                this.customConfig = {
                    setup: false,
                    host: false,
                }
                this.setupList = [];
                this.TeardownList = [];
                this.choosedSetup = [];
                this.choosedTeardown = [];
            },
            tableRowStyle({ row, rowIndex }) {
                return 'background-color: #fef8ef'
            },
            tableHeaderColor({ row, column, rowIndex, columnIndex }) {
                if (rowIndex === 0) {
                    return 'background-color: #fef8ef'
                }
            },
        },
    }
</script>

<style scoped>
    .el-textarea.is-disabled .el-textarea__inner {
        color: #606266;
        border: none;
        width: 100%;
    }

    .block {
        float: right;
        margin-top: 15px;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }

    ._caseStep{
        display:block;
        line-height: 20px;
        word-break: break-all;
        word-wrap: break-word;
        text-indent:4em;
    }

    ._configTitle{
        font-size: 16px;
        margin: 10px 0;
    }

    ._configForm{
        margin-left: 10%;
        width: 80%;
    }

    .link-in-table{
        color: #0066cc;
        text-decoration: none;
    }

    .link-in-table:hover{
        color: #008489;
        text-decoration: underline;
    }

</style>

