<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' @click="addConfig" icon="el-icon-plus">新 增</el-button>
            </div>
            <advance-filter :formData="form2" :filterArray="filterArray" @search="seachCondition"></advance-filter>
        </el-row>

        <el-row>
            <el-table :data="pageList.programData"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <el-table-column type="index" width="55" label="序号"></el-table-column>
                <el-table-column show-overflow-tooltip prop="id" width="90" label="ID"></el-table-column>
                <el-table-column show-overflow-tooltip prop="cfg_name" label="配置名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="project" label="项目"></el-table-column>
                <el-table-column show-overflow-tooltip prop="version" label="版本" width="120"></el-table-column>
                <el-table-column show-overflow-tooltip prop="module" label="模块" width="120"></el-table-column>
                <el-table-column show-overflow-tooltip prop="type" label="类型" width="120" :formatter="typeFormat"></el-table-column>
                <el-table-column show-overflow-tooltip prop="created_time" label="创建日期" width="170" :formatter="dateFormat"></el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="修改日期" width="170" :formatter="dateFormat"></el-table-column>
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[20, 30, 50, 100, 150]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="pageList.count">
            </el-pagination>
        </div>

        <el-dialog :title="isEdit?'编辑配置':'新增配置'" :visible.sync="dialogFormVisible">
            <el-form :model="form" :rules="formRule" ref="form">
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="项目" prop="project_id">
                            <el-select v-model="form.project_id"
                                       @change="()=>{form.version_id='';form.module=''}">
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
                        <el-form-item label="版本" prop="version_id">
                            <el-select v-model="form.version_id" clearable
                                       :disabled="form.project_id===''"
                                       @visible-change="getVersion"
                                       @change="()=>{form.module=''}">
                                <el-option
                                        v-for="(item,index) in versionList"
                                        :label="item.version"
                                        :value="item.id"
                                        :key="index">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="模块" prop="module">
                            <el-select v-model="form.module" clearable
                                       :disabled="form.version_id===''"
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
                </el-row>
                <el-row>
                    <el-col :span="16">
                        <el-form-item label="名称" prop="cfg_name">
                            <el-input v-model.trim="form.cfg_name" auto-complete="off" style="width: 81%"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="类型">
                            <el-select v-model="form.type" clearable>
                                <el-option
                                        v-for="item in caseTypeList"
                                        :value="item.id"
                                        :key="item.id"
                                        :label="item.type_name">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <config-table :tableColumn="tableColumn" :tableData="configForm" :height="450"></config-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveConfigManage">保 存</el-button>
            </div>
        </el-dialog>

        <el-dialog title="配置内容" :visible.sync="detailVisible" width="40%">
            <el-table :data="configForm"
                      height="490" border class='_table' header-cell-class-name="_table-head">
                <el-table-column show-overflow-tooltip prop="name" label="Key"></el-table-column>
                <el-table-column show-overflow-tooltip prop="description" label="Desc"></el-table-column>
                <el-table-column show-overflow-tooltip prop="value" label="Value"></el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="detailVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="克隆配置" :visible.sync="cloneVisible" width="40%">
            <el-form :inline="true" class="demo-form-inline">
                <el-form-item label="新配置名称" label-width="120px" required>
                    <el-input v-model="form.cfg_name" style="width: 450px"></el-input>
                </el-form-item>
                <el-form-item label="项目" label-width="120px" required>
                    <el-select v-model="form.project_id" disabled>
                        <el-option
                                v-for="(item,index) in projectList"
                                :label="item.name"
                                :value="item.id"
                                :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="版本" label-width="50px">
                    <el-select v-model="form.version_id"
                               style="width: 90%;"
                               @visible-change="getVersion"
                               clearable>
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
    import ConfigTable from "../../components/ConfigTable/index";
    import { FilterProject, FilterVersion, FilterModule, FilterCaseType, FilterKey } from '@/common/index';
    import { getConfigList, createConfig, cloneConfig, updateConfig, deleteConfig } from '@/api/config';
    import { getKeyList } from '@/api/config';
    import { getCaseTypeList } from '@/api/case';
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import moment from 'moment' //引入moment化简时间

    export default {
        name: 'ConfigList',
        components: {ConfigTable, TableOperator, AdvanceFilter},
        data() {
            return {
                form: {
                    id: 0,
                    project_id: '',
                    version_id: '',
                    module: '',
                    type: '',
                    cfg: {},
                    cfg_name: ''
                },
                form2: {
                    id:'',
                    project_id: '',
                    version_id: '',
                    module: '',
                    type: '',
                    name: ''
                },
                projectList: [],
                versionList: [],
                versionList1: [],
                moduleList: [],
                moduleList1: [],
                caseTypeList: [],
                configForm: [{name: '', description: '', value: ''}],
                formLabelWidth: '150px',
                pageNums: 20,//每页几条
                pageNum: 1, //当前是第几页
                dialogFormVisible: false,
                detailVisible: false,
                cloneVisible: false,
                pageList: {
                    page_no: 1,//页面开始页码
                    page_size: 20,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                formRule: {
                    project_id: [
                        { required: true, message: '请选择项目', trigger: 'change' },
                    ],
                    cfg_name: [
                        { required: true, message: '请填写名称', trigger: 'blur' },
                    ]
                },
                isEdit:false,
                filterArray: [
                    {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject,
                        change:()=>{this.form2.version_id='';this.form2.module=''}},
                    {key:'id',name:'ID',type:'input'},
                    {key:'name',name:'配置名称',type:'input'},
                    {key:'version_id',name:'版本',type:'select',optionList:[],visible: this.getFilterVersion,
                        change:()=>{this.form2.module=''},disable:()=>{return this.form2.project_id===''}},
                    {key:'module',name:'模块',type:'select',optionList:[],visible: this.getFilterModule,
                        disable:()=>{return this.form2.version_id===''}},
                    {key:'type',name:'类型',type:'select',optionList:[],visible: this.getFilterCaseType},
                ],
                operateArray: [
                    {label:'查看', click:this.viewSelf1},
                    {label:'编辑', click:this.updateSelf1},
                    {label:'克隆', click:this.cloneSelf1},
                    {label:'删除', click:this.deleteSelf1}
                ],
                tableColumn:[
                    {label:"参数",key:"name",type:"select",require:true,optionList:[],visible:this.getParams},
                    {label:"值",key:"value",type:"input",require:true},
                ],
            }
        },

        computed: {
        },

        mounted() {
            this.getListByPage();
            this.getProject();
            this.getCaseType();
        },

        methods: {
            handleSizeChange(val) {
                this.pageNum = 1;
                this.pageNums = val;
                this.getListByPage();
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.getListByPage();
            },
            getListByPage() {
                let self = this;
                getConfigList({
                    id: self.form2.id,
                    name: self.form2.name,
                    project_id: self.form2.project_id,
                    version_id: self.form2.version_id,
                    module: self.form2.module,
                    type: self.form2.type,
                    page_no: self.pageNum,
                    page_size: self.pageNums,
                }).then(function (response) {
                    console.log(response)
                    self.pageList = {
                        page_no: self.pageNum,
                        page_size: 20 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.keys
                    }
                })
            },
            rowToFrom(self){
                this.form.id = self.id;
                this.form.project_id = self.project_id;
                this.form.version_id = self.version_id ? self.version_id : '';
                this.form.module = self.module;
                this.form.type = self.type;
                this.form.cfg_name = self.cfg_name;
                this.configForm = [];
                let ref = this;
                getKeyList({project_id: this.form.project_id}).then(function (response) {
                    for(var key in self.cfg){
                        let tmp = response.data.keys.filter((item)=>{
                            return item.name === key;
                        })
                        ref.configForm.push({name: key, value: self.cfg[key].toString(), description: tmp[0] ? tmp[0].description : ''})
                    }
                }).catch(function (err) {
                });
            },
            viewSelf1(self){
                this.rowToFrom(self);
                this.detailVisible = true;
            },
            updateSelf1(self) {
                this.isEdit = true;
                this.rowToFrom(self);
                this.getVersion(true);
                if(self.version_id){
                    this.getModule(true);
                }
                this.dialogFormVisible = true;
            },
            cloneSelf1(self){
                this.form= {
                    id: self.id,
                    project_id: self.project_id,
                    version_id: self.version_id,
                    module: '',
                    type: '',
                    cfg: {},
                    cfg_name: ''
                }
                this.getProject(true)
                this.getVersion(true)
                this.cloneVisible = true;
            },
            deleteSelf1(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteConfig(self.id).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.$message.success("删除成功！");
                            ref.getListByPage();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
                        .catch(function (err) {
                        });
                }).catch(() => {})
            },
            submitClone(){
                if(this.form.cfg_name === ''){
                    this.$notify.error("新配置名称不可以为空！");
                    return false;
                }
                let ref = this;
                cloneConfig({
                    id: ref.form.id,
                    name: ref.form.cfg_name,
                    version_id: ref.form.version_id
                }).then(function (response) {
                    console.log(response)
                    if (response.data.code === 0) {
                        ref.$message.success("克隆成功！");
                        ref.cloneVisible = false;
                        ref.getListByPage();
                        ref.resetForm();
                    }
                    else {
                        ref.$message.error(response.data.msg);
                    }
                })
            },
            saveConfigManage() {
                if (!this.validateFormRule('form')) {
                    return false;
                }
                this.form.cfg = {};
                for(let item of this.configForm){
                    if(item.name === '' || item.value === ''){
                        this.$notify.error("参数名或值不可以为空！");
                        return false;
                    }
                    else{
                        this.form.cfg[item.name] = item.value;
                    }
                }
                let ref = this;
                //id大于0时为编辑，小于等于0为新增
                if(ref.form.id > 0){
                    updateConfig(ref.form.id, ref.form).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.$message.success("保存成功！");
                            ref.dialogFormVisible = false;
                            ref.getListByPage();
                            ref.resetForm();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
                }
                else{
                    createConfig(ref.form).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.$message.success("保存成功！");
                            ref.dialogFormVisible = false;
                            ref.getListByPage();
                            ref.resetForm();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
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
            addConfig(){
                this.isEdit = false;
                this.resetForm();
                this.dialogFormVisible = true;
            },
            resetForm()
            {
                if(this.$refs["form"] != undefined){
                    this.$refs["form"].resetFields();
                }
                this.form = {
                    id: 0,
                    project_id: '',
                    version_id: '',
                    module: '',
                    type: '',
                    cfg: {},
                    cfg_name: ''
                }
                this.configForm = [{name: '', description: '', value: ''}];
            },
            typeFormat(row, column){
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
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    // console.log(response)
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getVersion(flag){
                if(flag === true) {
                    let self = this;
                    getVersionList({project_id: self.form.project_id}).then(function (response) {
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
            getCaseType(){
                let self = this;
                getCaseTypeList().then(function (response){
                    console.log(response)
                    self.caseTypeList = response.data.types;
                }).catch(function (err) {
                });
            },
            getFilterProject(item){
                FilterProject(item)
            },
            getFilterVersion(item){
                FilterVersion(item, this.form2)
            },
            getFilterModule(item){
                FilterModule(item, this.form2)
            },
            getFilterCaseType(item){
                FilterCaseType(item)
            },
            getParams(item){
                FilterKey(item, this.form)
            },
            seachCondition() {
                this.pageNum = 1;
                this.getListByPage();
            },
        }
    }
</script>
<style scoped>
    .el-textarea.is-disabled .el-textarea__inner {
        color: #606266;
        border: none;
        width: 100%;
    }

    .input-with-select .el-input-group__prepend {
        background-color: #fff;
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
