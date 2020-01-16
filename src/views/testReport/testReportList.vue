<template>
    <div id="content">
        <el-row >
            <el-col :span="22">
                <el-button type="warning" size='small' icon="el-icon-arrow-up" @click="goBack" v-show="currentPath!==''">返回上一级</el-button>
                <span style="margin-left: 15px;font-size: 16px">{{currentPath}}</span>
            </el-col>
            <el-col :span="2">
                <el-dropdown @command="batchDoownload">
                    <el-button type="primary" :loading="load" size="small">
                        下载<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="selected">选中文件（夹）：{{this.multipleSelection.length || 0}}</el-dropdown-item>
                        <el-dropdown-item command="all">所有文件（夹）：
                            <span v-if="testReportList">{{this.testReportList.count}}</span>
                            <span v-else>0</span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-row>
        <el-row>
            <el-table :data="testReportList.programData"
                      highlight-current-row
                      height="680" border class='_table' header-cell-class-name="_table-head"
                      @row-dblclick="gotoPath"
                      @selection-change="handleSelectionChange">
                <el-table-column type="selection"></el-table-column>
                <el-table-column type="index" label="序号" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip label="报告名称">
                    <template slot-scope="scope">
                        <div>
                            <span v-if="scope.row.dir === false" style="font-size: 16px">{{scope.row.name}}</span>
                            <span v-if="scope.row.dir === true" style="font-size: 16px">
                                <img style="vertical-align:middle" src="../../../static/img/folder-s.png">{{scope.row.name}}
                            </span>
                        </div>
                    </template>
                </el-table-column>
                <!--<el-table-column show-overflow-tooltip prop="owner" label="创建人" width="150"></el-table-column>-->
                <el-table-column label="类型" width="150">
                    <template slot-scope="scope">
                        <span v-if="scope.row.dir === true">文件夹</span>
                        <span v-if="scope.row.dir === false">{{getFileType(scope.row.name)}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="create_time" label="生成日期" width="200"></el-table-column>
                <el-table-column prop="operation" label="操作" width="250">
                    <template slot-scope='props'>
                        <el-row v-if="props.row.dir === false">
                            <el-col :span='5'>
                                <el-button type='text' @click='getSee(props.row)' class="op-btm">预览</el-button>
                            </el-col>
                            <el-col :span='5' :offset='4'>
                                <el-button type='text' @click='getDownload(props.row)' class="op-btm">下载</el-button>
                            </el-col>
                            <!--<el-col :span='5' :offset='2'>-->
                                <!--<el-button size='small' type='text' @click='deleteSelf1(props.row)'>删除</el-button>-->
                            <!--</el-col>-->
                        </el-row>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[20, 30, 50, 100, 150]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="testReportList.count">
            </el-pagination>
        </div>

    </div>
</template>
<script>
    import { getReportList, deleteReport,downloadReportList } from '@/api/others';
    const rootPath = process.env.BASE_API;

    export default {
        name: 'testReportList',
        data() {
            return {
                testReportList: [],
                lastAPath:[],
                currentPath:'',
                pageNums: 20,//每页几条
                pageNum: 1,//当前是第几页,
                multipleSelection:[],
                load:false
            }
        },
        computed: {},
        mounted() {
            this.initList();
        },
        methods: {
            goBack(){
                this.lastAPath.pop(-1);
                this.currentPath = this.lastAPath.join("/");
                this.pageNum = 1;
                this.initList();
            },
            gotoPath(row){
                if(row.dir === true)
                {
                    this.lastAPath.push(row.name);
                    this.currentPath = this.lastAPath.join("/");
                    this.pageNum = 1;
                    this.initList();
                }
            },
            getFileType(fileName){
                return fileName.substring(fileName.lastIndexOf('.') + 1);
            },
            getSee(self){
                // window.location.href = rootPath + '/common/report/' + self.path;
                window.open(rootPath + '/common/report/' + self.path);
            },
            getDownload(self){
                window.location.href = encodeURI(rootPath + '/common/report/download/' + self.path);
            },
            initList() {
                let self = this;
                getReportList({
                    page_no: self.pageNum,
                    page_size: self.pageNums,
                    path: self.currentPath
                }).then(function (response) {
                    console.log(response)
                    if(response.data.code === 0){
                        self.testReportList = {
                            page_no: self.pageNum,
                            page_size: 20 || self.pageNums,
                            count: response.data.total,
                            programData: response.data.reports
                        }
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                }).catch(function(err){
                    self.$message.error(err.toString())
                })
            },
            deleteSelf1(self) {
                let ref = this;
                deleteReport(self.name).then(function (response) {
                    if (response.data.code === 0) {
                        ref.open1()
                        ref.initList();
                    }
                }).catch(function (err) {
                });
            },
            open1() {
                this.$message({
                    showClose: true,
                    message: '删除成功！',
                    type: 'success'
                });
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
            handleSelectionChange(val){
                this.multipleSelection = val;
            },
            getPathFromList(li){
                let tmp = []
                li.forEach(function(item) {
                    tmp.push(item.path)
                })
                return tmp
            },
            batchDoownload(command){
                let self = this;
                self.load = true
                let report_list = []
                if (command=='selected'){
                    report_list = this.getPathFromList(this.multipleSelection);
                }else if(command=='all'){
                    report_list = [this.currentPath]
                }
                if(report_list.length==0){
                    this.$message.info("请至少选择一个文件")
                    self.load = false
                }else{
                    downloadReportList({
                        report_list: report_list
                    }).then(function (response) {
                        self.load = false
                        console.log(response)
                        if(response.data.code === 0){
                            window.location.href = rootPath + '/common/report/download/' + response.data.path;
                        }
                        else{
                            self.$message.error(response.data.msg)
                        }
                    }).catch(function (err) {

                    });
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

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;

    }
    .op-btm {
        text-decoration:underline;
    }
</style>
