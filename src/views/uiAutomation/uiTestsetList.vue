<template>
    <div id="content">
        <el-row>
            <el-form :inline="true" class="_bottom0 demo-form-inline">
                <el-form-item label="名称">
                    <el-input v-model="form2.title"></el-input>
                </el-form-item>
                <el-form-item label="项目">
                    <el-select v-model="form2.project_id" clearable>
                        <el-option v-for="item in projectList" :value="item.id" :key="item.id" :label="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="版本">
                    <el-select v-model="form2.version_id" clearable :disabled="form2.project_id===''" @visible-change="(v)=>{if(v)getVersion(form2.project_id)}">
                        <el-option v-for="item in versionList" :value="item.id" :key="item.id" :label="item.version"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="seachCondition" icon="el-icon-search"></el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="addTestSet">新 增</el-button>
                </el-form-item>
            </el-form>
        </el-row>

        <el-row>
            <el-table :data="uiTestSetList.programData" ref="table"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <el-table-column type="index" label="序号" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="测试集名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="description" label="描述"></el-table-column>
                <el-table-column show-overflow-tooltip prop="project" label="项目"></el-table-column>
                <el-table-column show-overflow-tooltip prop="version" label="版本"></el-table-column>
                <el-table-column show-overflow-tooltip prop="status" label="状态" :formatter="statusFormat" width="90"></el-table-column>
                <el-table-column show-overflow-tooltip prop="update_user" label="操作人"></el-table-column>
                <el-table-column show-overflow-tooltip prop="created_time" label="创建日期" :formatter="dateFormat" width="170"></el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="更新时间" :formatter="dateFormat" width="170"></el-table-column>
                <el-table-column prop="operation" label="操作" width="400">
                    <template slot-scope='props'>
                        <el-row>
                            <el-col :span='4'>
                                <el-button size='small' type="primary" plain @click='handleRunSet(props.row)'>执 行</el-button>
                            </el-col>
                            <el-col :span='4' :offset="1">
                                <el-button size='small' type='success' @click='getReportPath(props.row)'>报 告</el-button>
                            </el-col>
                            <el-col :span='4' :offset="1">
                                <el-button size='small' type='primary' @click='updateSelf1(props.row)'>编 辑</el-button>
                            </el-col>
                            <el-col :span='4' :offset="1">
                                <el-button size='small' type='danger' @click='deleteSelf1(props.row)'>删 除</el-button>
                            </el-col>
                            <el-col :span='4' :offset="1">
                                <el-button size='small' type='warning' plain @click='disableSelf(props.row)' v-if="props.row.status!==0">禁 用</el-button>
                                <el-button size='small' type='warning' @click='enableSelf(props.row)' v-if="props.row.status===0">启 用</el-button>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>

        <div class="block" style='float:right'>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[10, 15, 20, 50, 100]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="uiTestSetList.count">
            </el-pagination>
        </div>

        <el-dialog title="编辑测试集" :visible.sync="dialogFormVisible" width="70%">
            <el-form :model="form" :rules="formRule" ref="form" :inline="true" class="demo-form-inline">
                <el-form-item label="测试集名称" :label-width="formLabelWidth" prop="title">
                    <el-input v-model="form.title" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="描述" :label-width="formLabelWidth" prop="description">
                    <el-input v-model="form.description" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id">
                    <el-select v-model="form.project_id" placeholder="请选择" :disabled="editDisable"
                               @change="form.version_id=''">
                        <el-option
                                v-for="(item,index) in projectList"
                                :label="item.name"
                                :value="item.id"
                                :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="版本" :label-width="formLabelWidth" prop="version_id">
                    <el-select v-model="form.version_id" placeholder="请选择"
                               :disabled="form.project_id===''"
                               @visible-change="(v)=>{if(v)getVersion(form.project_id)}"
                               @change="choosedVersion">
                        <el-option
                                v-for="(item,index) in projectList"
                                :label="item.name"
                                :value="item.id"
                                :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <el-transfer
                    filterable
                    filter-placeholder="请输入关键字"
                    :titles="['待选用例', '已选用例']"
                    v-model="tmpCases"
                    :data="caseList">
            </el-transfer>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveUITestSet">保 存</el-button>
            </div>
        </el-dialog>

        <el-dialog title="填写配置" :visible.sync="configVisible" width="40%">
            <el-form>
                <!--<el-form-item label="收件人" :label-width="formLabelWidth">-->
                    <!--<el-input v-model="form3.email" placeholder="请输入收件人邮箱地址" auto-complete="off" style="width: 80%"></el-input>-->
                <!--</el-form-item>-->
                <!--<el-form-item label="抄送" :label-width="formLabelWidth">-->
                    <!--<el-input v-model="form3.cc" placeholder="请输入抄送人邮箱地址" auto-complete="off" style="width: 80%"></el-input>-->
                <!--</el-form-item>-->
                <el-form-item label="运行模式" :label-width="formLabelWidth">
                    <el-select v-model="form3.run_model" style="width: 70%">
                        <el-option label="使用统一配置服务" :value="1"></el-option>
                        <el-option label="使用用例配置服务" :value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="目标服务" :label-width="formLabelWidth" v-if="form3.run_model!==0">
                    <el-select v-model="form3.server_id" style="width: 70%" @visible-change="(v)=>{if(v)getMachine()}">
                        <el-option
                            v-for="(item,index) in serverList"
                            :label="item.title"
                            :value="item.id"
                            :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="运行客户机" :label-width="formLabelWidth">
                    <el-select v-model="form3.client_list"
                               multiple :multiple-limit="3"
                               style="width: 70%"
                               placeholder="请选择客户机，最多选择3台"
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
                <el-button type="primary" @click="handleConfig">确 定</el-button>
            </div>
        </el-dialog>

        <!--<el-dialog title="备注" :visible.sync="remarkVisible" width="30%">-->
        <!--<span>{{caseRemark.title}}</span>-->
        <!--<el-input v-model="caseRemark.remark" type="textarea" style="overflow: auto;" key="remark" :autosize="{ minRows: 2, maxRows: 8 }"></el-input>-->
        <!--<div slot="footer" class="dialog-footer">-->
        <!--<el-button @click="remarkVisible = false">取 消</el-button>-->
        <!--<el-button type="primary" @click="submitRemark">确 定</el-button>-->
        <!--</div>-->
        <!--</el-dialog>-->
    </div>
