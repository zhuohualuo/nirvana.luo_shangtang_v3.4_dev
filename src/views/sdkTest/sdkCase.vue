<template>
    <div id="content">
        <el-row>
            <el-form :inline="true" class="_bottom0 demo-form-inline">
                <el-form-item label="用例标题">
                    <el-input v-model="filter.title" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="Plugin类型">
                    <el-select v-model="filter.type" clearable @visible-change="getSDKType">
                        <el-option v-for="item in sdkTypeList" :value="item.type" :label="item.type" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="seachCondition" icon="el-icon-search"></el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="addSdkCase">新 增</el-button>
                </el-form-item>
            </el-form>
        </el-row>

        <el-row>
            <el-table :data="List.programData" ref="table"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <el-table-column show-overflow-tooltip prop="id" label="ID" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="用例标题"></el-table-column>
                <el-table-column show-overflow-tooltip prop="models" label="模型"></el-table-column>
                <el-table-column show-overflow-tooltip prop="config" label="配置"></el-table-column>
                <el-table-column show-overflow-tooltip prop="type" label="Plugin类型"></el-table-column>
                <el-table-column show-overflow-tooltip prop="status" label="状态" :formatter="statusFormat"></el-table-column>
                <el-table-column show-overflow-tooltip prop="owner" label="执行人" width="120"></el-table-column>
                <el-table-column show-overflow-tooltip prop="exec_time" label="执行时间" :formatter="dateFormat" width="170"></el-table-column>
                <el-table-column prop="operation" label="操作" width="300">
                    <template slot-scope='props'>
                        <el-row>
                            <el-col :span='4'>
                                <el-button size='small' type='primary' plain @click='runCase(props.row)'>执 行</el-button>
                            </el-col>
                            <el-col :span='4' :offset="2">
                                <el-button size='small' type='success' @click='getReport(props.row)'>报 告</el-button>
                            </el-col>
                            <el-col :span='4' :offset="2">
                                <el-button size='small' type='primary' @click='updateSelf1(props.row)'>编 辑</el-button>
                            </el-col>
                            <el-col :span='4' :offset="2">
                                <el-button size='small' type='danger' @click='deleteSelf1(props.row)'>删 除</el-button>
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

        <el-dialog title="用例内容" :visible.sync="detailVisible">
            <span>{{title}}</span>
            <el-input v-model="content" type="textarea" style="overflow: auto;" key="body" :autosize="{ minRows: 4, maxRows: 16 }"></el-input>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="detailVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog :visible.sync="configVisible" width="20%">
            <el-form>
                <el-form-item label="选择配置项" :label-width="formLabelWidth">
                    <el-select v-model="excuteConfig" clearable>
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
                <el-button type="primary" @click="runCase">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="报告列表" :visible.sync="reportVisible" width="35%">
            <el-table :data="reportList.programData"
                      height="490" border class='_table' header-cell-class-name="_table-head">
                <!--<el-table-column prop="id" label="id" width="55"></el-table-column>-->
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <div v-for="(item,index) in props.row.result" :key="index" style="margin-bottom: 2px">
                            <span style="font-weight: bold">{{index+':&nbsp;'}}</span>
                            <span>{{item}}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="title" label="报告名称"></el-table-column>
                <el-table-column prop="log" label="日志" width="70">
                    <template slot-scope='props'>
                        <i class="el-icon-info" style="color: #409EFF;cursor: pointer" @click="getReportPath(props.row)"></i>
                    </template>
                </el-table-column>
                <el-table-column prop="exe_time" label="执行时间" width="170" :formatter="dateFormat"></el-table-column>
            </el-table>
            <div class="block" style="float: left">
                <el-pagination @size-change="handleSizeChange_S" @current-change="handleCurrentChange_S" :current-page="pageNum_S"
                               :page-sizes="[10, 20, 50]"
                               :page-size="pageNums_S" layout="total, sizes, prev, pager, next, jumper"
                               :total="reportList.count">
                </el-pagination>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="reportVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog :title="isEdit?'编辑用例':'新增用例'" :visible.sync="dialogFormVisible" width="35%">
            <el-form :model="form" ref="form" :rules="ruleValidate" style="width: 70%">
                <el-form-item label="用例标题" :label-width="formLabelWidth" prop="title" >
                    <el-input v-model.trim="form.title" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="Plugin类型" :label-width="formLabelWidth" prop="type">
                    <el-select v-model="form.type" clearable @visible-change="getSDKType" style="width: 100%">
                        <el-option v-for="item in sdkTypeList" :value="item.type" :label="item.type" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="模型" :label-width="formLabelWidth" prop="models_id">
                    <el-select v-model="form.models_id" clearable @visible-change="getSDKModel" style="width: 100%">
                        <el-option v-for="item in sdkModelList" :value="item.id" :label="item.title" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="配置" :label-width="formLabelWidth" prop="config_id">
                    <el-select v-model="form.config_id" clearable @visible-change="getSDKConfig" style="width: 100%">
                        <el-option v-for="item in sdkConfigList" :value="item.id" :label="item.title" :key="item.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitSdkCase">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import { getSdkCaseList, createSdkCase, updateSdkCase, deleteSdkCase, runSdkCase, getSdkCaseReportList } from '@/api/sdkTest';
    import { getSdkTypeList, getSdkConfigList, getSdkModelList } from '@/api/sdkTest';
    import { openFile } from '@/api/others';
    import moment from 'moment'; //引入moment格式化时间
    const rootPath = process.env.BASE_API;

    export default {
        name: "sdkCase",
        data() {
            return {
                form: {
                    id: 0,
                    title: '',
                    type: '',
                    config_id: '',
                    models_id: '',
                },
                filter: {
                    id: '',
                    title: '',
                    type: '',
                },
                title: '',
                content: '',
                pageNums: 10,//每页几条
                pageNum: 1, //当前是第几页
                pageNums_S: 10,//每页几条
                pageNum_S: 1, //当前是第几页
                formLabelWidth: '90px',
                dialogFormVisible: false,
                detailVisible: false,
                configVisible: false,
                reportVisible: false,
                List: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                reportList: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [], //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                currentRow: {},
                projectList: [],
                versionList: [],
                moduleList: [],
                sdkTypeList: [],
                sdkConfigList: [],
                sdkModelList: [],
                configList: [],
                excuteConfig: '',
                isEdit: false,
                ruleValidate:{
                    title: [
                        { required: true, message: '用例名称不能为空', trigger: 'blur' }
                    ],
                    type: [
                        { required: true, message: 'Plugin类型不能为空', trigger: 'change' }
                    ]
                }
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
            handleSizeChange_S(val) {
                this.pageNums_S = val;
                this.pageNum_S = 1;
                this.getReportHistory();
            },
            handleCurrentChange_S(val) {//改变页码
                this.pageNum_S = val;
                this.getReportHistory();
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
                    getVersionList({project_id: self.form.project_id}).then(function (response) {
                        console.log(response)
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            getModule(flag){
                if(flag === true) {
                    let self = this;
                    getModuleList({
                        project_id: self.form.project_id,
                        version_id: self.form.version_id
                    }).then(function (response) {
                        console.log(response)
                        self.moduleList = response.data.module;
                    }).catch(function (err) {
                    });
                }
            },
            getSDKType(flag){
                let self = this;
                if(flag === true) {
                    getSdkTypeList().then(function (response) {
                        console.log(response)
                        self.sdkTypeList = response.data.data;
                    }).catch(function (err) {
                    });
                }
            },
            getSDKModel(flag){
                let self = this;
                if(flag === true) {
                    getSdkModelList().then(function (response) {
                        console.log(response)
                        self.sdkModelList = response.data.data;
                    }).catch(function (err) {
                    });
                }
            },
            getSDKConfig(flag){
                let self = this;
                if(flag === true){
                    getSdkConfigList().then(function (response) {
                        console.log(response)
                        self.sdkConfigList = response.data.data;
                    }).catch(function (err) {
                    });
                }
            },
            initList(){
                let self = this;
                getSdkCaseList({
                    page_no: this.pageNum,
                    page_size: this.pageNums,
                    title: this.filter.title,
                    type: this.filter.type
                }).then(function (response) {
                    console.log(response)
                    self.List = {
                        page_no: self.pageNum,
                        page_size: 10 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.cases
                    }
                }).catch(function (err) {
                });
            },
            seachCondition() {
                this.pageNum = 1;
                this.initList();
            },
            handleRun(self){
                this.currentRow = self;
                this.configVisible = true;
            },
            runCase(self){
                let ref = this;
                runSdkCase({id: self.id}).then((response)=>{
                    console.log(response)
                    if(response.data.code === 0){
                        // self.configVisible = false;
                        ref.$message.success("用例正在执行！请稍后查看报告");
                    }
                    else {
                        ref.$message.error(response.data.msg);
                    }
                })
            },
            viewDetail(self){
                this.content = JSON.stringify(self.task, null, 4);
                this.title = self.title;
                this.detailVisible = true;
            },
            getReport(self) {
                this.pageNums_S = 20;
                this.pageNum_S = 1;
                this.currentRow = self;
                this.getReportHistory();
            },
            getReportHistory(){
                let ref = this;
                getSdkCaseReportList(ref.currentRow.id, {
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
            getReportPath(self) {
                let url = rootPath + '/common/report' + self.log;
                window.open(url);
            },
            deleteSelf1(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteSdkCase(self.id).then(function (response) {
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
                this.resetForm();
                this.form = {
                    id: self.id,
                    title: self.title,
                    type: self.type,
                    config_id: self.config_id,
                    models_id: self.models_id,
                }
                this.getSDKConfig(true);
                this.getSDKModel(true);
                this.dialogFormVisible = true;
            },
            addSdkCase(){
                this.resetForm();
                this.dialogFormVisible = true;
            },
            submitSdkCase(){
                let ref = this;
                if (!ref.validateFormRule('form')) {
                    return false;
                }
                if(ref.form.id > 0){
                    updateSdkCase(ref.form.id, ref.form).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.$message.success("保存成功！");
                            ref.dialogFormVisible = false;
                            ref.initList();
                            ref.resetForm();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
                }
                else{
                    createSdkCase(ref.form).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.$message.success("保存成功！");
                            ref.dialogFormVisible = false;
                            ref.initList();
                            ref.resetForm();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
                }
            },
            statusFormat(row, column){
                let type = row[column.property];
                if (type === undefined || type === null) {
                    return "";
                }
                switch(type){
                    case 0:
                        return "待执行";
                    case 1:
                        return "已完成";
                    case 2:
                        return "正在执行";
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
            resetForm(){
                if(this.$refs["form"] != undefined){
                    this.$refs["form"].resetFields();
                    this.form = {
                        id: 0,
                        title: '',
                        type: '',
                        config_id: '',
                        models_id: '',
                    }
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

    .link-in-table{
        color: #0066cc;
        text-decoration: none;
    }

    .link-in-table:hover{
        color: #008489;
        text-decoration: underline;
    }

</style>