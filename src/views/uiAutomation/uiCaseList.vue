<template>
    <div id="content">
        <el-row>
            <el-form :inline="true" class="_bottom0 demo-form-inline">
                <el-form-item label="名称">
                    <el-input v-model="filter.title"></el-input>
                </el-form-item>
                <el-form-item label="项目">
                    <el-select v-model="filter.project_id" clearable @change="filter.version_id=''">
                        <el-option v-for="item in projectList" :value="item.id" :key="item.id" :label="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="版本">
                    <el-select v-model="filter.version_id" clearable :disabled="filter.project_id===''" @visible-change="getVersion">
                        <el-option v-for="item in versionList" :value="item.id" :key="item.id" :label="item.version"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="seachCondition" icon="el-icon-search"></el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="addCase">新 增</el-button>
                </el-form-item>
                <!--<el-form-item>-->
                <!--<el-button-group style="margin-bottom: 1px">-->
                <!--<el-button type='primary' size='small' @click='handleRun'>执行</el-button>-->
                <!--</el-button-group>-->
                <!--</el-form-item>-->
            </el-form>
        </el-row>

        <el-row>
            <el-table :data="List.programData" ref="table"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <!--<el-table-column show-overflow-tooltip prop="id" label="id"></el-table-column>-->
                <el-table-column type="index" label="序号" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="project_name" label="项目"></el-table-column>
                <el-table-column show-overflow-tooltip prop="version_name" label="版本"></el-table-column>
                <el-table-column show-overflow-tooltip prop="machine_id" label="目标服务"></el-table-column>
                <el-table-column show-overflow-tooltip prop="status" label="状态" :formatter="typeFormat" width="90"></el-table-column>
                <el-table-column show-overflow-tooltip prop="update_user" label="操作人" width="120"></el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="修改日期" :formatter="dateFormat" width="170"></el-table-column>
                <el-table-column prop="operation" label="操作" width="400">
                    <template slot-scope='props'>
                        <el-row>
                            <el-col :span='4'>
                                <el-tooltip content="查看" placement="top" :open-delay="500">
                                    <el-button size='mini' plain @click='viewDetail(props.row)' icon="el-icon-more"></el-button>
                                </el-tooltip>
                            </el-col>
                            <el-col :span='4'>
                                <el-tooltip content="执行" placement="top" :open-delay="500">
                                    <el-button size='mini' type="primary" plain @click='handleRun(props.row)'>
                                        <svg-icon icon-class="start"></svg-icon>
                                    </el-button>
                                </el-tooltip>
                            </el-col>
                            <el-col :span='4'>
                                <el-tooltip content="报告" placement="top" :open-delay="500">
                                    <el-button size='mini' type='success' @click='getReportPath(props.row)'>
                                        <svg-icon icon-class="form"></svg-icon>
                                    </el-button>
                                </el-tooltip>
                            </el-col>
                            <el-col :span='4'>
                                <el-tooltip content="编辑" placement="top" :open-delay="500">
                                    <el-button size='mini' type='primary' @click='updateSelf1(props.row)'>
                                        <svg-icon icon-class="edit"></svg-icon>
                                    </el-button>
                                </el-tooltip>
                            </el-col>
                            <el-col :span='4'>
                                <el-tooltip content="删除" placement="top" :open-delay="500">
                                    <el-button size='mini' type='danger' @click='deleteSelf1(props.row)'>
                                        <svg-icon icon-class="delete"></svg-icon>
                                    </el-button>
                                </el-tooltip>
                            </el-col>
                            <el-col :span='4'>
                                <el-tooltip content="禁用" placement="top" :open-delay="500" v-if="props.row.status!==0">
                                    <el-button size='mini' type='warning' plain @click='disableSelf(props.row)'>
                                        <svg-icon icon-class="disable"></svg-icon>
                                    </el-button>
                                </el-tooltip>
                                <el-tooltip content="启用" placement="top" :open-delay="500" v-if="props.row.status===0">
                                    <el-button size='mini' type='warning' @click='enableSelf(props.row)'>
                                        <svg-icon icon-class="enable"></svg-icon>
                                    </el-button>
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
                           :total="List.count">
            </el-pagination>
        </div>

        <el-dialog title="用例内容" :visible.sync="dialogFormVisible" width="40%">
            <span>{{title}}</span>
            <el-table :data="content"
                      height="490" border class='_table' header-cell-class-name="_table-head">
                <el-table-column show-overflow-tooltip prop="page" label="封装页面" width="120"></el-table-column>
                <el-table-column show-overflow-tooltip prop="method" label="操作方法" width="120"></el-table-column>
                <el-table-column show-overflow-tooltip prop="content" label="请求参数(多项参数以||划分)"></el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog :visible.sync="configVisible" width="25%">
            <el-form>
                <el-form-item label="运行客户机" :label-width="formLabelWidth">
                    <el-select v-model="client"
                               style="width: 70%"
                               @visible-change="(v)=>{if(v)getFreeMachine()}">
                        <el-option
                                v-for="(item,index) in clientList"
                                :label="item.title"
                                :value="item.id"
                                :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="configVisible = false">取 消</el-button>
                <el-button type="primary" @click="runCase">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import { getUICaseList, updateUICase, deleteUICase, getUICaseById, runUICase, getFreeMachineList, getUICaseReport } from '@/api/webUI';
    import moment from 'moment'; //引入moment格式化时间
    const rootPath = process.env.BASE_API;

    export default {
        name: "uiCaseList",
        data() {
            return {
                filter: {
                    title: '',
                    project_id: '',
                    version_id: '',
                },
                title: '',
                content: '',
                pageNums: 10,//每页几条
                pageNum: 1, //当前是第几页
                formLabelWidth: '120px',
                dialogFormVisible: false,
                configVisible: false,
                List: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                currentRow: {},
                projectList: [],
                versionList: [],
                clientList: [],
                excuteConfig: '',
                email: '',
                cc: '',
                client: ''
            }
        },
        computed: {
        },
        mounted() {
            console.log("$route.filter",this.$route.params.filter)
            if((this.$route.params.filter !== null) && (this.$route.params.filter !== undefined)){
                this.filter = this.$route.params.filter;
            }
            this.initList();
            this.getProject();
        },
        methods: {
            handleSizeChange(val) {
                this.pageNum = 1;
                this.pageNums = val;
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
            getVersion(flag){
                if(flag === true){
                    let self = this;
                    getVersionList({project_id: self.filter.project_id}).then(function (response) {
                        console.log(response)
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            initList(){
                let self = this;
                getUICaseList({
                    page_no: this.pageNum,
                    page_size: this.pageNums,
                    title: this.filter.title,
                    project_id: this.filter.project_id,
                    version_id: this.filter.version_id
                }).then(function (response) {
                    console.log(response)
                    self.List = {
                        page_no: self.pageNum,
                        page_size: 10 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.content
                    }
                }).catch(function (err) {
                });
            },
            seachCondition() {
                this.pageNum = 1;
                this.pageNums = 10;
                this.initList();
            },
            handleRun(self){
                this.currentRow = self;
                this.configVisible = true;
            },
            runCase(){
                let self = this;
                runUICase({
                    id: this.currentRow.id,
                    client_id: this.client
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
                let ref = this;
                this.title = self.title;
                getUICaseById({id: self.id}).then((response)=>{
                    console.log(response)
                    if(response.data.code===0){
                        ref.content = response.data.content.action;
                        ref.dialogFormVisible = true;
                    }
                    else{
                        ref.$message.error(response.data.msg)
                    }
                })
            },
            getReportPath(self) {
                let ref = this;
                getUICaseReport({id:self.id}).then(function (response) {
                    console.log(response)
                    if(response.data.code === 0){
                        // window.location.href = rootPath + '/common/report/' + response.data.report;
                        window.open(rootPath + '/common/report/' + response.data.report);
                    }
                    else {
                        ref.open3(response.data.msg);
                    }
                }).catch(function (err) {
                });
            },
            deleteSelf1(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteUICase({id: self.id}).then(function (response) {
                        console.log(response.data);
                        if (response.data.code === 0) {
                            ref.open2();
                            ref.pageNum = 1;
                            ref.pageNums = 10;
                            ref.initList();
                        }
                        else {
                            ref.open3(response.data.msg);
                        }
                    }).catch(function (err) {
                    })
                }).catch(() => {})
            },
            updateSelf1(self) {
                this.$router.push({
                    path: '/webUI/createUICase',
                    name: 'createUICase',
                    params: {
                        dataObj: self,
                        filter: this.filter
                    }
                })
            },
            addCase(){
                this.$router.push({
                    path: '/webUI/createUICase',
                    name: 'createUICase',
                    params: {
                        filter: this.filter
                    }
                })
            },
            getFreeMachine(){
                let self = this;
                getFreeMachineList().then(function (response) {
                    console.log(response)
                    self.clientList = response.data.content;
                }).catch(function (err) {
                });
            },
            disableSelf(self) {
                let ref = this;
                let tmp = Object.assign({},self);
                tmp.status = 0;
                updateUICase(tmp).then((response)=>{
                    if(response.data.code === 0){
                        self.status = 0;
                    }
                    else{
                        ref.open3(response.data.msg)
                    }
                })
            },
            enableSelf(self) {
                let ref = this;
                let tmp = Object.assign({},self);
                tmp.status = 1;
                updateUICase(tmp).then((response)=>{
                    if(response.data.code === 0){
                        self.status = 1;
                    }
                    else{
                        ref.open3(response.data.msg)
                    }
                })
            },
            typeFormat(row, column){
                let type = row[column.property];
                if (type === undefined || type === null) {
                    return "";
                }
                switch(type){
                    case 0:
                        return "禁用";
                    case 1:
                        return "启用";
                    case 2:
                        return "运行中";
                    default:
                        return '';
                }
            },
            //时间格式化
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
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
            open1() {
                this.$message({
                    showClose: true,
                    message: '克隆成功！',
                    type: 'success'
                });
            },
            open2() {
                this.$message({
                    showClose: true,
                    message: '删除成功！',
                    type: 'success'
                });
            },
            open3(msg) {
                this.$message({
                    showClose: true,
                    message: msg,
                    type: 'fail'
                });
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