</template>

<script>
    import { getProjectList, getVersionList } from '@/api/project';
    import { getUITestSetList, addUITestSet, updateUITestSet, deleteUITestSet, runUITestSet } from '@/api/webUI';
    import { getUICaseList, getMachineList, getFreeMachineList, getUITestSetReport } from '@/api/webUI';
    import moment from 'moment'; //引入moment格式化时间

    export default {
        name: "uiTestsetList",
        data() {
            return {
                form: {
                    id: 0,
                    title: '',
                    description: '',
                    project_id: '',
                    version_id: '',
                    cases: '',
                    status: 1,
                },
                form2: {
                    title: '',
                    project_id: '',
                    version_id: '',
                },
                form3: {
                    email: '',
                    cc: '',
                    run_model: 0,
                    server_id: '',
                    client_list: '',
                },
                uiTestSetList: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                taskDetailList: {
                    page_no: 1,  //页面开始页码
                    page_size: 10,  //每页条数
                    count: 0,  //总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                currentRow: {},
                projectList: [],
                versionList: [],
                serverList: [],
                clientList: [],
                caseList: [],
                tmpCases: [],
                formLabelWidth: '100px',
                pageNums: 10,//每页几条
                pageNum: 1, //当前是第几页
                dialogFormVisible: false,
                configVisible: false,
                remarkVisible: false,
                editDisable: false,
                formRule:{
                    title: [
                        { required: true, message: '请填写测试集名称', trigger: 'blur' }
                    ],
                    project_id: [
                        { required: true, message: '请选择项目', trigger: 'change' }
                    ],
                    version_id: [
                        { required: true, message: '请选择版本', trigger: 'change' }
                    ]
                },
                caseRemark: {
                    id: '',
                    title: '',
                    remark: ''
                },
            }
        },

        mounted() {
            this.initList();
            this.getProject();
        },

        methods: {
            initList() {
                let self = this;
                getUITestSetList({
                    page_no: this.pageNum,
                    page_size: this.pageNums,
                    title: this.form2.title,
                    project_id: this.form2.project_id,
                    version_id: this.form2.version_id,
                }).then(function(response){
                    console.log(response)
                    self.uiTestSetList = {
                        page_no: self.pageNum,
                        page_size: 10 || self.pageNum,
                        count: response.data.total,
                        programData: response.data.content
                    }
                })
            },
            addTestSet(){
                this.resetForm();
                this.dialogFormVisible = true;
                this.editDisable = false;
            },
            updateSelf1(self){
                this.resetForm();
                this.form = self;
                this.getVersion(this.form.project_id);
                this.getUICase();
                if(this.form.cases){
                    this.tmpCases = this.form.cases.split(',').map(Number)
                }
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
                    deleteUITestSet({id: self.id}).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.open1();
                            ref.pageNum = 1;
                            ref.pageNums = 10;
                            ref.initList();
                        }
                        else {
                            ref.$message.error(response.data.msg)
                        }
                    }).catch(function (err) {
                    });
                }).catch(() => {})
            },
            getReportPath(self) {
                let ref = this;
                getUITestSetReport({id:self.id}).then(function (response) {
                    console.log(response)
                    if(response.data.code === 0){
                        // window.location.href = rootPath + '/common/report/' + response.data.report;
                        window.open(rootPath + '/common/report/' + response.data.report);
                    }
                    else {
                        ref.open3(response.data.msg);
                    }
                })
                    .catch(function (err) {
                    });
            },
            handleRunSet(self){
                this.currentRow = self;
                this.configVisible = true;
            },
            handleConfig(){
                this.runTaskSet();
                this.configVisible = false;
            },
            runTaskSet() {
                let ref = this;
                let client = ref.form3.client_list.join(",");
                runUITestSet({
                    id: ref.currentRow.id,
                    run_model: ref.form3.run_model,
                    server_id: ref.form3.server_id,
                    client_list: client,
                }).then(function (response) {
                    console.log(response.data)
                    if(response.data.code === 0){
                        ref.open4(response.data.msg);
                        ref.initList()
                    }
                    else {
                        ref.open3(response.data.msg);
                    }
                }).catch(function (err) {
                });
            },
            // stopTaskSet(self){
            //     let ref = this;
            //     this.$confirm('此操作将无法撤销, 是否继续?', '停止执行', {
            //         confirmButtonText: '确定',
            //         cancelButtonText: '取消',
            //         type: 'warning'
            //     }).then(()=> {
            //         stopPerfTaskSet({
            //             set_id: self.id
            //         }).then(function (response) {
            //             console.log(response.data)
            //             if(response.data.code === 0){
            //                 ref.$message.success(response.data.msg);
            //             }
            //             else {
            //                 ref.open3(response.data.msg);
            //             }
            //         })
            //             .catch(function (err) {
            //             });
            //     }).catch(() => {})
            // },
            saveUITestSet() {
                let ref = this;
                this.form.cases = this.tmpCases.join(',');
                if (ref.validateFormRule('form')) {
                    // id大于0为编辑，小于等于0为新增
                    if(ref.form.id > 0){
                        updateUITestSet(ref.form).then(function (response) {
                            console.log(response)
                            if (response.data.code === 0) {
                                ref.open2();
                                ref.initList();
                                ref.dialogFormVisible = false;
                            }
                            else {
                                ref.open3(response.data.msg);
                            }
                        })
                    }
                    else {
                        addUITestSet(ref.form).then(function (response) {
                            console.log(response)
                            if (response.data.code === 0) {
                                ref.open2();
                                ref.pageNum = 1;
                                ref.pageNums = 10;
                                ref.initList();
                                ref.dialogFormVisible = false;
                            }
                            else {
                                ref.open3(response.data.msg);
                            }
                        })
                    }
                }
                else{
                    return false;
                }
            },
            disableSelf(self) {
                let ref = this;
                let tmp = Object.assign({},self);
                tmp.status = 0;
                updateUITestSet(tmp).then((response)=>{
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
                updateUITestSet(tmp).then((response)=>{
                    if(response.data.code === 0){
                        self.status = 1;
                    }
                    else{
                        ref.open3(response.data.msg)
                    }
                })
            },
            seachCondition() {
                this.pageNum = 1;
                this.pageNums = 10;
                this.initList()
            },
            resetForm(){
                if(this.$refs["form"] != undefined) {
                    this.$refs["form"].resetFields();
                    this.form = {
                        id: 0,
                        title: '',
                        project_id: '',
                        version_id: '',
                        cases: [],
                        status: 1,
                    };
                    this.form2 = {
                        title: '',
                        project_id: '',
                        version_id: '',
                    };
                    this.form3 = {
                        email: '',
                        cc: '',
                        run_model: 0,
                        server_id: '',
                        client_list: '',
                    };
                    this.tmpCases = [];
                    this.currentRow = {};
                }
            },
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined || date === null) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            statusFormat(row, column){
                let status = row[column.property];
                switch(status){
                    case 0:
                        return "禁用";
                    case 1:
                        return "启用";
                    case 2:
                        return "运行中";
                    default:
                        return "";
                }
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getVersion(project_id){
                let self = this;
                getVersionList({project_id: project_id}).then(function (response) {
                    console.log(response)
                    self.versionList = response.data.version;
                }).catch(function (err) {
                });
            },
            getMachine(){
                let self = this;
                getMachineList({m_type:1}).then(function (response) {
                    console.log(response)
                    self.serverList = response.data.content;
                }).catch(function (err) {
                });
            },
            getFreeMachine(){
                let self = this;
                getFreeMachineList().then(function (response) {
                    console.log(response)
                    self.clientList = response.data.content;
                }).catch(function (err) {
                });
            },
            choosedVersion(){
                this.tmpCases=[];
                this.getUICase();
            },
            getUICase(){
                let self = this;
                this.caseList = [];
                getUICaseList({
                    project_id: this.form.project_id,
                    version_id: this.form.version_id,
                }).then(function (response) {
                    console.log(response)
                    for(let item of response.data.content){
                        self.caseList.push({key: item.id, label: item.title})
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
            open1() {
                this.$message({
                    showClose: true,
                    message: '删除成功！',
                    type: 'success'
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
            open4(msg) {
                this.$message({
                    showClose: true,
                    message: msg,
                    type: 'success'
                });
            }
        }

    }
</script>

<style scoped>
    .block {
        float: left;
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