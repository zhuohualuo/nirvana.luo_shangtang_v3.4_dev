<template>
    <div v-loading="loading">
        <el-row>
            <el-col :span="8" :offset="9">
                <el-upload
                        ref="upload"
                        accept=".json"
                        drag
                        :data="form"
                        :action="getUploadPath()"
                        :headers="headers"
                        :on-success="handleSuccess"
                        :on-error="handleError"
                        :auto-upload="false"
                        :limit=1
                        :multiple="false">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击选取文件</em></div>
                    <div class="el-upload__tip" slot="tip">
                        <span>仅支持单文件上传，仅支持json文件</span>
                        <el-button type="primary" icon="el-icon-download" size="mini" round style="margin-left: 55px" @click="getTemplate">模板下载</el-button>
                    </div>
                </el-upload>
            </el-col>
        </el-row>
        <br/>
        <el-row style="text-align: center">
            <el-form :model="form" :rules="formRule" ref="form1" :inline="true">
                <el-form-item label="项目" prop="project_id" :label-width="formLabelWidth">
                    <el-select v-model="form.project_id" @change="()=>{form.version_id='';form.module=''}">
                        <el-option v-for="item in projectList" :key="item.id" :value="item.id" :label="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="版本" prop="version_id" :label-width="formLabelWidth">
                    <el-select v-model="form.version_id" @change="()=>{form.module=''}" @visible-change="getVersion" :disabled="form.project_id===''">
                        <el-option v-for="item in versionList" :key="item.id" :value="item.id" :label="item.version"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="模块" prop="module" :label-width="formLabelWidth">
                    <el-select v-model="form.module" @visible-change="getModule" :disabled="form.version_id===''">
                        <el-option v-for="item in moduleList" :key="item" :value="item" :label="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label-width="formLabelWidth">
                    <el-button type="primary" @click="submitUpload">提交</el-button>
                </el-form-item>
            </el-form>
        </el-row>
        <div v-if="dialogVisible">
            <hr style="height: 1px;border: none;background-color: #E6E6E6;margin-top: 5px;"/>
            <el-row>
                <span>导入结果：</span>
                <span class="span-info" style="font-weight: bold;">Total
                    <span style="font-size: 20px;margin-left: 2px">{{swaggers.total}}</span>
                </span>
                <span class="span-success" style="margin-left: 15px;font-weight: bold;">Pass
                    <span style="font-size: 20px;margin-left: 2px">{{swaggers.pass_num}}</span>
                </span>
                <span class="span-danger" style="margin-left: 15px;font-weight: bold;">Fail
                    <span style="font-size: 20px;margin-left: 2px">{{swaggers.fail_num}}</span>
                </span>
            </el-row>
            <el-row>
                <el-table :data="swaggers.fail" empty-text="没有失败数据"
                          height="420" border class='_table' header-cell-class-name="_table-head">
                    <el-table-column prop="path" label="URL"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="method" label="请求方法"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="fail_msg" label="失败原因"></el-table-column>
                </el-table>
            </el-row>
        </div>
    </div>
</template>

<script>
    import {getModuleList, getProjectList, getVersionList} from '@/api/project';
    import {swaggerUpload,getSwaggerTemplate} from '@/api/case';
    import Cookies from "js-cookie";

    const rootPath = process.env.BASE_API;
    export default {
        name : "SwaggerUpload",
        data(){
            return {
                loading: false,
                dialogVisible: false,
                projectList: [],
                versionList: [],
                moduleList: [],
                formLabelWidth: '70px',
                swaggers:{
                    total : '',
                    fail_num : '',
                    pass_num : '',
                    fail:[]
                },
                form:{
                    project_id:"",
                    version_id:"",
                    module:"",
                },
                headers: {
                    uidNumber: Cookies.get("uidNumber"),
                    token: Cookies.get("token"),
                    platform: Cookies.get("platform")
                },
                formRule:{
                    project_id: [{required: true, message: '请选择项目', trigger: 'change'}],
                    version_id: [{required: true, message: '请选择版本', trigger: 'change'}],
                    module: [{required: true, message: '请选择模块', trigger: 'change'}],
                    file: [{required: true, message: '请选择文件', trigger: 'blur'}],
                }
            }
        },
        mounted() {
            this.getProject();
            this.getVersion(true);
            this.getModule(true);
        },
        methods: {
            returnList(){
                this.$router.push({
                    name : "interfaceList"
                })
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response){
                    self.projectList = response.data.projects;
                }).catch(function (err){
                });
            },
            getVersion(flag){
                let self = this;
                if(flag===true){
                    getVersionList({
                        project_id:self.form.project_id
                    }).then(function (response){
                        self.versionList = response.data.version;
                    }).catch(function(err){
                    })
                }
            },
            getModule(flag){
                let self = this;
                if(flag===true){
                    getModuleList({
                        project_id: self.form.project_id,
                        version_id: self.form.version_id
                    }).then(function (response){
                        self.moduleList = response.data.module;
                    }).catch(function(err){
                    });
                }
            },
            getUploadPath(){
                return rootPath + '/api/swagger/json';
            },
            handleError(err, file, fileList){
                this.$message({
                    showClose: true,
                    message: err,
                    type: 'error'
                });
            },
            handleSuccess(response, file, fileList){
                if(response.code===3){
                    this.handleReset("form1");
                    this.$message.error(response.msg);
                    this.dialogVisible = false;
                }
                else{
                    this.dialogVisible = true;
                    this.swaggers.fail=[];
                    this.swaggers.fail_num = response.record.fail_num;
                    this.swaggers.pass_num = response.record.pass_num;
                    this.swaggers.total = response.record.fail_num + response.record.pass_num;
                    var arr= response.record.fail;
                    for (let index = 0; index < arr.length; index++) {
                        for(var key in arr[index]){
                            if(key == 'fail_msg'){
                                this.swaggers.fail[index].fail_msg=arr[index][key];
                            }else{
                                this.swaggers.fail.push({'path':key,'method':arr[index][key]});
                            }
                        }
                    }
                }
                this.$refs.upload.clearFiles();
                this.loading=false;
            },
            submitUpload() {
                if(this.validateFormRule('form1') && this.checkFileType()){
                    this.loading=true;
                    this.$refs.upload.submit();
                }
            },
            validateFormRule(formName){
                let result = false;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        result = true;
                    }
                    else {
                    }
                })
                return result;
            },
            checkFileType(){
                let self = this;
                let file = this.$refs.upload.uploadFiles;
                let isJSON = false;
                if(file.length>0 && file[0].status==="ready"){
                    isJSON = file[0].raw.type==='application/json';
                    if(!isJSON){
                        self.$message.error("请选择JSON文件！");
                        return false;
                    }
                    return true;
                }
                self.$message.error("请选择文件！");
                return false;
            },
            handleReset(formName){
                this.$refs[formName].resetFields();
                this.swaggers = {
                    total : '',
                    fail_num : '',
                    pass_num : '',
                    fail:[]
                }
            },
            getTemplate(){
                let self = this;
                getSwaggerTemplate().then(function (response) {
                    console.log(response);
                    if(response.data.code === 0){
                        window.location.href = rootPath + '/common/report/download/' + response.data.file;
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                }).catch(function (err) {
                });
            }
        },
        beforeDestroy() {
            this.$store.dispatch('app/toggleParentNav')
        }
    }
</script>

<style>
    .body-content{
        text-align: center;
    }
</style>
