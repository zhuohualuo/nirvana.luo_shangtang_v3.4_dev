<template>
    <div class="app-container">
        <el-row class="replace-tips">{{$t('caseManage.replaceTips')}}</el-row>
        <br/>
        <el-row>
            <el-col :span="12">
                <el-card>
                    <div slot="header" class="card-header">
                        <span>筛选条件</span>
                    </div>
                    <el-form :model="form" ref="form">
                        <el-row>
                            <el-col :span="8">
                                <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id" :rules="{required:true,message:'请选择项目',trigger:'change'}">
                                    <el-select v-model="form.project_id">
                                        <el-option v-for="item in projectList" :value="item.id" :key="item.id"
                                                   :label="item.name"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="版本" :label-width="formLabelWidth">
                                    <el-select v-model="form.version_id" clearable
                                               :disabled="form.project_id===''"
                                               @visible-change="getVersion"
                                               @change="()=>{form.module=''}">
                                        <el-option v-for="item in versionList" :value="item.id" :key="item.id"
                                                   :label="item.version"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="模块" :label-width="formLabelWidth">
                                    <el-select v-model="form.module" clearable
                                               :disabled="form.version_id===''"
                                               @visible-change="getModule">
                                        <el-option v-for="item in moduleList" :value="item" :key="item" :label="item"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="16">
                                <el-form-item label="名称前缀" :label-width="formLabelWidth">
                                    <el-input v-model="form.title" auto-complete="off"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="用例类型" :label-width="formLabelWidth">
                                    <el-select v-model="form.type" clearable>
                                        <el-option v-for="item in caseTypeList" :value="item.id" :key="item.id" :label="item.type_name"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                    <div style="margin-left: 87%">
                        <el-button type="primary" @click="searchCase">查询用例</el-button>
                    </div>
                    <div v-show="queryVisible">
                        <hr style="height: 1px;border: none;background-color: #E6E6E6;"/>
                        <span>查询结果<span style="color: tomato;font-size: 12px">{{$t('caseManage.searchDescription')}}</span></span>
                        <el-table :data="caseList"
                                  height="390" border class='_table' header-cell-class-name="_table-head">
                            <el-table-column type="index" label="序号" width="55"></el-table-column>
                            <el-table-column prop="title" label="用例标题"></el-table-column>
                        </el-table>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="11" :offset="1">
                <el-card>
                    <div slot="header" class="card-header">
                        <span>替换内容</span>
                    </div>
                    <el-form :model="replace" :rules="replaceRule" ref="replace" style="height: 550px">
                        <el-form-item label="替换项" :label-width="formLabelWidth" prop="column">
                            <el-select v-model="replace.column">
                                <el-option value="content" key="1" label="用例内容"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="旧数据" :label-width="formLabelWidth" prop="oldData">
                            <el-input v-model="replace.oldData" type="textarea" :rows="10"></el-input>
                        </el-form-item>
                        <el-form-item label="新数据" :label-width="formLabelWidth" prop="newData">
                            <el-input v-model="replace.newData" type="textarea" :rows="10"></el-input>
                        </el-form-item>
                    </el-form>
                    <div class="block">
                        <el-button type="primary" @click="replaceCase">替 换</el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import { getCaseList, caseReplace, getCaseTypeList } from '@/api/case';

    export default {
        name: "batchReplace",
        data() {
            return {
                form: {
                    project_id: '',
                    version_id: '',
                    module: '',
                    type: '',
                    title: '',
                },
                replace:{
                    column: 'content',
                    oldData: '',
                    newData: '',
                },
                projectList: [],
                versionList: [],
                moduleList: [],
                caseList: [],
                queryVisible: false,
                formLabelWidth: "70px",
                caseTypeList: [],
                replaceRule:{
                    column:[{required:true,message:'请选择替换对象',trigger:'change'}],
                    oldData:[{required:true,message:'请输入旧数据',trigger:'blur'}],
                    newData:[{required:true,message:'请输入新数据',trigger:'blur'}],
                }
            }
        },
        mounted() {
            this.getProject();
            this.getCaseType();
        },
        methods: {
            getProject() {
                let self = this;
                getProjectList().then(function (response) {
                    // console.log(response)
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
            getVersion(flag) {
                if (flag === true) {
                    let self = this;
                    getVersionList({project_id: self.form.project_id}).then(function (response) {
                        console.log(response)
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
                }
            },
            getModule(flag) {
                if (flag === true) {
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
            searchCase() {
                let self = this;
                if (self.validateFormRule('form')) {
                    getCaseList({
                        id_title: true,
                        project_id: this.form.project_id,
                        version_id: this.form.version_id,
                        module: this.form.module,
                        type: this.form.type,
                        name: this.form.title,
                    }).then(function (response) {
                        console.log(response)
                        self.caseList = response.data.cases.slice(0, 50);
                        self.queryVisible = true;
                    })
                }
            },
            dataConvert(){
                return {
                    column: this.replace.column,
                    before: this.replace.oldData,
                    after: this.replace.newData,
                    condition: this.form
                }
            },
            resetForm(){
                this.form = {
                    project_id: '',
                    version_id: '',
                    module: '',
                    type: '',
                    title: '',
                };
                this.replace = {
                    column: 'content',
                    oldData: '',
                    newData: '',
                };
                this.caseList = [];
                this.$nextTick(()=>{
                    this.$refs['form'].clearValidate()
                    this.$refs['replace'].clearValidate()
                })
            },
            replaceCase() {
                let self = this;
                if (self.validateFormRule('form') && self.validateFormRule('replace')){
                    let data = this.dataConvert();
                    this.$confirm('此操作将无法撤销, 是否继续?', '替换', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(()=> {
                        caseReplace(data).then(function (response) {
                            console.log(response)
                            if (response.data.code === 0) {
                                self.$message.success("替换成功！");
                                self.resetForm();
                            }
                            else {
                                self.$message.error(response.data.msg);
                            }
                        })
                    }).catch(() => {})
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
        }
    }
</script>

<style scoped>
    .block {
        float: right;
        margin-bottom: 15px;
    }

    .replace-tips {
        height: 40px;
        line-height: 40px;
        background-color: rgba(66, 185, 131, .1);
        font-size: 20px;
        padding-left: 5px;
    }

    .card-header{
        font-size: 18px;
        font-weight: bold;
    }

    .card-footer{
        display: block;
        float:right;
        margin-bottom: 15px
    }
</style>
