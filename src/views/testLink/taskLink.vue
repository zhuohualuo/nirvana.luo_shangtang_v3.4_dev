<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' @click="addLinkTask" icon="el-icon-plus">新 增</el-button>
            </div>
            <advance-filter :formData="filter" :filterArray="filterArray" @search="seachCondition" :showNumber="4"></advance-filter>
        </el-row>

        <el-row>
            <el-table :data="List.programData" ref="table"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <!--<el-table-column show-overflow-tooltip prop="id" label="id"></el-table-column>-->
                <el-table-column type="index" label="序号" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="任务名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="description" label="说明" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip label="项目/版本" width="200">
                    <template slot-scope="scope">
                        <span>{{scope.row.project}} / {{scope.row.version}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="priority" label="优先级" :formatter="priorityFormat" width="90"></el-table-column>
                <el-table-column show-overflow-tooltip prop="status" label="状态" :formatter="statusFormat" width="90"></el-table-column>
                <!--<el-table-column show-overflow-tooltip prop="remarks" label="备注" width="120"></el-table-column>-->
                <el-table-column show-overflow-tooltip label="操作人" width="150">
                    <template slot-scope="scope">
                        <span>{{scope.row.modifier?scope.row.modifier:scope.row.creator}}</span>
                    </template>
                </el-table-column>
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

        <el-dialog title="克隆任务" :visible.sync="cloneVisible" width="40%">
            <el-input v-model.trim="cloneName">
                <span slot="prepend">新测试任务名称</span>
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
    import { FilterProject, FilterVersion, FilterModule } from '@/common/index';
    import { getProjectList, getVersionList } from '@/api/project';
    import { getManualTaskList, cloneManualTask, deleteManualTask } from '@/api/manualCase';
    import { getCaseList } from '@/api/case';
    import moment from 'moment';

    export default {
        name: 'linkTask',
        components: {AdvanceFilter, TableOperator},
        data() {
            return {
                filter: {
                    title: '',
                    project_id: '',
                    version_id: '',
                    creator: '',
                    priority: '',
                    status: '',
                    owner: '',
                },
                projectList: [],
                versionList: [],
                currentRow: {},
                cloneName: '',
                cloneVisible: false,
                pageNums: 20,//每页几条
                pageNum: 1, //当前是第几页
                List: {
                    page_no: 1,//页面开始页码
                    page_size: 20,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                filterArray: [
                    {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject,change:()=>{this.filter.version_id='';}},
                    {key:'version_id',name:'版本',type:'select',optionList:[],visible: this.getFilterVersion,disable:()=>{return this.filter.project_id===''}},
                    {key:'priority',name:'优先级',type:'select',optionList:[{label:"高",value:"1"},{label:"中",value:"2"},{label:"低",value:"3"},]},
                    {key:'status',name:'状态',type:'select',optionList:[{label:"待测试",value:"0"},{label:"测试中",value:"1"},{label:"已完成",value:"2"},]},
                    {key:'title',name:'任务名称',type:'input'},
                    {key:'creator',name:'创建人',type:'input'},
                    {key:'owner',name:'子任务负责人',type:'input'},
                    
                ],
                operateArray: [
                    {label:'编辑', click:this.updateSelf1},
                    {label:'克隆', type:"warning", click:this.cloneSelf1},
                    {label:'子任务', click:this.viewSubTask},
                    {label:'删除', type:"danger", click:this.deleteSelf1}
                ],
            }
        },
        computed: {
        },
        mounted() {
            this.initList();
            this.getProject();
        },
        methods: {
            getFilterProject(item){
                FilterProject(item)
            },
            getFilterVersion(item){
                FilterVersion(item, this.filter)
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
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects
                }).catch(function (err) {
                });
            },
            getVersion(flag){
                let self = this;
                if(flag == true){
                    getVersionList({project_id: self.filter.project_id}).then(function (response) {
                        console.log(response)
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            initList(){
                let self = this;
                getManualTaskList(Object.assign({
                    page_no: self.pageNum,
                    page_size: self.pageNums,
                }, self.filter)).then(function (response) {
                    self.List = {
                        page_no: self.pageNum,
                        page_size: 20 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.plan
                    }
                }).catch(function (err) {
                });
            },
            seachCondition() {
                this.pageNum = 1;
                this.initList();
            },
            viewSubTask(self){
                window.sessionStorage.setItem("childrenSubTaskList",JSON.stringify(self));
                this.$router.push({
                    name: 'subTaskList',
                    params: {
                        dataObj: self,
                        filter: this.filter
                    }
                });
                this.$store.dispatch('app/toggleChildNav', '/autoTest/manualCase/manualTaskList');
            },
            deleteSelf1(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteManualTask(self.id).then(function (response) {
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
            updateSelf1(self) {
                window.sessionStorage.setItem("editSubTaskList",JSON.stringify(self));
                this.$router.push({
                    name: 'updateManualTask',
                    params: {
                        dataObj: self,
                        filter: this.filter
                    }
                });
                this.$store.dispatch('app/toggleChildNav', '/autoTest/manualCase/manualTaskList');
            },
            cloneSelf1(self) {
                this.currentRow = self;
                this.cloneVisible = true;
            },
            submitClone(){
                if(this.cloneName === ''){
                    this.$notify.error("测试任务名称不可以为空！");
                    return false;
                }
                let ref = this;
                cloneManualTask(ref.currentRow.id, {title: ref.cloneName}).then(function (response) {
                    console.log(response)
                    if(response.data.code === 0){
                        ref.$message.success("克隆成功！");
                        ref.cloneVisible = false;
                        ref.cloneName = '';
                        ref.initList();
                    }
                    else{
                        ref.$message.error(response.data.msg);
                    }
                })
            },
            addLinkTask(){
                window.sessionStorage.setItem("editSubTaskList",JSON.stringify({}));
                this.$router.push({
                    name: 'createManualTask',
                    params: {
                        filter: this.filter
                    }
                });
                this.$store.dispatch('app/toggleChildNav', '/autoTest/manualCase/manualTaskList');
            },
            priorityFormat(row, column){
                let priority = row.priority;
                if (priority === undefined || priority === null) {
                    return "";
                }
                switch(priority){
                    case 1:
                        return "高";
                    case 2:
                        return "中";
                    case 3:
                        return "低";
                    default:
                        return "";
                }
            },
            statusFormat(row, column){
                let status = row.status;
                if (status === undefined || status === null) {
                    return "";
                }
                switch(status){
                    case 0:
                        return "待测试";
                    case 1:
                        return "测试中";
                    case 2:
                        return "已完成";
                    default:
                        return "";
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
        }
    }
</script>
<style scoped>
    .block {
        float: right;
        margin-top: 15px;
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
