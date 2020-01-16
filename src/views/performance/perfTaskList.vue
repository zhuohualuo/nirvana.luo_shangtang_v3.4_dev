<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' @click="addPerf" icon="el-icon-plus">新 增</el-button>
                <el-button type="info" size='small' @click="addPerfScript">导入脚本</el-button>
                <el-button type="info" size='small' @click="PerfTaskUpload">导入任务</el-button>
                <el-button type="info" size='small' @click="getFileName">导出任务</el-button>
            </div>
            <advance-filter :formData="filter" :filterArray="filterArray" :showNumber="4" @search="seachCondition"></advance-filter>
        </el-row>

        <el-row>
            <el-table :data="List.programData" ref="table"
                      height="680" border class='_table' header-cell-class-name="_table-head"
                      @selection-change="handleSelectionChange">
                <el-table-column type="selection"></el-table-column>
                <el-table-column show-overflow-tooltip prop="id" label="ID" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="用例名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="host" label="Host" width="150"></el-table-column>
                <el-table-column show-overflow-tooltip prop="project" label="项目" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="type" label="场景/测试工具" width="140">
                    <template slot-scope='scope'>
                        {{scope.row.type}} / {{scope.row.tool}}
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="file_path" label="任务类型" width="100">
                    <template slot-scope='scope'>
                        {{scope.row.file_path?'脚本任务':'普通任务'}}
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="status" label="状态" :formatter="typeFormat" width="100">
                    <template slot-scope="scope">
                        <span :class="'span-'+typeFormat(scope.row.status)">{{statusTagFormat(scope.row.status)}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="executor" label="操作人" width="120"></el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="修改日期" :formatter="dateFormat" width="170"></el-table-column>
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[20, 30, 50, 100, 150]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="List.count">
            </el-pagination>
        </div>

        <el-dialog title="任务内容" :visible.sync="dialogFormVisible">
            <span>title</span>
            <div style="overflow: auto;max-height: 490px;border: 1px solid #dcdfe6;">
                <pre>{{content}}</pre>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="执行任务" :visible.sync="configVisible" width="30%">
            <el-form>
                <el-form-item label="配置项" label-width="120px" style="width: 85%">
                    <el-select v-model="excuteConfig"
                               clearable filterable style="width: 100%"
                               @visible-change="getConfig">
                        <el-option
                                v-for="(item,index) in configList"
                                :label="item.cfg_name"
                                :value="item.id"
                                :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="configVisible = false">取 消</el-button>
                <el-button type="primary" @click="runPerfTask">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="克隆用例" :visible.sync="cloneVisible" width="40%">
            <el-input v-model.trim="cloneName">
                <span slot="prepend">新测试用例名称</span>
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
    import {FilterProject} from '@/common/index';
    import {getProjectList} from '@/api/project';
    import {clonePerfTask, deletePerfTask, getConfigList, getPerfTaskList, runPerfTask,downloadTask} from '@/api/performance';
    import {openFile} from '@/api/others';
    import moment from 'moment'; //引入moment格式化时间
    const rootPath = process.env.BASE_API;

    export default {
        name: 'perfTaskList',
        components: {AdvanceFilter, TableOperator},
        data() {
            return {
                filter: {
                    id: '',
                    title: '',
                    project_id: '',
                    status: '',
                    tool: '',
                    type: '',
                    executor: '',
                },
                title: '',
                content: '',
                pageNums: 20,//每页几条
                pageNum: 1, //当前是第几页
                formLabelWidth: '120px',
                dialogFormVisible: false,
                configVisible: false,
                cloneVisible: false,
                List: {
                    page_no: 1,//页面开始页码
                    page_size: 20,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                currentRow: {},
                projectList: [],
                configList: [],
                cloneName: '',
                excuteConfig: '',
                email: '',
                cc: '',
                multipleSelection: '',
                operateArray: [
                    {label:'查看', click:this.viewDetail},
                    {label:'执行', click:this.handleRun},
                    {label:'报告', click:this.getReport},
                    {label:'编辑', click:this.updateSelf1},
                    {label:'克隆', click:this.copySelf1},
                    {label:'删除', click:this.deleteSelf1},
                ],
                filterArray: [
                    {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject},
                    {key:'id',name:'ID',type:'input'},
                    {key:'title',name:'用例名称',type:'input'},
                    {key:'status',name:'状态',type:'select',optionList:[
                            {label:"待执行",value:"0"},
                            {label:"正在执行",value:"1"},
                            {label:"已完成",value:"2"},
                            {label:"已停止",value:"3"},
                            {label:"执行异常",value:"4"},
                        ]
                    },
                    {key:'type',name:'场景',type:'select',optionList:[
                            {label:"单接口场景",value:"single"},
                            {label:"多接口串行场景",value:"flow"},
                            {label:"多接口混合场景",value:"mixed"}
                        ]
                    },
                    {key:'tool',name:'测试工具',type:'select',optionList:[
                            {label:"Gatling",value:"gatling"},
                            {label:"JMeter",value:"jmeter"}
                        ]
                    },
                    {key:'executor',name:'操作人',type:'input'},
                ],
            }
        },
        computed: {
        },
        mounted() {
            console.log("$route.filter",this.$route.params.filter)
            if((this.$route.params.filter !== null) && (this.$route.params.filter !== undefined)){
                this.filter = this.$route.params.filter;
            }
            this.getProject();
            this.initList();
        },
        methods: {
            handleSizeChange(val) {
                this.pageNums = val;
                this.pageNum = 1;
                this.initList();
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.initList();
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
            initList(){
                let self = this;
                getPerfTaskList({
                    page_no: this.pageNum,
                    page_size: this.pageNums,
                    id: this.filter.id,
                    title: this.filter.title,
                    project_id: this.filter.project_id,
                    status: this.filter.status,
                    tool: this.filter.tool,
                    type: this.filter.type,
                    executor: this.filter.executor,
                }).then(function (response) {
                    console.log(response)
                    self.List = {
                        page_no: self.pageNum,
                        page_size: 20 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.tasks
                    }
                }).catch(function (err) {
                });
            },
            seachCondition() {
                this.pageNum = 1;
                this.initList();
            },
            getConfig(flag){
                let self = this;
                if(flag == true){
                    getConfigList({project_id: self.currentRow.project_id}).then(function (response) {
                        console.log(response)
                        self.configList = response.data.keys;
                    }).catch(function (err) {
                    });
                }
            },
            handleRun(self){
                this.currentRow = self;
                this.configVisible = true;
            },
            runPerfTask(){
                let self = this;
                runPerfTask({
                    task_id: this.currentRow.id,
                    config_id: this.excuteConfig,
                    email: this.email === '' ? [] : this.email.split(','),
                    cc: this.cc === '' ? [] : this.cc.split(',')
                }).then((response)=>{
                    console.log(response)
                    if(response.data.code === 0){
                        self.configVisible = false;
                        self.$message.success("任务正在执行！请稍后查看报告");
                    }
                    else {
                        self.$message.error(response.data.msg);
                    }
                })
            },
            viewDetail(self){
                this.content = JSON.stringify(self.task, null, 4);
                this.title = self.title;
                this.dialogFormVisible = true;
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
            getReport(self) {
                if(self.report_path){
                    let url = rootPath + '/common/report/' + self.report_path;
                    this.openLink(url);
                }
                else {
                    this.$message.error('报告不存在！')
                }
            },
            deleteSelf1(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deletePerfTask(self.id).then(function (response) {
                        console.log(response.data);
                        if (response.data.code === 0) {
                            ref.$message.success("删除成功！");
                            ref.initList();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function (err) {
                    })
                }).catch(() => {})
            },
            copySelf1(self) {
                this.currentRow = self;
                this.cloneVisible = true;
            },
            submitClone(){
                if(this.cloneName === ''){
                    this.$notify.error("用例名称不可以为空！");
                    return false;
                }
                let ref = this;
                clonePerfTask({task_id: this.currentRow.id,title: this.cloneName}).then((response)=>{
                    console.log(response.data);
                    if (response.data.code === 0) {
                        ref.$message.success("克隆成功！");
                        ref.cloneVisible = false;
                        ref.cloneName = '';
                        ref.initList();
                    }
                    else {
                        ref.$message.error(response.data.msg);
                    }
                }).catch(function (err) {
                })
            },
            updateSelf1(self) {
                this.$store.dispatch('app/toggleChildNav', '/perf/perfTaskList')
                if(!self.file_path){
                    this.$router.push({
                        path: '/perf/updatePerf',
                        name: 'updatePerf',
                        params: {
                            dataObj: self,
                            filter: this.filter
                        }
                    })
                }
                else{
                    this.$router.push({
                        path: '/perf/createScript',
                        name: 'createScript',
                        params: {
                            dataObj: self,
                            filter: this.filter
                        }
                    })
                }
            },
            addPerf(){
                this.$router.push({
                    path: '/perf/createPerf',
                    name: 'createPerf',
                    params: {
                        filter: this.filter
                    }
                })
                this.$store.dispatch('app/toggleChildNav', '/perf/perfTaskList')
            },
            addPerfScript(){
                this.$router.push({
                    path: '/perf/createScript',
                    name: 'createScript',
                    params: {
                        filter: this.filter
                    }
                })
                this.$store.dispatch('app/toggleChildNav', '/perf/perfTaskList')
            },
            //时间格式化
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            typeFormat(type){
                switch(type){
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
                if (status === undefined || status === null) {
                    return "";
                }
                switch(status){
                    case 0:
                        return "待执行";
                    case 1:
                        return "正在执行";
                    case 2:
                        return "已完成";
                    case 3:
                        return "已停止";
                    case 4:
                        return "执行异常";
                    default:
                        return '';
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
            getIdFromList(list){
                let tmp = [];
                list.forEach(function(item){
                    tmp.push(item.id)
                })
                return tmp;
            },
            //导出xls
            exTask(filename){
                let self = this;
                let ids = this.getIdFromList(this.multipleSelection);
                downloadTask({"ids":ids,"name":filename}).then(function (response) {
                    console.log(response)
                    let code =response.data.code;
                    let url = response.data.result;
                    if(code===0){
                        window.open(url);
                    }else{
                        self.$message({
                            showClose: true,
                            message: url,
                            type: 'error'
                        });
                    }
                }).catch(function (err) {
                    self.$message({
                        showClose: true,
                        message: url,
                        type: 'error'
                    });
                })
            },
            handleSelectionChange(val){
                this.multipleSelection = val;
            },
            //输入文件名
            getFileName(){
                //判断选中行 是否能导出
                let flag = true;
                this.multipleSelection&&this.multipleSelection.length&&this.multipleSelection.map(item=>{
                    if(item.file_path){
                        flag = false;
                        return this.$message.error(`ID：${item.id} 不可以导出`)
                    }
                })

                if(this.multipleSelection.length>0){
                    if(flag){
                        this.$prompt("导出文件名称(可选)",'导出',{
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                        }).then(({value})=>{
                            this.exTask(value==null?"":value);
                        }).catch(()=>{
                        })
                    }
                }else{
                    this.$message({
                        showClose: true,
                        message: '请先勾选要导出的任务！',
                        type: 'fail'
                    });
                }
            },
            //导入性能任务脚本
            PerfTaskUpload(){
                this.$router.push({
                    path: "/perf/PerfTaskUpload",
                    name : "PerfTaskUpload"
                })
                this.$store.dispatch('app/toggleChildNav', '/perf/perfTaskList')
            }
        }
    }
</script>
<style scoped>
    .block {
        float: right;
        margin-top: 15px;
    }
</style>
