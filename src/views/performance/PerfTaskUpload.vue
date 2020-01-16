<template>
    <div class="content">
        <el-row>
            <el-col :span="8" :offset="8">
                <el-upload
                        ref="upload"
                        class="upload-demo"
                        drag
                        :action="getUploadPath()"
                        :headers="headers"
                        :on-success='handleSuccess'
                        :on-error='handleError'
                        :before-upload="beforeUpload">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">
                        <span>仅支持单文件上传，仅支持xls/xlsx文件</span>
                        <el-button type="primary" icon="el-icon-download" size="mini" round style="margin-left: 55px" @click="getTemplate">模板下载</el-button>
                        <el-button type="ghost" icon="el-icon-delete" size="mini" round style="margin-left: 20px" @click="cleanLog">清空记录</el-button>
                    </div>
                </el-upload>
            </el-col>
        </el-row>
        <div v-if="dialogVisible">
            <hr style="height: 1px;border: none;background-color: #E6E6E6;margin-top: 20px;"/>
            <el-row style="margin-top: 15px">
                <span>上传结果：</span>
                <span class="span-info" style="font-weight: bold;">Total
                    <span style="font-size: 20px;margin-left: 2px">{{number}}</span>
                </span>
                <span class="span-success" style="margin-left: 20px;font-weight: bold;">Pass
                    <span style="font-size: 20px;margin-left: 2px">{{pass_number}}</span>
                </span>
                <span class="span-danger" style="margin-left: 20px;font-weight: bold;" v-if="fail_number">Fail
                    <span style="font-size: 20px;margin-left: 2px">{{fail_number}}</span>
                </span>
            </el-row>
            <el-table :data="tasks" v-if="fail_number"
                      height="450" border class='_table' header-cell-class-name="_table-head">
                <el-table-column prop="line_number" label="行号" width="160"></el-table-column>
                <el-table-column show-overflow-tooltip prop="wrong" label="错误详情"></el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
    import { getProjectList } from '@/api/project';
    import {  downloadTask} from '@/api/performance';
    import Cookies from "js-cookie";
    const rootPath = process.env.BASE_API;

    export default {
        name:'PerfTaskUpload',
        data() {
            return {
                fail_number:0,
                number:0,
                pass_number :0,
                fileList: [],
                tasks: [],
                headers: {
                    uidNumber: Cookies.get("uidNumber"),
                    token: Cookies.get("token"),
                    platform: Cookies.get("platform")
                },
                dialogVisible: false,
            };
        },
        computed:{
        },
        mounted() {
        },
        methods: {
            //清空记录
            cleanLog(){
                this.$refs.upload.clearFiles();
                this.dialogVisible = false;
            },
            resetData(){
                this.fail_number=0,
                this.number=0,
                this.pass_number=0,
                this.tasks =[];
                this.dialogVisible = false;
            },
            getUploadPath(){
                return rootPath + '/perf/task_upload';
            },
            beforeUpload(file){
                let tmp = file.name.split(".");
                let type = tmp[tmp.length-1];
                const isXls = type === 'xls';
                const isXlsx = type === 'xlsx';
                if( isXls || isXlsx){
                    this.resetData()
                    return true
                }
                else{
                    this.$message.error('仅支持xls/xlsx文件!');
                    return false
                }
            },
            handleError(err, file, fileList){
                this.$message({
                    showClose: true,
                    message: err,
                    type: 'error'
                });
            }
            ,
            handleSuccess(response, file, fileList) {
                if(response.result){
                    this.dialogVisible = true;
                    this.pass_number=response.pass_number;
                    this.fail_number=response.fail_number;
                    this.number=response.number;
                    if(response.code === 0){
                        this.$message.success('上传成功！')
                    }
                    else{
                        this.tasks = response.result;
                    }
                }
                else{
                    this.$message.error(response.msg)
                }
            },
            getTemplate(){
                let self = this;
                downloadTask(
                    {"ids":[],"name":"task_template"}//id为空 下载模板
                ).then(function (response) {
                    if(response.data.code === 0){
                        window.open(response.data.result);
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                }).catch(function (err) {
                });
            },
            goToList(){
                this.$router.push({
                    path: '/perf/perfTaskList',
                    name: 'perfTaskList',
                })
            }
        },
        beforeDestroy() {
            this.$store.dispatch('app/toggleParentNav')
        }
    }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    ._upload{
        margin: 10px 0;
        font-size: 16px;
        .el-tag{
            margin: 10px;
            font-size: 14px;
        }
    }
</style>

