<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' @click="addTestLink" icon="el-icon-plus">新 增</el-button>
                <el-button type="info" size='small' @click="uplaodManualCase">导 入</el-button>
                <el-dropdown @command="exportManualCase" style="margin: 0 8px">
                    <el-button type="info" :loading="load" size="small">导 出</el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="selected">选中用例</el-dropdown-item>
                        <el-dropdown-item command="all">所有用例</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
            <advance-filter :formData="filter" :filterArray="filterArray" @search="seachCondition"></advance-filter>
        </el-row>

        <el-row>
            <el-table
                    ref="multipleTable"
                    :data="List.programData"
                    height="680" border class='_table' header-cell-class-name="_table-head"
                    @selection-change="handleSelectionChange">
                <el-table-column type="selection"></el-table-column>
                <!--<el-table-column show-overflow-tooltip prop="id" label="id"></el-table-column>-->
                <el-table-column type="index" label="序号" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="用例名称"></el-table-column>
                <el-table-column show-overflow-tooltip label="项目/版本/模块" width="150">
                    <template slot-scope="scope">
                        <span>{{scope.row.project}} / {{scope.row.version}} / {{scope.row.module}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="priority" label="优先级" :formatter="priorityFormat" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip prop="auto_support" label="自动化" :formatter="autoFormat" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip prop="review_status" label="评审状态" :formatter="reviewFormat" width="90"></el-table-column>
                <el-table-column show-overflow-tooltip prop="status" label="启用状态" :formatter="statusFormat" width="90"></el-table-column>
                <el-table-column show-overflow-tooltip label="操作人" width="120">
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

        <el-dialog :title="editDisable?'编辑用例':'新增用例'" :visible.sync="dialogFormVisible">
            <el-form :model="form" ref="form" :rules="ruleValidate" style="width: 95%">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="名称" :label-width="formLabelWidth" prop="title">
                            <el-input v-model.trim="form.title" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="关联需求" :label-width="formLabelWidth" prop="related_requirement">
                            <el-input v-model="form.related_requirement" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id">
                            <el-select
                                    v-model="form.project_id"
                                    :disabled="editDisable"
                                    @change="form.version_id=[]">
                                <el-option
                                        v-for="(item,index) in projectList"
                                        :label="item.name"
                                        :value="item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="版本" label-width="70px" prop="version_id">
                            <el-select
                                    v-model="form.version_id"
                                    multiple style="width: 100%"
                                    :disabled="editDisable || form.project_id===''"
                                    @visible-change="getVersion"
                                    @change="form.module=''">
                                <el-option
                                        v-for="(item,index) in versionList"
                                        :label="item.version"
                                        :value="''+item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="模块" label-width="70px" prop="module">
                            <el-select
                                    v-model="form.module"
                                    style="width: 100%"
                                    filterable allow-create
                                    :disabled="form.version_id.length===0"
                                    @visible-change="getModule">
                                <el-option
                                        v-for="item in moduleList"
                                        :value="item"
                                        :key="item"
                                        :label="item">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="前置操作" :label-width="formLabelWidth" prop="prepose">
                    <el-input v-model="form.prepose" type="textarea" :autosize="{ minRows: 2, maxRows: 8 }"></el-input>
                </el-form-item>
                <el-form-item label="测试步骤" :label-width="formLabelWidth" prop="steps">
                    <el-input v-model="form.steps" type="textarea" :autosize="{ minRows: 2, maxRows: 8 }"></el-input>
                </el-form-item>
                <el-form-item label="预期结果" :label-width="formLabelWidth" prop="expect">
                    <el-input v-model="form.expect" type="textarea" :autosize="{ minRows: 2, maxRows: 8 }"></el-input>
                </el-form-item>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="优先级" :label-width="formLabelWidth" prop="priority">
                            <el-select v-model="form.priority">
                                <el-option label="高" :value="1"></el-option>
                                <el-option label="中" :value="2"></el-option>
                                <el-option label="低" :value="3"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="评审状态" :label-width="formLabelWidth" prop="review_status">
                            <el-select v-model="form.review_status">
                                <el-option label="待评审" :value="0"></el-option>
                                <el-option label="已评审" :value="1"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="启用状态" :label-width="formLabelWidth" prop="status">
                            <el-select v-model="form.status">
                                <el-option label="禁用" :value="0"></el-option>
                                <el-option label="启用" :value="1"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="是否自动化" :label-width="formLabelWidth" prop="auto_support">
                            <el-switch v-model="form.auto_support" :active-value="1" :inactive-value="0"></el-switch>
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item label="关联脚本用例" :label-width="formLabelWidth" prop="related_case">
                            <el-input v-model="nameStr" auto-complete="off" :disabled="!form.auto_support" @focus="showScriptCase"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="Bug单号" :label-width="formLabelWidth" prop="bug">
                    <el-input v-model="form.bug" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="备注" :label-width="formLabelWidth" prop="remarks">
                    <el-input v-model="form.remarks" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitTestLink('form')">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="用例内容" :visible.sync="viewFormVisible">
            <el-form style="width: 90%">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="名称" :label-width="formLabelWidth">
                            <div class="_view">
                                <span style="padding: 0 15px">{{form.title}}</span>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="关联需求" :label-width="formLabelWidth">
                            <div class="_view">
                                <span style="padding: 0 15px">{{form.related_requirement}}</span>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="项目" :label-width="formLabelWidth">
                            <div class="_view">
                                <span style="padding: 0 15px">{{form.project}}</span>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="版本" :label-width="formLabelWidth">
                            <div class="_view">
                                <span style="padding: 0 15px">{{form.version}}</span>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="模块" :label-width="formLabelWidth">
                            <div class="_view">
                                <span style="padding: 0 15px">{{form.module}}</span>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="前置操作" :label-width="formLabelWidth">
                    <div class="_view">
                        <span style="padding: 0 15px">{{form.prepose}}</span>
                    </div>
                </el-form-item>
                <el-form-item label="测试步骤" :label-width="formLabelWidth">
                    <div class="_view">
                        <span style="padding: 0 15px">{{form.steps}}</span>
                    </div>
                </el-form-item>
                <el-form-item label="预期结果" :label-width="formLabelWidth">
                    <div class="_view">
                        <span style="padding: 0 15px">{{form.expect}}</span>
                    </div>
                </el-form-item>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="优先级" :label-width="formLabelWidth">
                            <div class="_view">
                                <span style="padding: 0 15px">{{priorityFormat(form)}}</span>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="评审状态" :label-width="formLabelWidth">
                            <div class="_view">
                                <span style="padding: 0 15px">{{reviewFormat(form)}}</span>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="启用状态" :label-width="formLabelWidth">
                            <div class="_view">
                                <span style="padding: 0 15px">{{statusFormat(form)}}</span>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="是否自动化" :label-width="formLabelWidth">
                            <div class="_view">
                                <span style="padding: 0 15px">{{autoFormat(form)}}</span>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="16">
                        <el-form-item label="关联脚本用例" :label-width="formLabelWidth">
                            <div class="_view" style="text-overflow:ellipsis; white-space:nowrap; overflow:hidden">
                                <span style="padding: 0 15px" :title="nameStr">{{nameStr}}</span>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="Bug单号" :label-width="formLabelWidth">
                    <div class="_view">
                        <span style="padding: 0 15px">{{form.bug}}</span>
                    </div>
                </el-form-item>
                <el-form-item label="备注" :label-width="formLabelWidth" prop="remarks">
                    <div class="_view">
                        <span style="padding: 0 15px">{{form.remarks}}</span>
                    </div>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="viewFormVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="脚本用例" :visible.sync="scriptVisible" width="55%">
            <el-form :inline="true">
                <el-form-item label="筛选条件">
                    <el-select v-model="scriptModule"
                               size='small'
                               placeholder="模块"
                               @visible-change="getModule"
                               @change="getScriptCase" clearable>
                        <el-option v-for="item in moduleList" :value="item" :key="item" :label="item"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <el-transfer
                    filterable
                    :titles="['待选脚本', '已选脚本']"
                    :render-content="renderFunc"
                    :format="{noChecked: '${total}',hasChecked: '${checked}/${total}'}"
                    v-loading="loading"
                    v-model="selectedScript"
                    :data="scriptList">
            </el-transfer>
            <div slot="footer" class="dialog-footer">
                <el-button @click="scriptVisible = false">取 消</el-button>
                <el-button type="primary" @click="choosedScript">保 存</el-button>
            </div>
        </el-dialog>

    </div>
</template>
<script>
    import AdvanceFilter from "../../components/AdvanceFilter/index";
    import TableOperator from "../../components/TableOperator/index";
    import { FilterProject, FilterVersion, FilterModule } from '@/common/index';
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import { getManualCaseList, addManualCase, updateManualCase, deleteManualCase ,downloadManualCase} from '@/api/manualCase';
    import { getCaseList } from '@/api/case';
    import moment from 'moment';
    const rootPath = process.env.BASE_API;

    export default {
        name: 'testLink',
        components: {AdvanceFilter, TableOperator},
        data() {
            return {
                renderFunc(h, option) {
                    return h('el-tooltip',
                        {props: { 'content': option.label, 'open-delay': 500}},
                        [h('span', option.label)]
                    )
                },
                load:false,
                filter: {
                    title: '',
                    project_id: '',
                    version_id: '',
                    module: '',
                    creator: '',
                    priority: '',
                    review_status: '',
                },
                form: {
                    id: 0,
                    title: '',
                    project_id: '',
                    version_id: [],
                    module: '',
                    priority: 2,
                    review_status: 0,
                    status: 1,
                    prepose: '',
                    related_requirement: '',
                    related_case: '',
                    auto_support: 0,
                    steps: '',
                    expect: '',
                    bug: '',
                    remarks: ''
                },
                multipleSelection: '',
                scriptModule: '',
                projectList: [],
                versionList: [],
                versionList1: [],
                moduleList: [],
                selectedScript: [],
                scriptList: [],
                tmpVersion: [],
                pageNums: 20,//每页几条
                pageNum: 1, //当前是第几页
                formLabelWidth: '100px',
                dialogFormVisible: false,
                viewFormVisible: false,
                scriptVisible: false,
                editDisable: false,
                loading: false,
                List: {
                    page_no: 1,//页面开始页码
                    page_size: 20,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                ruleValidate:{
                    title: [
                        { required: true, message: '用例名称不能为空', trigger: 'blur' }
                    ],
                    project_id: [
                        { required: true, message: '项目不能为空', trigger: 'change' }
                    ],
                    version_id: [
                        { required: true, message: '版本不能为空', trigger: 'change' }
                    ],
                    module: [
                        { required: true, message: '模块不能为空', trigger: 'blur' }
                    ],
                    steps: [
                        { required: true, message: '测试步骤不能为空', trigger: 'blur' }
                    ],
                    expect: [
                        { required: true, message: '预期结果不能为空', trigger: 'blur' }
                    ]
                },
                operateArray: [
                    {label:'查看', click:this.viewDetail},
                    {label:'编辑', type:"primary", click:this.updateSelf1},
                    {label:'删除', type:"danger", click:this.deleteSelf1}
                ],
                filterArray: [
                    {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject,change:()=>{this.filter.version_id='';this.filter.module=''}},
                    {key:'version_id',name:'版本',type:'select',optionList:[],visible: this.getFilterVersion1,disable:()=>{return this.filter.project_id===''},change:()=>{this.filter.module=''}},
                    {key:'module',name:'模块',type:'input'},
                    {key:'title',name:'用例名称',type:'input'},
                    {key:'priority',name:'优先级',type:'select',optionList:[{label:"高",value:"1"},{label:"中",value:"2"},{label:"低",value:"3"}]},
                    {key:'review_status',name:'评审状态',type:'select',optionList:[{label:"待评审",value:"0"},{label:"已评审",value:"1"}]},
                    {key:'creator',name:'创建人',type:'input'},
                    
                ],
                nameStr:""
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
            getFilterVersion1(item){
                FilterVersion(item, this.filter)
            },
            getFilterModule(item){
                FilterModule(item, this.filter)
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
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getFilterVersion(flag){
                let self = this;
                if(flag == true){
                    getVersionList({project_id: this.filter.project_id}).then(function (response) {
                        self.versionList1 = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            getVersion(flag){
                let self = this;
                if(flag == true){
                    getVersionList({project_id: self.form.project_id}).then(function (response) {
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            getModule(flag){
                let self = this;
                if(flag === true) {
                    getModuleList({
                        project_id: self.form.project_id,
                        version_id: (self.form.version_id).join(',')
                    }).then(function (response) {
                        self.moduleList = response.data.module;
                    });
                }
            },
            initList(){
                let self = this;
                getManualCaseList(Object.assign({
                    page_no: self.pageNum,
                    page_size: self.pageNums,
                }, self.filter)).then(function (response) {
                    self.List = {
                        page_no: self.pageNum,
                        page_size: 20 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.case_maintenance
                    }
                }).catch(function (err) {
                });
            },
            seachCondition() {
                this.pageNum = 1;
                this.initList();
            },
            viewDetail(self){
                this.form = self;
                this.getScriptCase();
                this.viewFormVisible = true;
            },
            deleteSelf1(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteManualCase(self.id).then(function (response) {
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
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            exportManualCase(command){
                if (command=='selected'){
                    let self = this;
                    if(this.multipleSelection.length > 0){
                        self.load = true
                        let caseIds = this.getIdFromList(this.multipleSelection);
                        downloadManualCase({
                            case_ids: caseIds
                        }).then(function (response) {
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
                    if (this.filter.project_id == ""){
                        return this.$message.error("请选择项目!")
                    }
                    let self = this;
                    self.load = true
                    downloadManualCase({
                        project_id:self.filter.project_id,
                        version_id:self.filter.version_id,
                        module:self.filter.module,
                        name:self.filter.title
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
            updateSelf1(self) {
                this.resetForm();
                this.form = self;
                this.form.version_id = typeof this.form.version_id==='string'?this.form.version_id.split(','):this.form.version_id;
                this.getScriptCase();
                this.editDisable = true;
                this.getVersion(true);
                this.dialogFormVisible = true;
            },
            addTestLink(){
                this.resetForm();
                this.editDisable = false;
                this.dialogFormVisible = true;
            },
            showScriptCase(){
                if(this.form.project_id === ''){
                    this.$message.error("请选择项目！");
                    return
                }
                if(this.form.version_id.length === 0){
                    this.$message.error("请选择版本！");
                    return
                }
                this.scriptVisible = true;
                this.getScriptCase()
            },
            getScriptCase(){
                this.scriptList = [];
                this.loading = true;
                let self = this;
                getCaseList({
                    id_title: true,
                    version_id:typeof(this.form.version_id) == 'object'? (this.form.version_id).join(','):this.form.version_id,
                    project_id: this.form.project_id,
                    module: this.scriptModule,
                    is_script: 1
                }).then(function (response) {
                    if(response.data.code == 0){
                        if(self.scriptVisible){
                            for(let item of response.data.cases){
                                self.scriptList.push({key: ''+item.id, label: item.title});
                            }
                            self.selectedScript = self.form.related_case.split(',');
                            self.loading = false;
                        }
                        else{
                            let name = [];
                            let arr = self.form.related_case.split(',');
                            arr.map(item=>{
                                response.data.cases&&response.data.cases.length&&(response.data.cases.map(it=>{
                                    if(item == it.id){
                                        name.push(it.title)
                                    }
                                }))
                            })
                            self.nameStr = name.join(',');
                        }
                    }
                })
            },
            choosedScript(){
                if(this.selectedScript[0]===''){
                    this.selectedScript.shift();
                }
                this.form.related_case= this.selectedScript.join(',');
                let nameArr=[]
                this.selectedScript.forEach(item1=>{
                    this.scriptList.forEach(item2=>{
                        if(item2.key===item1){
                           return nameArr.push(item2.label)
                        }
                    })
                })
                this.nameStr=nameArr.join(",")+""
                this.scriptVisible = false;
            },
            submitTestLink(name){
                if (this.validateFormRule(name) ){
                    let ref = this;
                    // id大于0为编辑，小于等于0为新增
                    this.form.version_id = this.form.version_id.join(',');
                    if(ref.form.id > 0){
                        updateManualCase(ref.form.id, ref.form).then(function (response) {
                            if (response.data.code === 0) {
                                ref.$message.success("保存成功！");
                                ref.initList();
                                ref.dialogFormVisible = false;
                            }
                            else {
                                ref.$message.error(response.data.msg);
                                ref.form.version_id = ref.form.version_id.split(',');
                            }
                        })
                    }
                    else {
                        addManualCase(ref.form).then(function (response) {
                            if (response.data.code === 0) {
                                ref.$message.success("保存成功！");
                                ref.initList();
                                ref.dialogFormVisible = false;
                            }
                            else {
                                ref.$message.error(response.data.msg);
                                ref.form.version_id = ref.form.version_id.split(',');
                            }
                        })
                    }
                }else {
                    return false
                }
            },
            reviewFormat(row, column){
                let review = row.review_status;
                if (review === undefined || review === null) {
                    return "";
                }
                switch(review){
                    case 0:
                        return "待评审";
                    case 1:
                        return "已评审";
                    default:
                        return "";
                }
            },
            autoFormat(row, column){
                let auto = row.auto_support;
                if (auto === undefined || auto === null) {
                    return "";
                }
                switch(auto){
                    case 0:
                        return "否";
                    case 1:
                        return "是";
                    default:
                        return "";
                }
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
                        return "禁用";
                    case 1:
                        return "启用";
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
            resetForm(){
                //清空脚本用例
                this.scriptList = [];
                this.selectedScript = [];
                this.scriptModule = '';

                this.form = {
                    id: 0,
                    title: '',
                    project_id: '',
                    version_id: [],
                    module: '',
                    priority: 2,
                    review_status: 0,
                    status: 1,
                    prepose: '',
                    related_requirement: '',
                    related_case: '',
                    auto_support: 0,
                    steps: '',
                    expect: '',
                    bug: '',
                    remarks: ''
                };
                this.nameStr=""
                this.$nextTick(()=>{
                    this.$refs["form"].clearValidate();
                })
            },
            uplaodManualCase(){
                this.$router.push({
                    name: 'manualCaseUpload',
                });
                this.$store.dispatch('app/toggleChildNav', '/autoTest/manualCase/manualCaseList');
            }
        }
    }
</script>
<style scoped>
    .block {
        float: right;
        margin-top: 15px;
    }
    ._view {
        border: 1px solid #dcdfe6;
        overflow: hidden;
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
    .el-input__inner{
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
