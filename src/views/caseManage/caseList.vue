<template>
    <div id="caseList">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' icon="el-icon-plus" @click="gotoAdd">新 增</el-button>
                <el-button type="primary" size='small' @click="dialogVisible = true">执 行</el-button>
                <el-button type="info" size='small' @click="uploadCase">导 入</el-button>
                <el-dropdown @command="exportCase" style="margin: 0 8px">
                    <el-button type="info" size='small' :loading="load">导 出</el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="selected">选中用例</el-dropdown-item>
                        <el-dropdown-item command="all">所有用例</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
                <el-button type="danger" size='small' @click="delCaseBatch">批量删除</el-button>
                <el-button type="warning" size='small' @click="updateBatch">批量编辑</el-button>
            </div>
            <advance-filter :formData="form" :filterArray="filterArray" @search="seachCondition"></advance-filter>
        </el-row>

        <el-row>
            <el-table
                    ref="multipleTable"
                    :data="caseList.programData"
                    tooltip-effect="dark"
                    height="680" border class='_table' header-cell-class-name="_table-head"
                    @selection-change="handleSelectionChange">
                <el-table-column type="selection"></el-table-column>
                <el-table-column type="index" label="序号" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip prop="id" label="ID" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="用例名称"></el-table-column>
                <el-table-column label="项目/版本/模块/接口" width="300">
                    <template slot-scope="scope">
                        <span>{{scope.row.project}} / {{scope.row.version}}{{(scope.row.module?' / '+scope.row.module:'')+(scope.row.record?' / '+scope.row.record:'')}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="type" label="用例类型" width="90"
                                 :formatter="formatterType"></el-table-column>
                <el-table-column show-overflow-tooltip prop="owner" label="操作人" width="150"></el-table-column>
                <el-table-column show-overflow-tooltip prop="created_time" label="创建日期" width="170"
                                 :formatter="dateFormat"></el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="修改日期" width="170"
                                 :formatter="dateFormat"></el-table-column>
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[50, 100, 200, 500, 1000]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="caseList.count">
            </el-pagination>
        </div>

        <el-dialog title="选择配置&执行结果" :visible.sync="dialogVisible">
            <div style="margin: 0 250px">
                <span>配置项&nbsp;</span>
                <el-select v-model="excuteConfig" @visible-change="getConfig" clearable>
                    <el-option
                            v-for="(item,index) in configList"
                            :label="item.cfg_name"
                            :value="item.id"
                            :key="index">
                    </el-option>
                </el-select>
                <el-button type="primary" @click="excuteCase" plain style="margin-left: 20px">执 行</el-button>
            </div>
            <el-tabs type="card">
                <el-tab-pane label="成功用例">
                    <el-table :data="excuteResult.pass"
                              height="490" border class='_table' header-cell-class-name="_table-head" style="margin-top: 0">
                        <el-table-column type="expand">
                            <template slot-scope="props">
                                <div v-if="props.row.steps[0].case">
                                    <div>
                                        <span style="font-weight: bold">用例内容 : </span>
                                        <span class="_caseStep">{{JSON.stringify(props.row.steps[0].case)}}</span>
                                    </div>
                                </div>
                                <div v-else>
                                    <el-collapse accordion>
                                        <el-collapse-item v-for="(item,index) in props.row.steps" :key="index">
                                            <template slot="title">
                                                <span :title="item.title" style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">{{item.title}}</span>
                                            </template>
                                            <div v-if="(item.title)&&(item.title.indexOf('Setup:') != -1)">
                                                <span style="font-weight: bold">Steps : </span>
                                                <span class="_caseStep">{{item.steps}}</span>
                                            </div>
                                            <div v-if="item.url">
                                                <span style="font-weight: bold">URL : </span>
                                                <span class="_caseStep">{{item.url}}</span>
                                            </div>
                                            <div v-if="item.req">
                                                <span style="font-weight: bold">请求参数 : </span>
                                                <span class="_caseStep">{{JSON.stringify(item.req)}}</span>
                                            </div>
                                            <div v-if="item.rsp">
                                                <span style="font-weight: bold">响应结果 : </span>
                                                <span class="_caseStep">{{JSON.stringify(item.rsp)}}</span>
                                            </div>
                                            <div v-if="item.expect">
                                                <span style="font-weight: bold">预期结果 : </span>
                                                <span class="_caseStep">{{JSON.stringify(item.expect)}}</span>
                                            </div>
                                        </el-collapse-item>
                                    </el-collapse>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column show-overflow-tooltip prop="title" label="用例标题"></el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="失败用例">
                    <el-table :data="excuteResult.fail"
                              height="490" border class='_table' header-cell-class-name="_table-head" style="margin-top: 0">
                        <el-table-column type="expand">
                            <template slot-scope="props">
                                <div v-if="props.row.steps[0].case">
                                    <div v-if="props.row.steps[0].result == 'Fail'">
                                        <span style="color: tomato; font-weight: bold">失败原因 : </span>
                                        <span class="_caseStep">{{props.row.steps[0].reason}}</span>
                                    </div>
                                    <div>
                                        <span style="font-weight: bold">用例内容 : </span>
                                        <span class="_caseStep">{{JSON.stringify(props.row.steps[0].case)}}</span>
                                    </div>
                                </div>
                                <div v-else>
                                    <el-collapse accordion>
                                        <el-collapse-item v-for="(item,index) in props.row.steps" :key="index">
                                            <template slot="title">
                                                <span :title="item.title" style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">{{item.title}}</span>
                                            </template>
                                            <div v-if="item.result == 'Fail'">
                                                <span style="color: tomato; font-weight: bold">失败原因 : </span>
                                                <span class="_caseStep">{{item.reason}}</span>
                                            </div>
                                            <div v-if="(item.title)&&(item.title.indexOf('Setup:') != -1)">
                                                <span style="font-weight: bold">Steps : </span>
                                                <span class="_caseStep">{{item.steps}}</span>
                                            </div>
                                            <div v-if="item.url">
                                                <span style="font-weight: bold">URL : </span>
                                                <span class="_caseStep">{{item.url}}</span>
                                            </div>
                                            <div v-if="item.req">
                                                <span style="font-weight: bold">请求参数 : </span>
                                                <span class="_caseStep">{{JSON.stringify(item.req)}}</span>
                                            </div>
                                            <div v-if="item.rsp">
                                                <span style="font-weight: bold">响应结果 : </span>
                                                <span class="_caseStep">{{JSON.stringify(item.rsp)}}</span>
                                            </div>
                                            <div v-if="item.expect">
                                                <span style="font-weight: bold">预期结果 : </span>
                                                <span class="_caseStep">{{JSON.stringify(item.expect)}}</span>
                                            </div>
                                        </el-collapse-item>
                                    </el-collapse>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column show-overflow-tooltip prop="title" label="用例标题"></el-table-column>
                        <el-table-column show-overflow-tooltip prop="reason" label="失败原因"></el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="用例内容" :visible.sync="contentVisible">
            <span>{{currentRow.title}}</span>
            <div style="overflow: auto;max-height: 490px;border: 1px solid #dcdfe6;margin-top: 5px">
                <pre>{{content}}</pre>
            </div>
            <el-button type="text" @click="viewCodeOnline" v-if="currentRow.is_script">点击查看脚本内容</el-button>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="contentVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="批量编辑" :visible.sync="editBatchVisible">
            <el-form :model="editForm" :inline="true" class="_bottom0 demo-form-inline" ref="editForm">
                <el-form-item label="版本" :label-width="formLabelWidth"
                              prop="version_id" :rules="{ required: true, message: '请选择版本', trigger: 'change' }">
                    <el-select v-model="editForm.version_id"
                               clearable multiple
                               @change="()=>{editForm.module='';editForm.record_id = ''}">
                        <el-option v-for="item in versionList" :value="item.id" :key="item.id" :label="item.version"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="模块" :label-width="formLabelWidth">
                    <el-select v-model="editForm.module"
                               clearable
                               :disabled="editForm.version_id.length==0"
                               @visible-change="getModule"
                               @change="()=>{editForm.record_id = ''}">
                        <el-option v-for="item in moduleList" :value="item" :key="item" :label="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="接口" :label-width="formLabelWidth">
                    <el-select v-model="editForm.record_id"
                               clearable
                               :disabled="editForm.module==''"
                               @visible-change="getRecord">
                        <el-option v-for="item in interfaceList" :label="item.name" :key="item.id" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="editBatchVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleEditBatch">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>
<script>
    import AdvanceFilter from "../../components/AdvanceFilter/index";
    import TableOperator from "../../components/TableOperator/index";
    import { FilterProject, FilterVersion, FilterModule, FilterRecord, FilterCaseType } from '@/common/index';
    import { getVersionList, getModuleList } from '@/api/project';
    import { getCaseList, deleteCase, runCase, downloadCase, deleteCaseBatch, updateCaseBatch, getInterfaceList, getCaseTypeList} from '@/api/case';
    import { getConfigList } from '@/api/config';
    import moment from 'moment' //引入moment格式化时间
    const rootPath = process.env.BASE_API;

    export default {
        name: 'caseList',
        components: {AdvanceFilter, TableOperator},
        data() {
            return {
                load:false,
                interfaceList:[],
                projectList: [],
                versionList: [],
                configList: [],
                moduleList: [],
                caseList: {
                    page_no: 1,
                    page_size: 50,
                    count: 0,
                    programData: [],
                },
                form: {
                    type: '',
                    project_id: '',
                    version_id: '',
                    title: '',
                    id: '',
                    owner:'',
                    module: '',
                    record_id:'',
                },
                editForm: {
                    version_id: [],
                    module: '',
                    record_id:'',
                },
                formLabelWidth: '70px',
                List: [],
                pageNums: 50,//每页几条
                pageNum: 1,//当前是第几页,
                multipleSelection: '',
                dialogVisible: false,
                contentVisible: false,
                editBatchVisible: false,
                excuteConfig: '',
                excuteResult: {
                    pass: [],
                    fail: []
                },
                currentRow: {},
                content: '',
                caseTypeList: [],
                filterArray:[
                    {key:'id',name:'ID',type:'input'},
                    {key:'title',name:'用例名称',type:'input'},
                    {key:'type',name:'用例类型',type:'select',optionList:[],visible: this.getFilterCaseType},
                    {key:'version_id',name:'版本',type:'select',optionList:[],visible: this.getFilterVersion,
                        change:()=>{this.form.module='';this.form.record_id=''}},
                    {key:'module',name:'模块',type:'select',optionList:[],visible: this.getFilterModule,
                        change:()=>{this.form.record_id=''},disable:()=>{return this.form.version_id===''}},
                    {key:'record_id',name:'接口',type:'select',optionList:[],visible: this.getFilterRecord,
                        disable:()=>{return this.form.module===''}},
                    {key:'owner',name:'操作人',type:'input'},
                ],
                operateArray: [
                    {label:'查看', click:this.viewCase},
                    {label:'编辑', click:this.gotoEdit},
                    {label:'删除', type:"danger", click:this.deleteSelf1}
                ]
            }
        },
        computed: {},
        mounted() {
            console.log("$route.filter",this.$route.params.filter)
            if((this.$route.params.filter !== null) && (this.$route.params.filter !== undefined)){
                this.form = this.$route.params.filter;
            }
            else{
                this.form.project_id = this.$route.query.project_id;
            }
            this.initList();
            this.getVersion();
            this.getCaseType();
        },
        watch: {
            // 监测路由变化,只要变化了就调用获取路由参数方法将数据存储本组件即可
            '$route': 'refreshRouteParams'
        },
        methods: {
            refreshRouteParams(){
                this.restoreData();
                this.form.project_id = this.$route.query.project_id;
                this.getVersion();
                this.getCaseType();
                this.pageNums = 50;
                this.pageNum = 1;
                this.initList();
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            excuteCase() {
                let self = this;
                if(this.multipleSelection.length > 0){
                    let excuteIdStr = this.getIdFromList(this.multipleSelection);
                    runCase({
                        cases: excuteIdStr,
                        config_id: self.excuteConfig
                    }).then(function (response) {
                        console.log(response)
                        if(response.data.code === 0){
                            self.excuteResult = {
                                pass: response.data.pass_case,
                                fail: response.data.fail_case
                            }
                        }
                    }).catch(function (err) {
                    });

                }else{
                    this.$message({
                        showClose: true,
                        message: '请先勾选要执行的用例！',
                        type: 'fail'
                    });
                }
            },
            uploadCase(){
                this.$router.push({
                    path: 'autoTest/uploadCase',
                    name: 'uploadCase',
                    params:{
                        filter: this.form
                    }
                })
                this.$store.dispatch('app/toggleChildNav', '/autoTest/caseManage/'+this.form.project_id+'?project_id='+this.form.project_id)
            },
            exportCase(command){
                if (command=='selected'){
                    let self = this;
                    if(this.multipleSelection.length > 0){
                        self.load = true
                        let caseIds = this.getIdFromList(this.multipleSelection);
                        downloadCase({
                            case_ids: caseIds
                        }).then(function (response) {
                            console.log(response)
                            self.load = false
                            if(response.data.code === 0){
                                window.open(rootPath + '/common/report/download/' + response.data.path);
                            }
                            else{
                                self.$message.error(response.data.msg)
                            }
                        }).catch(function (err) {
                        });
                    }else{
                        this.$message({
                            showClose: true,
                            message: '请先勾选要导出的用例！',
                            type: 'fail'
                        });
                    }
                }else if (command=='all'){
                    let self = this;
                    self.load = true
                    console.log(self.form)
                    downloadCase({
                        project_id:self.form.project_id,
                        type:self.form.type,
                        version_id:self.form.version_id,
                        module:self.form.module,
                        name:self.form.title
                    }).then(function (response) {
                        self.load = false
                        if(response.data.code === 0){
                            window.open(rootPath + '/common/report/download/' + response.data.path);
                        } else{
                            self.$message.error(response.data.msg)
                        }
                    }).catch(function (err) {
                    });
                }
            },
            delCaseBatch(){
                if(this.multipleSelection.length < 2){
                    this.$message.error("请选择多个测试用例进行批量删除！");
                    return
                }
                let case_ids = this.getIdFromList(this.multipleSelection);
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '批量删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteCaseBatch({case_ids:case_ids}).then(function (response) {
                        console.log(response)
                        ref.$message.info(response.data.msg)
                        ref.pageNum = 1;
                        ref.initList();
                    }).catch(function (err) {
                    });
                }).catch(() => {})
            },
            updateBatch(){
                if(this.multipleSelection.length < 2){
                    this.$message.error("请选择多个测试用例进行批量编辑！");
                    return
                }
                this.editBatchVisible = true;
                this.editForm = {
                    version_id: [],
                    module: '',
                    record_id:'',
                }
                this.$nextTick(()=>{
                    this.$refs['editForm'].clearValidate()
                })
            },
            handleEditBatch(){
                let ref = this;
                if (this.validateFormRule('editForm')) {
                    let case_ids = this.getIdFromList(this.multipleSelection);
                    updateCaseBatch({
                        case: case_ids,
                        version_id: ref.editForm.version_id.join(','),
                        module: ref.editForm.module,
                        record_id: ref.editForm.record_id
                    }).then(function (response) {
                        console.log(response)
                        if(response.data.code === 0){
                            ref.$message.success("批量编辑成功！");
                            ref.editBatchVisible = false;
                            ref.initList();
                        }else{
                            ref.$message.error(response.data.msg)
                        }
                    }).catch(function (err) {
                    });
                }
            },
            gotoAdd() {
                this.$router.push({
                    path: 'autoTest/createCase',
                    name: 'createCase',
                    params: {
                        filter: this.form
                    }
                })
                this.$store.dispatch('app/toggleChildNav', '/autoTest/caseManage/'+this.form.project_id+'?project_id='+this.form.project_id)
            },
            gotoEdit(self) {
                this.$router.push({
                    path: 'caseManage/updateCase',
                    name: 'updateCase',
                    params: {
                        dataObj: self,
                        filter: this.form
                    }
                })
                this.$store.dispatch('app/toggleChildNav', '/autoTest/caseManage/'+this.form.project_id+'?project_id='+this.form.project_id)
            },
            viewCase(self){
                this.currentRow = self;
                try {
                    this.content = JSON.stringify(JSON.parse(this.currentRow.content), null, 4);
                }
                catch (err) {
                    console.log(err)
                    this.content = this.currentRow.content;
                }
                this.contentVisible = true;
            },
            getCaseType(){
                let self = this;
                getCaseTypeList().then(function (response){
                    console.log(response)
                    self.caseTypeList = response.data.types;
                }).catch(function (err) {
                });
            },
            getVersion(){
                let self = this;
                getVersionList({project_id: self.form.project_id}).then(function (response) {
                    self.versionList = response.data.version;
                }).catch(function (err) {
                });
            },
            getModule(flag){
                if(flag === true) {
                    let self = this;
                    getModuleList({
                        project_id: self.editForm.project_id,
                        version_id: self.editForm.version_id.join(',')
                    }).then(function (response) {
                        console.log(response)
                        self.moduleList = response.data.module;
                    }).catch(function (err) {
                    });
                }
            },
            getConfig(flag){
                let self = this;
                if(flag == true){
                    getConfigList({project_id: self.form.project_id}).then(function (response) {
                        console.log(response)
                        self.configList = response.data.keys;
                    }).catch(function (err) {
                    });
                }
            },
            getRecord(){
                let self = this;
                self.interfaceList = [];
                getInterfaceList({
                    project_id: self.editForm.project_id,
                    module: self.editForm.module,
                    version_id:self.editForm.version_id.join(',')
                }).then(function (response) {
                    console.log(response)
                    let api_records = response.data.api_records;
                    api_records.forEach(function(item) {
                        self.interfaceList.push({'name':item['name'],'id':item['id']})
                    });
                }).catch(function (err) {
                });
            },
            getFilterVersion(item){
                FilterVersion(item, this.form)
            },
            getFilterModule(item){
                FilterModule(item, this.form)
            },
            getFilterRecord(item){
                FilterRecord(item, this.form)
            },
            getFilterCaseType(item){
                FilterCaseType(item)
            },
            initList() {
                let self = this;
                getCaseList({
                    page_no: this.pageNum,
                    page_size: this.pageNums,
                    type: this.form.type,
                    project_id: this.form.project_id,
                    version_id: this.form.version_id,
                    name: this.form.title,
                    id: this.form.id,
                    owner: this.form.owner,
                    module: this.form.module,
                    record_id: this.form.record_id
                }).then(function (response) {
                    console.log(response)
                    self.caseList = {
                        page_no: self.pageNum,
                        page_size: 50 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.cases
                    }
                })
            },
            seachCondition() {
                this.pageNums = 50;
                this.pageNum = 1;
                this.initList();
            },
            //时间格式化
            dateFormat(row, column) {
                var date = row[column.property];
                if (date == undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            //用例类型格式化
            formatterType(row, column) {
                let type = row[column.property];
                let tmp = this.caseTypeList.filter((item)=>{
                    return item.id === type;
                })
                if(tmp.length > 0){
                    return tmp[0].type_name;
                }
                else{
                    return "";
                }
            },
            deleteSelf1(self) {
                let ref = this;
                let id = self.id;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteCase(id).then(function (response) {
                        if (response.data.code == 0) {
                            ref.$message.success("删除成功！");
                            ref.initList()
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function (err) {
                    });
                }).catch(() => {})
            },
            handleSizeChange(val) {//改变每页显示数
                this.pageNum = 1;
                this.pageNums = val;
                this.initList();
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.initList();
            },
            restoreData(){
                this.projectList = [];
                this.versionList = [];
                this.configList = [];
                this.excuteConfig = '';
                this.form = {
                    type: '',
                    project_id: '',
                    version_id: '',
                    title: '',
                    id: '',
                    module: '',
                    record_id:'',
                }
            },
            getIdFromList(list){
                let tmp = [];
                list.forEach(function(item){
                    tmp.push(item.id)
                })
                return tmp;
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
            viewCodeOnline(){
                console.log(this.currentRow)
                window.open("/static/codeOnline.html?id="+this.currentRow.id, rootPath)
            }
        }
    }
</script>
<style scoped>
    ._caseStep{
        display:block;
        line-height: 20px;
        word-break: break-all;
        word-wrap: break-word;
        text-indent:4em;
    }

    .block {
        float: right;
        margin-top: 15px;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }


</style>
<style>
#caseList .el-table__body-wrapper{
    overflow-y: auto;
}
</style>
