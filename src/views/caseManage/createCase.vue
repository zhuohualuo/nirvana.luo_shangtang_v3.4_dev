<template>
    <div id="content">
        <el-card style="margin-left: 5%;width: 90%;height: 730px">
            <el-row>
                <el-form :model="formValidate" :rules="ruleValidate" ref="formValidate">
                    <el-col :span="6">
                        <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id">
                            <el-select v-model="formValidate.project_id"
                                       style="width: 100%;" :disabled="isEdit"
                                       @change="()=>{tmpVersion=[];formValidate.module='';formValidate.record_id=''}">
                                <el-option
                                        v-for="(item,index) in projectList"
                                        :label="item.name"
                                        :value="item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="版本" :label-width="formLabelWidth" prop="version_id">
                            <el-select v-model="tmpVersion"
                                       :disabled="formValidate.project_id===''"
                                       style="width: 100%;" multiple
                                       @change="()=>{formValidate.module='';formValidate.record_id = ''}"
                                       @visible-change="getVersion">
                                <el-option
                                        v-for="(item,index) in versionList"
                                        :label="item.version"
                                        :value="''+item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item label="模块" :label-width="formLabelWidth" prop="module">
                            <el-select v-model="formValidate.module" clearable
                                       style="width: 100%;" :disabled="tmpVersion.length===0"
                                       @change="()=>{formValidate.record_id=''}"
                                       @visible-change="getModule">
                                <el-option
                                        v-for="(item,index) in moduleList"
                                        :label="item"
                                        :value="item"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item label="接口" :label-width="formLabelWidth" prop="record_id">
                            <el-select v-model="formValidate.record_id"
                                       filterable clearable style="width: 100%;"
                                       :disabled="formValidate.module===''"
                                       @visible-change="getBindInterface">
                                <el-option v-for="item in recordList" :value="item.id" :key="item.id" :label="item.name"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="14">
                        <el-form-item label="用例名称" :label-width="formLabelWidth" prop="title">
                            <el-input v-model.trim="formValidate.title" placeholder="请输入用例名称" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item label="用例类型" :label-width="formLabelWidth" prop="type">
                            <el-select v-model="formValidate.type" style="width: 100%;" :disabled="isEdit">
                                <el-option v-for="item in caseTypeList" :value="item.id" :key="item.id" :label="item.type_name"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-form>
            </el-row>

            <div v-if="formValidate.type==4">
                <el-row>
                    <el-form class="_bottom0 demo-form-inline">
                        <el-form-item label="格式" :label-width="formLabelWidth">
                            <el-radio-group v-model="isScript" :disabled="isEdit" style="margin-left: 15px">
                                <el-radio :label="false">按Case步骤执行</el-radio>
                                <el-radio :label="true">按Script执行</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-form>
                </el-row>
                <el-row>
                    <div v-if="isScript" style="margin-top: 15px">
                        <el-form class="_bottom0 demo-form-inline" size="mini" key="flow-form">
                            <el-form-item label="脚本内容" prop="json" :label-width="formLabelWidth" :rules="{ required: true, message: '用例内容不能为空', trigger: 'change' }">
                                <div class="_caseJson">
                                    <json-editor v-model="formValidate.content" key="caseJson"></json-editor>
                                </div>
                            </el-form-item>
                        </el-form>
                    </div>
                    <div v-else>
                        <el-table :data="contentList"
                                  height="520" border class='_table' header-cell-class-name="_table-head" key="flow-table">
                            <el-table-column type="index" label="步骤" width="55"></el-table-column>
                            <el-table-column label="筛选条件" v-if="!isEdit">
                                <template slot-scope="scope">
                                    <el-select v-model="scope.row.module"
                                               style="width: 45%" placeholder="模块"
                                               :disabled="tmpVersion.length===0"
                                               @visible-change="getModule">
                                        <el-option
                                                v-for="(item,index) in moduleList"
                                                :label="item"
                                                :value="item"
                                                :key="index">
                                        </el-option>
                                    </el-select>
                                    <el-input v-model="scope.row.prefix" style="width: 50%" placeholder="名称"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column label="测试用例" v-if="!isEdit">
                                <template slot-scope="scope">
                                    <el-select v-model="scope.row.title"
                                               style="width: 100%"
                                               filterable
                                               :loading="loading"
                                               @visible-change="(v)=>{if(v)getCase(scope.row)}"
                                               @change="(val)=>{choosedCase(val,scope.$index)}">
                                        <el-option v-for="(item,index) in caseList"
                                                   :value="item.title"
                                                   :label="item.title"
                                                   :key="index">
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column label="内容" width="250" v-if="!isEdit">
                                <template slot-scope="scope">
                                    <el-button @click='clickFlowContent(scope.row)' type="text" style="text-decoration: underline">编 辑</el-button>
                                </template>
                            </el-table-column>
                            <el-table-column label="内容" v-if="isEdit">
                                <template slot-scope="scope">
                                    <div style="max-height: 250px; overflow: auto">
                                        <el-input v-model="scope.row.content" type="textarea" :autosize="{minRows: 1,maxRows: 8}"></el-input>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column width="120" align="center">
                                <template slot="header" slot-scope="props">
                                    <el-button type="primary" size='small' @click="addFlowStep" icon="el-icon-plus">新 增</el-button>
                                </template>
                                <template slot-scope='props'>
                                    <el-button @click='removeStep(props.$index)' type="text" style="color: #F56C6C;text-decoration: underline">删 除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-row>
            </div>

            <div v-else>
                <el-row>
                    <el-form class="_bottom0 demo-form-inline">
                        <el-form-item label="格式" :label-width="formLabelWidth">
                            <el-radio-group v-model="isJson" :disabled="isEdit" style="margin-left: 15px">
                                <el-radio :label="false">接口格式</el-radio>
                                <el-radio :label="true">JSON格式</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-form>
                </el-row>
                <el-row>
                    <div v-if="isJson" style="margin-top: 15px">
                        <el-form class="_bottom0 demo-form-inline" size="mini" key="case-form">
                            <el-form-item label="用例内容" prop="json" :label-width="formLabelWidth" :rules="{ required: true, message: '用例内容不能为空', trigger: 'change' }">
                                <div class="_caseJson">
                                    <json-editor v-model="formValidate.content" key="caseJson"></json-editor>
                                </div>
                            </el-form-item>
                        </el-form>
                    </div>
                    <div v-else>
                        <el-table :data="contentList"
                                  height="520" border class='_table' header-cell-class-name="_table-head" key="case-table">
                            <el-table-column label="步骤" width="180">
                                <template slot-scope="scope">
                                    <el-select v-model="scope.row.key" @change="()=>{scope.row.invoke='';scope.row.content=''}">
                                        <el-option value="Setup" label="Setup"></el-option>
                                        <el-option value="CaseStep" label="CaseStep"></el-option>
                                        <el-option value="TearDown" label="TearDown"></el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column label="描述">
                                <template slot-scope="scope">
                                    <span v-if="scope.row.key!=='CaseStep'">{{scope.row.key}}</span>
                                    <el-input v-else v-model="scope.row.title"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column label="调用方法">
                                <template slot-scope="scope">
                                    <el-select v-if="scope.row.key==='Setup'"
                                               v-model="scope.row.invoke"
                                               filterable style="width: 100%"
                                               :loading="loading"
                                               @visible-change="(v)=>{if(v)getInvoke(scope.row)}"
                                               @change="(val)=>{choosedInvoke(val,scope.$index,scope.row.key)}">
                                        <el-option v-for="invoke in SetupList" :value="invoke.name" :label="invoke.name" :key="invoke.name"></el-option>
                                    </el-select>
                                    <el-select v-else-if="scope.row.key==='TearDown'"
                                               v-model="scope.row.invoke"
                                               filterable style="width: 100%"
                                               :loading="loading"
                                               @visible-change="(v)=>{if(v)getInvoke(scope.row)}"
                                               @change="(val)=>{choosedInvoke(val,scope.$index,scope.row.key)}">
                                        <el-option v-for="invoke in TearDownList" :value="invoke.name" :label="invoke.name" :key="invoke.name"></el-option>
                                    </el-select>
                                    <el-select v-else
                                               v-model="scope.row.invoke"
                                               filterable style="width: 100%"
                                               :loading="loading"
                                               @visible-change="(v)=>{if(v)getInterface(scope.row)}"
                                               @change="(val)=>{choosedInterface(val,scope.$index)}">
                                        <el-option v-for="item in interfaceList" :value="item.id" :label="item.name" :key="item.id"></el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column label="参数">
                                <template slot-scope="scope">
                                    <el-button @click='clickCaseContent(scope.row)' type="text" style="text-decoration: underline">编 辑</el-button>
                                    <!--<div style="max-height: 250px; overflow: auto">-->
                                    <!--<pre title="双击进入编辑">{{contentFormat(scope.row)}}</pre>-->
                                    <!--</div>-->
                                </template>
                            </el-table-column>
                            <el-table-column width="120" align="center">
                                <template slot="header" slot-scope="props">
                                    <el-button type="primary" size='small' @click="addCaseStep" icon="el-icon-plus">新 增</el-button>
                                </template>
                                <template slot-scope='props'>
                                    <el-button @click='removeStep(props.$index)' type="text" style="color: #F56C6C;text-decoration: underline">删 除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-row>
            </div>
        </el-card>

        <div class="page-footer-right">
            <el-button type="ghost" @click="handleReset()" :disabled="isEdit">重置</el-button>
            <el-button type="primary" @click="handleSubmit('formValidate')" style="margin-left: 8px">提交</el-button>
        </div>

        <el-dialog title="编辑参数" :visible.sync="dialogVisible">
            <el-form style="max-height: 550px; overflow: auto">
                <el-form-item v-for="(item,index) in paramsForm" :label="index" :label-width="formLabelWidth" :key="index">
                    <el-input type="textarea" v-model="paramsForm[index]" :autosize="{minRows: 1,maxRows: 8}" style="width: 90%"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="编辑内容" :visible.sync="dialogVisibleFlow">
            <json-editor v-model="tmpContent" key="caseJson"></json-editor>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisibleFlow = false">取 消</el-button>
                <el-button type="primary" @click="editContent">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import { createNewCase, updateCase } from '@/api/case';
    import { getCaseList, getInvokeList, getInterfaceList, getCaseTypeList } from '@/api/case';
    import JsonEditor from '@/components/JsonEditor';

    export default {
        name:'createCase',
        components: { JsonEditor },
        data () {
            return {
                projectList: [],
                versionList: [],
                moduleList: [],
                recordList: [],
                interfaceList: [],
                SetupList: [],
                TearDownList: [],
                caseTypeList: [],
                caseList: [],
                filter: {
                    type: '',
                    project_id: '',
                    version_id: '',
                    title: '',
                    id: '',
                    owner:'',
                    module: '',
                    record_id:'',
                },
                formValidate: {
                    id: 0,
                    project_id: '',
                    version_id: '',
                    module: '',
                    record_id: '',
                    title: '',
                    type: '',
                    content: '',
                },
                tmpVersion: [],
                tmpContent: '',
                contentList: [],
                paramsForm: {},
                currentRow: {},
                formLabelWidth: '80px',
                ruleValidate: {
                    title: [
                        { required: true, message: '用例名称不能为空', trigger: 'blur' }
                    ],
                    project_id: [
                        { required: true, message: '项目不能为空', trigger: 'change' }
                    ],
                    version_id: [
                        { required: true, message: '版本不能为空', trigger: 'none' }
                    ],
                    type: [
                        { required: true, message: '用例类型不能为空', trigger: 'change' }
                    ]
                },
                dialogVisible:false,
                dialogVisibleFlow:false,
                loading:false,
                isScript:false,
                isEdit:false,
                isJson:false
            }
        },//data
        computed: {
        },//computed
        mounted() {
            this.getParams()
        },
        methods: {
            //公共
            getParams () {
                // 取到路由带过来的参数
                console.log("$route.params.dataObj",this.$route.params.dataObj)
                console.log("$route.params.filter",this.$route.params.filter)
                this.getProject();
                this.getCaseType();
                this.addCaseStep();
                if(this.$route.params.dataObj){
                    this.formValidate = this.$route.params.dataObj;
                    this.tmpVersion = this.formValidate.version_id.split(',');
                    if(this.formValidate.type === 4){
                        this.convertFlowContent();
                    }
                    else{
                        this.isJson = true;
                    }
                    this.isEdit = true;
                    this.getVersion(true);
                    this.getModule(true);
                    this.getBindInterface(true);
                }
                if(this.$route.params.filter){
                    this.filter = this.$route.params.filter;
                }
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getCaseType(){
                let self = this;
                getCaseTypeList().then(function (response){
                    console.log(response)
                    self.caseTypeList = response.data.types;
                }).catch(function (err) {
                });
            },
            getVersion(flag){
                if(flag === true) {
                    let self = this;
                    getVersionList({project_id: self.formValidate.project_id}).then(function (response) {
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
                        project_id: self.formValidate.project_id,
                        version_id: self.tmpVersion.join(',')
                    }).then(function (response) {
                        console.log(response)
                        self.moduleList = response.data.module;
                    }).catch(function (err) {
                    });
                }
            },
            getBindInterface(flag){
                if(flag === true){
                    let self = this;
                    getInterfaceList({
                        project_id: self.formValidate.project_id,
                        version_id: self.tmpVersion.join(','),
                        module: self.formValidate.module
                    }).then(function (response) {
                        console.log(response)
                        self.recordList = response.data.api_records;
                    }).catch(function (err) {
                    });
                }
            },
            handleReset () {
                this.$refs["formValidate"].resetFields();
                this.formValidate = {
                    id: 0,
                    project_id: '',
                    version_id: '',
                    module: '',
                    record_id: '',
                    title: '',
                    type: '',
                    content: '',
                }
                this.contentList = [];
                this.paramsForm = {};
                this.currentRow = {};
                this.tmpVersion = [];
                this.tmpContent = '';
            },
            handleSubmit(name) {
                this.formValidate.version_id = this.tmpVersion.join(',');
                if(this.validateFormRule(name)){
                    this.formValidate.type == 4 ? this.submitFlow() : this.submitCase();
                }
            },
            gotoCaseList() {
                this.$router.push({
                    path: '/autoTest/caseManage/' + this.filter.project_id,
                    query:{
                        project_id: this.filter.project_id
                    },
                    params:{
                        filter: this.filter
                    }
                })
            },
            addCaseStep(){
                this.contentList.push({key: "", title: "", invoke: "", content: ""});
            },
            addFlowStep(){
                this.contentList.push({module: "", prefix: "", title: "", content: ""});
            },
            removeStep(index){
                this.contentList.splice(index,1)
            },
            contentFormat(row){
                let result = "";
                if(row.content){
                    result = JSON.stringify(row.content,null,4);
                }
                return result;
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
            JSONformat(){
                if(this.formValidate.content !== "")
                {
                    var obj;
                    try {
                        //data有可能不是合法的JSON字符串，便会产生异常
                        obj = JSON.parse(this.formValidate.content);
                        this.formValidate.content = JSON.stringify(obj, null, 8);
                    } catch (e) {
                        this.$message.error('不合法的JSON格式!');
                    }
                }
            },

            //case
            clickCaseContent(row){
                this.currentRow = row;
                if(!row.invoke){
                    this.$message.error('请先选择调用方法！');
                    return
                }
                if(row.content){
                    let data = row.content;
                    this.paramsForm = {};
                    this.dialogVisible = true;
                    if(row.key === "CaseStep"){
                        for(let key in data){
                            if(typeof data[key] === "object"){
                                this.$set(this.paramsForm, key, JSON.stringify(data[key],null,8))
                            }
                            else{
                                this.$set(this.paramsForm, key, data[key])
                            }
                        }
                    }
                    else{
                        let invoke = this[row.key+'List'].filter((item)=>{
                            return item.name === row.invoke;
                        })
                        switch(invoke[0].type) {
                            case 1:
                                this.paramsForm = data;
                                break;
                            case 2:
                                let tmp = data.substring(data.indexOf('(')+1, data.indexOf(')'));
                                for(let index in invoke[0].args){
                                    let item = invoke[0].args[index];
                                    for(let key in item){
                                        if(tmp === ''){
                                            this.paramsForm[key] = '';
                                        }
                                        else{
                                            let list = tmp.split(',');
                                            this.paramsForm[key] = list[index].substring(1,tmp[index].length-1);
                                        }
                                    }
                                }
                                break;
                            default:
                                this.paramsForm['args'] = '';
                        }
                    }
                }
            },
            checkCaseContent(){
                if(this.isJson && this.formValidate.content == ''){
                    this.$message.error("用例内容不能为空！");
                    return false
                }
                if(!this.isJson && !this.combineCaseContent()){
                    return false
                }
                return true
            },
            combineCaseContent(){
                let tmp = this.contentList.filter((item)=>{
                    return item.key === 'CaseStep';
                })
                if(tmp.length === 0){
                    this.$message.error("请至少选择一个CaseStep!");
                    return false;
                }
                else{
                    let i = 1;
                    let obj = {setup: [],teardown: []};
                    let that = this;
                    let isTure = true;// 是否调用方法
                    this.contentList.forEach(function(item,index){
                        switch(item.key){
                            case 'Setup':
                                obj.setup.push(item.content);
                                i--;
                                break;
                            case 'CaseStep':
                                if(item.content == ''){
                                    that.$message.error('请选择调用方法!')
                                    isTure = false;
                                    return
                                } 
                                item.content["title"] = item.title;
                                if(tmp.length === 1){
                                    Object.assign(obj,item.content)
                                }
                                else{
                                    obj[index + i] = item.content;
                                }
                                break;
                            case 'TearDown':
                                obj.teardown.push(item.content);
                                i--;
                                break;
                            default:
                                break;
                        }
                    })
                    this.formValidate.content = JSON.stringify(obj);
                    if(!isTure) return false;
                    return true;
                }
            },
            submitCase(){
                if (this.checkCaseContent()) {
                    // console.log(this.formValidate)
                    //有id表示是做修改，没有表示是新增
                    let ref = this;
                    if (ref.formValidate.id > 0 ){
                        updateCase(ref.formValidate.id, ref.formValidate).then(function (response) {
                            if(response.data.code === 0){
                                ref.$message.success('提交成功!');
                                ref.gotoCaseList();
                                ref.handleReset();
                            }else{
                                ref.$message.error(response.data.msg);
                            }
                        }).catch(function (error) {
                            console.log(error);
                        });
                    }
                    else{
                        createNewCase(ref.formValidate).then(function (response) {
                            if(response.data.code === 0){
                                ref.$message.success('提交成功！请在用例列表中查看');
                                ref.handleReset();
                            }else{
                                ref.$message.error(response.data.msg);
                            }
                        }).catch(function (error) {
                            console.log(error);
                        });
                    }
                }
                else{
                    return false;
                }
            },
            getInvoke(row){
                if((this.formValidate.project_id === '')||(row.key === '')){
                    return
                }
                this.loading = true;
                let invoke = row.key.toLowerCase();
                let self = this;
                getInvokeList({
                    type: invoke,
                    project_id: self.formValidate.project_id
                }).then(function (response) {
                    console.log(response)
                    self[row.key+'List'] = response.data.assist;
                    self[row.key+'List'].push({name: '自定义', type: 3, args: {}})
                    self.loading = false;
                }).catch(function (err) {
                });
            },
            choosedInvoke(val,index,key){
                let invoke = this[key+'List'].filter((item)=>{
                    return item.name === val;
                })
                let tmp;
                switch(invoke[0].type){
                    case 1:
                        tmp = invoke[0].args;
                        break;
                    case 2:
                        tmp = "{{" + invoke[0].name + "()}}";
                        break;
                    default:
                        tmp = {}
                }
                this.contentList[index].content = tmp;
            },
            getInterface(row){
                if((this.formValidate.project_id === '')||(row.key === '')){
                    return
                }
                this.loading = true;
                this.interfaceList = [];
                let self = this;
                getInterfaceList({
                    project_id: self.formValidate.project_id,
                    module: self.formValidate.module
                }).then(function (response) {
                    console.log(response)
                    self.interfaceList = response.data.api_records;
                    self.loading = false;
                }).catch(function (err) {
                });
            },
            choosedInterface(val,index){
                let inter = this.interfaceList.filter((item)=>{
                    return item.id === val;
                })
                this.contentList[index].content = {
                    url: inter[0].url,
                    method: inter[0].method,
                    body: inter[0].body,
                    response: inter[0].validator,
                    headers: inter[0].headers,
                    key: inter[0].key
                }
            },
            editParams(){
                if(this.paramsForm.method == '') return this.$message.error('method 不能为空！')
                if(this.paramsForm.url == '') return this.$message.error('url 不能为空！')
                let tmp;
                if(this.currentRow.key === 'CaseStep'){
                    for(var key in this.paramsForm){
                        let data = this.paramsForm[key];
                        try{
                            tmp = JSON.parse(data);

                        }catch(err){
                            tmp = data.toString()
                        }
                        this.$set(this.currentRow.content, key, tmp)
                    }
                }
                else{
                    let name = this.currentRow.invoke;
                    let invoke = this[this.currentRow.key + 'List'].filter((item)=>{
                        return item.name === name;
                    })
                    switch(invoke[0].type) {
                        case 1:
                            tmp = this.paramsForm;
                            break;
                        case 2:
                            tmp = "{{" + name + "(";
                            for(let index in invoke[0].args){
                                let item = invoke[0].args[index];
                                for(let key in item){
                                    tmp = tmp + "'" + this.paramsForm[key] + "',";
                                }
                            }
                            tmp = tmp.substring(0,tmp.length-1) + ")}}";
                            break;
                        default:
                            tmp = this.paramsForm['args'];
                    }
                    this.currentRow.content = tmp;
                }
                this.dialogVisible = false;
            },

            //flow
            clickFlowContent(row){
                this.currentRow = row;
                if(!row.title){
                    this.$message.error('请先选择测试用例！');
                    return
                }
                if(row.content){
                    this.tmpContent = row.content;
                    this.dialogVisibleFlow = true;
                }
            },
            getCase(row){
                if(!row.prefix || !row.module){
                    this.$message.error("请指定模块和名称进行筛选！");
                    return
                }
                this.caseList = [];
                this.loading = true;
                let self = this;
                getCaseList({
                    project_id: this.formValidate.project_id,
                    module: row.module,
                    name: row.prefix,
                    type: 1,
                    normal: 1
                }).then(function (response) {
                    console.log(response)
                    if(response.data.code === 0){
                        self.caseList = response.data.cases;
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                    self.loading = false;
                })
            },
            choosedCase(val,index){
                let list = this.caseList.filter((item)=>{
                    return item.title === val;
                })
                this.contentList[index].content = list[0].content;
            },
            editContent(){
                let obj = {};
                try{
                    obj = JSON.parse(this.tmpContent);
                    this.currentRow.content = this.tmpContent;
                    this.dialogVisibleFlow = false;
                }
                catch(err){
                    this.$notify.error("用例内容不是合法的JSON格式！");
                }
            },
            checkFlowContent(){
                if(this.isScript && this.formValidate.content == ''){
                    this.$message.error("业务流脚本不能为空！");
                    return false
                }
                if(!this.isScript && !this.combineFlowContent()){
                    return false
                }
                return true
            },
            combineFlowContent(){
                if(this.contentList.length === 0){
                    this.$message.error("业务流至少包含一个测试用例!")
                    return false;
                }
                let str = '{';
                this.contentList.forEach((item,index)=>{
                    str += '"' + (index+1) + '": ' + item.content + ',';
                })
                str = str.substring(0,str.length-1) + '}';
                this.formValidate.content = str;
                return true;
            },
            submitFlow(){
                if (this.checkFlowContent()) {
                    // console.log(this.formValidate)
                    //有id表示是做修改，没有表示是新增
                    let ref = this;
                    if (ref.formValidate.id > 0 ){
                        updateCase(ref.formValidate.id, ref.formValidate).then(function (response) {
                            if(response.data.code === 0){
                                ref.$message.success('提交成功!');
                                ref.gotoCaseList();
                                ref.handleReset();
                            }else{
                                ref.$message.error(response.data.msg);
                            }
                        }).catch(function (error) {
                        });
                    }
                    else{
                        createNewCase(ref.formValidate).then(function (response) {
                            if(response.data.code === 0){
                                ref.$message.success('提交成功！请在用例列表中查看');
                                ref.handleReset();
                            }else{
                                ref.$message.error(response.data.msg);
                            }
                        }).catch(function (error) {
                        });
                    }
                }
                else{
                    return false;
                }
            },
            convertFlowContent(){
                let content = this.formValidate.content;
                let obj = {};
                try{
                    obj = JSON.parse(content)
                }
                catch(err){
                    this.$message.error("业务流内容异常，无法解析，请联系开发人员查看！")
                    return
                }
                if(obj.flow_script){
                    this.isScript = true;
                }
                else{
                    this.contentList = [];
                    for(var key in obj){
                        this.contentList.push({module: "", prefix: "", title: "", content: JSON.stringify(obj[key], null, 4)})
                    }
                }
            },
        },
        beforeDestroy() {
            this.$store.dispatch('app/toggleParentNav')
        }
    }
</script>

<style scoped>
    ._caseJson .json-editor >>> .CodeMirror {
        max-height: 100%;
        min-height: 520px;
        font-size: 16px;
    }
    ._caseJson .json-editor >>> .CodeMirror-scroll{
        min-height: 520px;
    }
</style>