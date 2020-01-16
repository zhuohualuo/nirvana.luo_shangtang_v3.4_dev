<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' icon="el-icon-plus" @click="addTaskSet">新 增</el-button>
            </div>
            <advance-filter :formData="form2" :filterArray="filterArray" @search="seachCondition"></advance-filter>
        </el-row>

        <el-row>
            <el-table :data="taskSetList.programData" ref="table"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <!--<el-table-column type="index" label="序号" width="55"></el-table-column>-->
                <el-table-column show-overflow-tooltip prop="id"  width="70" label="ID"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="测试集名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="project" label="项目" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="cfg_name" label="配置项" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip label="运行状态" width="200">
                    <template slot-scope="scope">
                        <div v-if="statusList[scope.row.id] == 2">
                            <el-progress  :stroke-width="8" :percentage="progressList[scope.row.id].progress"></el-progress>
                            <span>当前用例：{{progressList[scope.row.id].each_task_id}}</span>
                        </div>
                        <span v-if="statusList[scope.row.id] != 2" :class="'span-'+statusTagType(statusList[scope.row.id])">{{statusTagFormat(statusList[scope.row.id])}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="更新时间" :formatter="dateFormat" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="executor" label="操作人" width="170"></el-table-column>
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[20, 30, 50, 100, 150]" :total="taskSetList.count"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper">
            </el-pagination>
        </div>

        <el-dialog :title="editDisable?'编辑测试集':'新增测试集'" :visible.sync="dialogFormVisible" width="70%">
            <el-form :model="form" :rules="formRule" ref="form" :inline="true" class="demo-form-inline">
                <el-form-item label="测试集名称" :label-width="formLabelWidth" prop="title">
                    <el-input v-model.trim="form.title" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id">
                    <el-select v-model="form.project_id" placeholder="请选择" :disabled="editDisable" @change="choosedProject">
                        <el-option v-for="(item,index) in projectList" :label="item.name" :value="item.id" :key="index"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="配置项" :label-width="formLabelWidth" prop="config_id">
                    <el-select v-model="form.config_id" placeholder="请选择" :disabled="form.project_id===''" @visible-change="getConfig">
                        <el-option v-for="(item,index) in configList" :label="item.cfg_name" :value="item.id" :key="index"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item >
                    <el-button type="text" @click="GenerateConfig">生成配置</el-button>
                </el-form-item>
            </el-form>
            <el-transfer filterable filter-placeholder="请输入关键字" :titles="['待选用例', '已选用例']" v-model="form.task_ids"  :data="taskList">
            </el-transfer>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="savePerfSetManage">保 存</el-button>
            </div>
        </el-dialog>

        <el-dialog title="生成配置" :visible.sync="dialogConfigVisible">
            <el-form :model="formTaskConfig" ref="formTaskConfig">
                <el-form-item label="配置名称" label-width="70px">
                    <el-input v-model="formTaskConfig.cfg_name" placeholder="请输入配置名称（可选）" auto-complete="off" style="width: 50%"></el-input>
                </el-form-item>
            </el-form>
            <config-table :tableColumn="tableColumn" :tableData="formTaskConfig.keys" :height="450"></config-table>

            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogConfigVisible = false">取 消</el-button>
                <el-button type="primary" @click="save">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="填写配置" :visible.sync="configVisible">
            <el-tag class="_configTitle">Setup</el-tag>
            <div>
                <el-checkbox-group v-model="choosedSetup">
                    <el-checkbox v-for="(item,index) in setupList" :label="item.description" :key="index" border></el-checkbox>
                </el-checkbox-group>
            </div>
            <br/>
            <br/>
            <el-tag class="_configTitle">邮件发送至(请填写完整邮件地址，以英文逗号分隔)</el-tag>
            <el-form>
                <el-form-item label="收件人" :label-width="formLabelWidth">
                    <el-input v-model="email" placeholder="请输入收件人邮箱地址" auto-complete="off" style="width: 80%"></el-input>
                </el-form-item>
                <el-form-item label="抄送" :label-width="formLabelWidth">
                    <el-input v-model="cc" placeholder="请输入抄送人邮箱地址" auto-complete="off" style="width: 80%"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="configVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleConfig">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="报告列表" :visible.sync="reportVisible">
            <el-table :data="reportList.programData"
                      height="490" border class='_table' header-cell-class-name="_table-head">
                <el-table-column label="报告名称">
                    <template slot-scope='props'>
                        <a class="link-in-table" @click="getReportPath(props.row)">{{props.row.title}}</a>
                        <el-tag v-if="(pageNum_S === 1)&&(props.$index === 0)" type="danger" style="margin-left: 10px">最新</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="pass_count" label="成功数" width="100"></el-table-column>
                <el-table-column prop="fail_count" label="失败数" width="100"></el-table-column>
                <el-table-column prop="created_time" label="创建时间" width="170" :formatter="dateFormat"></el-table-column>
            </el-table>
            <div class="block" style="float: left">
                <el-pagination @size-change="handleSizeChange_S" @current-change="handleCurrentChange_S" :current-page="pageNum_S"
                               :page-sizes="[20, 30, 50]"  :total="reportList.count"
                               :page-size="pageNums_S" layout="total, sizes, prev, pager, next, jumper">
                </el-pagination>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="reportVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog  title="克隆测试集" :visible.sync="cloneVisible"  width="30%">
            <el-input v-model.trim="setCloneData.title">
                <span slot="prepend">新测试集名称</span>
            </el-input>
            <span slot="footer" class="dialog-footer">
            <el-button @click="cloneVisible = false">取 消</el-button>
            <el-button  type="primary" @click="submitSetClone">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>
<script>
    import AdvanceFilter from "../../components/AdvanceFilter/index";
    import TableOperator from "../../components/TableOperator/index";
    import ConfigTable from "../../components/ConfigTable/index";
    import { FilterProject } from '@/common/index';
    import { getProjectList, getVersionList } from '@/api/project';
    import { getPerfSetList, createPerfSet, updatePerfSet, deletePerfSet } from '@/api/performance';
    import { getProgress, getConfigList, getPerfTaskList,reqSetClone,getTaskByIds,saveTaskConfig } from '@/api/performance';
    import { runPerfTaskSet, stopPerfTaskSet, getPerfHistoryReport, getSetup } from '@/api/performance';
    import { openFile } from '@/api/others';
    import moment from 'moment' //引入moment化简时间
    const rootPath = process.env.BASE_API;

    export default {
        name: "perfTaskSet",
        components: {AdvanceFilter, TableOperator, ConfigTable},
        data() {
            return {
                intervalId: true,
                form: {
                    id: 0,
                    title: '',
                    project_id: '',
                    task_ids: [],
                    config_id: ''
                },
                form2: {
                    project_id: '',
                    id: '',
                    title: '',
                    run_status: '',
                    executor: '',
                },
                taskSetList: {
                    page_no: 1,//页面开始页码
                    page_size: 20,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据
                },
                taskList: [],
                reportList: {
                    page_no: 1,//页面开始页码
                    page_size: 20,//每页条数
                    count: 0,//总数目
                    programData: [], //返回来的数据
                },
                email: '',
                cc: '',
                currentRow: {},
                statusList: {},
                progressList: {},
                projectList: [],
                configList: [],
                formLabelWidth: '100px',
                pageNums: 20,//每页几条
                pageNum: 1, //当前是第几页
                pageNums_S: 20,//每页几条
                pageNum_S: 1, //当前是第几页
                dialogFormVisible: false,
                reportVisible: false,
                configVisible: false,
                remarkVisible: false,
                editDisable: false,
                dialogConfigVisible:false,
                dialogKeysEditVisible:false,
                formRule:{
                    title: [
                        { required: true, message: '请填写测试集名称', trigger: 'blur' }
                    ],
                    project_id: [
                        { required: true, message: '请选择项目', trigger: 'change' }
                    ],
                    config_id: [
                        { required: true, message: '请选择配置项', trigger: 'change' }
                    ]
                },
                setupList:[],
                choosedSetup: [],
                caseRemark: {
                    id: '',
                    title: '',
                    remark: ''
                },
                cloneVisible :false,
                setCloneData:{
                    set_id :"",
                    title :""
                },
                form_task_ids: {
                    ids:[],
                },
                formTaskConfig:{
                    keys:[],
                    project_id:"",
                    cfg_name:""
                },
                operateArray: [
                    {label:'执行', click:this.handleRunSet,
                        disable: (row)=>{return [2,5,6].includes(this.statusList[row.id])},
                    },
                    {label:'停止', type:"danger", click:this.handleStopSet, dropdown:true,
                        disable: (row)=>{return ![2,5,6].includes(this.statusList[row.id])},
                        dropList:[
                            {label:'跳过当前', command:1},
                            {label:'立即停止', command:2},
                        ]
                    },
                    {label:'报告', click:this.getReportDetail},
                    {label:'编辑', click:this.updateSelf1},
                    {label:'克隆', click:this.setClone},
                    {label:'删除', click:this.deleteSelf1},
                ],
                filterArray: [
                    {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject},
                    {key:'id',name:'ID',type:'input'},
                    {key:'title',name:'测试集名称',type:'input'},
                    {key:'run_status',name:'状态',type:'select',optionList:[
                            {label:"待执行",value:"0"},
                            {label:"已完成",value:"1"},
                            {label:"执行中",value:"2"},
                            {label:"已停止",value:"3"},
                            {label:"执行异常",value:"4"},
                            {label:"正在执行Setup",value:"5"},
                        ]
                    },
                    {key:'executor',name:'操作人',type:'input'},
                ],
                tableColumn:[
                    {label:"参数",key:"key",type:"input",require:true},
                    {label:"值",key:"value",type:"input",require:true},
                ],
            }
        },
        mounted() {
            this.initList();
            this.getProject();
            this.intervalId = setInterval(() => {
                this.getPerfSetProgress();
            }, 60000)
        },
        beforeDestroy() {
            clearInterval(this.intervalId)
        },
        methods: {
            initList() {
                let self = this;
                getPerfSetList({
                    page_no: this.pageNum,
                    page_size: this.pageNums,
                    project_id:this.form2.project_id,
                    id: this.form2.id,
                    title: this.form2.title,
                    run_status: this.form2.run_status,
                    executor: this.form2.executor,
                }).then(function(response){
                    self.taskSetList = {
                        page_no: self.pageNum,
                        page_size: 20 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.sets
                    }
                    self.getPerfSetProgress();
                })
            },
            getPerfSetProgress(){
                let list = [];
                this.taskSetList.programData.forEach(function(item) {
                    list.push(item.id);
                })
                if(list.length === 0){
                    return
                }
                let self = this;
                getProgress({set_id: list}).then(function (response) {
                    for(var key in response.data){
                        var set = response.data[key];
                        if(set.code == 0){
                            if(set.status==2){
                                let tmp = (set.progress * 100).toFixed(2);
                               self.$set(self.progressList,key,{
                                    progress:parseFloat(tmp),
                                    each_task_id:set.each_task_id
                                });
                            }
                            else{
                                self.$set(self.progressList,key,{
                                    progress:0,
                                    each_task_id:''
                                });
                            }
                            self.$set(self.statusList, key, set.status);
                        }
                        else{
                            self.$set(self.progressList,key,{
                                progress:0,
                                each_task_id:''
                            });
                            self.$set(self.statusList, key, set.msg);
                        }
                    }
                })
            },
            addTaskSet(){
                this.resetForm();
                this.dialogFormVisible = true;
                this.editDisable = false;
            },
            updateSelf1(self){
                this.resetForm();
                this.form = Object.assign({},self);
                this.getConfig(true);
                this.getTask();
                this.editDisable = true;
                this.dialogFormVisible = true;
            },
            deleteSelf1(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deletePerfSet(self.id).then(function (response) {
                        if (response.data.code === 0) {
                            ref.$message.success("删除成功！");
                            ref.initList();
                        }
                        else {
                            ref.$message.error(response.data.msg)
                        }
                    }).catch(function (err) {
                    });
                }).catch(() => {})
            },
            getReportDetail(self) {
                this.pageNums_S = 20;
                this.pageNum_S = 1;
                this.currentRow = self;
                this.getReportHistory();
            },
            getReportHistory(){
                let ref = this;
                getPerfHistoryReport(ref.currentRow.id, {
                    page_no: this.pageNum_S,
                    page_size: this.pageNums_S
                }).then(function(response){
                    if(response.data.code === 0){
                        ref.reportList = {
                            page_no: ref.pageNum_S,
                            page_size: 20 || ref.pageNum_S,
                            count: response.data.total,
                            programData: response.data.reports
                        }
                        ref.reportVisible = true;
                    }
                    else{
                        ref.$message.error(response.data.msg)
                    }
                })
            },
            openLink(link){
                let self = this;
                openFile(link).then(function(response){
                    if(response.data.code === 3){
                        self.$message.error(response.data.msg);
                    }
                    else{
                        window.open(link);
                    }
                })
            },
            getReportPath(self) {
                let url = rootPath + '/common/report/' + self.report_path;
                this.openLink(url);
            },
            handleRunSet(self){
                this.getSetup();
                this.currentRow = self;
                this.configVisible = true;
            },
            handleConfig(){
                this.runTaskSet();
                this.configVisible = false;
            },
            runTaskSet() {
                let ref = this;
                let emailList = (ref.email === "") ? [] : ref.email.split(",");
                let ccList =  (ref.cc === "") ? [] : ref.cc.split(",");
                runPerfTaskSet({
                    set_id: ref.currentRow.id,
                    email: emailList,
                    cc: ccList,
                    setup: ref.convertSetupMap(),
                }).then(function (response) {
                    if(response.data.code === 0){
                        ref.$message.success(response.data.msg);
                        ref.getPerfSetProgress();
                    }
                    else {
                        ref.$message.error(response.data.msg);
                    }
                }).catch(function (err) {
                });
            },
            handleStopSet(val,self){
                let ref=this;
                this.$confirm(
                    val===1?"将跳过当前执行用例，执行下一项，此操作无法撤销，是否继续？":"将停止执行该测试集下所有用例，此操作无法撤销，是否继续？",
                    val===1?"跳过当前":"停止执行",
                    {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning"
                    }
                ).then(()=>{
                    stopPerfTaskSet({
                        set_id: self.id,
                        mode:val,
                    }).then(function(response){
                        if(response.data.code===0){
                            ref.$message.success(response.data.msg);
                        }else{
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function(err){})
                }).catch(()=>{})
            },
            savePerfSetManage() {
                let ref = this;
                if (ref.validateFormRule('form')) {
                    // id大于0为编辑，小于等于0为新增
                    if(ref.form.id > 0){
                        updatePerfSet(ref.form.id, ref.form).then(function (response) {
                            if (response.data.code === 0) {
                                ref.$message.success("保存成功！");
                                ref.initList();
                                ref.dialogFormVisible = false;
                            }
                            else {
                                ref.$message.error(response.data.msg);
                            }
                        })
                    }
                    else {
                        createPerfSet(ref.form).then(function (response) {
                            if (response.data.code === 0) {
                                ref.$message.success("保存成功！");
                                ref.initList();
                                ref.dialogFormVisible = false;
                            }
                            else {
                                ref.$message.error(response.data.msg);
                            }
                        })
                    }
                }
                else{
                    return false;
                }
            },
            seachCondition() {
                this.pageNum = 1;
                this.initList();
            },
            resetForm(){
                if(this.$refs["form"] != undefined) {
                    this.form = {
                        id: 0,
                        title: '',
                        project_id: '',
                        task_ids: [],
                        config_id: ''
                    };
                    this.form2 = {
                        project_id: '',
                        id: '',
                        title: '',
                        run_status: '',
                        executor: '',
                    }
                    this.setupList = [];
                    this.taskList = [];
                    this.choosedSetup = [];
                    this.$nextTick(()=>{
                        this.$refs["form"].clearValidate();
                    })
                }
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
                    default:
                        return '';
                }
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getFilterProject(item){
                FilterProject(item)
            },
            getConfig(flag){
                let self = this;
                if(flag == true){
                    getConfigList({project_id: self.form.project_id}).then(function (response) {
                        self.configList = response.data.keys;
                    }).catch(function (err) {
                    });
                }
            },
            getSetup(){
                let self = this;
                getSetup().then(function(response){
                    if(response.data.code === 0) {
                        self.setupList = response.data.setup
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                })
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
                    else{
                        map[item.name] = false;
                    }
                });
                return map;
            },
            choosedProject(){
                this.form.config_id = '';
                this.form.task_ids=[];
                this.getTask();
            },
            getTask(){
                let self = this;
                this.taskList = [];
                getPerfTaskList({project_id: this.form.project_id}).then(function (response) {
                    for(let item of response.data.tasks){
                        self.taskList.push({key: item.id, label: item.title})
                    }
                }).catch(function (err) {
                });
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
            handleSizeChange_S(val) {
                this.pageNums_S = val;
                this.pageNum_S = 1;
                this.getReportHistory();
            },
            handleCurrentChange_S(val) {//改变页码
                this.pageNum_S = val;
                this.getReportHistory();
            },
            validateFormRule(formName){
                let result = false;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        result = true;
                    }
                    else {
                    }
                })
                return result;
            },
            //克隆测试集
            setClone(row){
                this.cloneVisible = true;
                this.setCloneData.set_id = row.id;
            },
            submitSetClone(){
                let self = this;
                if(self.setCloneData.title === ''){
                    self.$notify.error("测试集名称不可以为空！");
                    return false;
                }
                reqSetClone(self.setCloneData).then(function (response){
                    if(response.data.code == 0){
                        self.cloneVisible = false;
                        self.setCloneData.set_id="";
                        self.setCloneData.title="";
                        self.initList();
                        self.$message.success(response.data.msg)
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                }).catch(function(err){

                });
            },
            GenerateConfig(){
                let self = this;
                if(self.form.task_ids.length==0){
                    return self.$message.warning("已选任务列表为空！")
                }
                self.form_task_ids.ids=self.form.task_ids;
                getTaskByIds(self.form_task_ids).then(function(response){
                    if(response.data.code == 0 ){
                        self.formTaskConfig.project_id = self.form.project_id;
                        self.formTaskConfig.keys = response.data.data;
                        self.dialogConfigVisible=true;
                    }else{
                        self.$message.error(response.data.msg)
                    }
                });
            },
            save(){
                var flag = false;
                this.formTaskConfig.keys.map(item=>{
                    if(item.value == ''){
                        flag = true;
                        return this.$message.error(`${item.key} 的value值不可以为空！`)
                    }
                })
                if(flag){return}
                let self = this;
                if(self.validateFormRule("formTaskConfig")){
                    saveTaskConfig(self.formTaskConfig).then(function(response){
                        if(response.data.code == 0 ){
                            self.$message.success("保存成功！")
                            self.dialogConfigVisible = false;
                            self.form.config_id = response.data.data;
                            self.getConfig(true)
                        }else{
                            self.$message.error(response.data.msg)
                        }
                    }).catch(function(err){
                    });
                }
            }
        }
    }
</script>
<style scoped>
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

    .link-in-table{
        color: #0066cc;
        text-decoration: none;
    }

    .link-in-table:hover{
        color: #008489;
        text-decoration: underline;
    }
    .el-checkbox.is-bordered.el-checkbox--medium{
        margin-right: 10px;
    }
    .el-checkbox.is-bordered + .el-checkbox.is-bordered {
        margin: 0 10px 10px 0;
    }
</style>

<style>
    .el-transfer-panel{
        width: 45%;
    }
    .el-transfer-panel__body{
        height: 430px;
    }
    .el-transfer-panel__list{
        height: 390px !important;
    }
</style>
