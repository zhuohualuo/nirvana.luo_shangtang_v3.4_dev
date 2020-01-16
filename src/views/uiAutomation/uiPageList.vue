<template>
    <div id="content">
        <el-row>
            <el-col :span="10" :offset="1">
                <el-card>
                    <div slot="header" class="clearfix">
                        <span>封装页面</span>
                        <div style="display: block;float: right;">
                            <el-select v-model="form.project_id" size="mini" @change="form.version_id=''">
                                <el-option v-for="item in projectList" :value="item.id" :key="item.id" :label="item.name"></el-option>
                            </el-select>
                            <el-select v-model="form.version_id" size="mini" style="width: 90px" @change="initPageList">
                                <el-option v-for="item in versionList" :value="item.id" :key="item.id" :label="item.version"></el-option>
                            </el-select>
                        </div>
                    </div>
                    <el-table :data="pageList.programData"
                              height="550" border class='_table' header-cell-class-name="_table-head">
                        <!--<el-table-column show-overflow-tooltip prop="id" label="id"></el-table-column>-->
                        <el-table-column type="index" label="序号" width="70"></el-table-column>
                        <el-table-column show-overflow-tooltip label="名称">
                            <template slot-scope='props'>
                                <span>{{props.row}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120">
                            <template slot-scope='props'>
                                <el-row>
                                    <el-col :span='6'>
                                        <el-button size='small' type="primary" @click='viewDetailOfPage(props.row)'>查看方法</el-button>
                                    </el-col>
                                </el-row>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="block">
                        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                                       :page-sizes="[10, 15, 20, 50, 100]"
                                       :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                                       :total="pageList.count">
                        </el-pagination>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="2">
                <hr style="width: 1px;height: 700px;border: none;background-color: #E6E6E6;"/>
            </el-col>
            <el-col :span="10">
                <el-card header="通用操作">
                    <!--<el-form :inline="true" class="_bottom0 demo-form-inline">-->
                        <!--<el-form-item label="名称">-->
                            <!--<el-input v-model="form2.page_name" style="width: 100px"></el-input>-->
                        <!--</el-form-item>-->
                        <!--<el-form-item>-->
                            <!--<el-button type="primary" size='small' @click="seachConditionOfFunc" icon="el-icon-search"></el-button>-->
                        <!--</el-form-item>-->
                    <!--</el-form>-->
                    <el-table :data="funcList.programData"
                              height="550" border class='_table' header-cell-class-name="_table-head">
                        <!--<el-table-column show-overflow-tooltip prop="id" label="id"></el-table-column>-->
                        <el-table-column type="index" label="序号" width="55"></el-table-column>
                        <el-table-column show-overflow-tooltip label="名称" prop="name"></el-table-column>
                        <el-table-column show-overflow-tooltip label="描述" prop="desc" width="300"></el-table-column>
                        <el-table-column show-overflow-tooltip label="参数" prop="params"></el-table-column>
                    </el-table>
                    <!--<div class="block">-->
                        <!--<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum_S"-->
                                       <!--:page-sizes="[10, 15, 20, 50, 100]"-->
                                       <!--:page-size="pageNums_S" layout="total, sizes, prev, pager, next, jumper"-->
                                       <!--:total="funcList.count">-->
                        <!--</el-pagination>-->
                    <!--</div>-->
                </el-card>
            </el-col>
        </el-row>

        <el-dialog :title="form.page_name" :visible.sync="pageDetailVisible" width="40%">
            <el-table :data="detailList"
                      height="490" border class='_table' header-cell-class-name="_table-head">
                <el-table-column type="index" label="序号" width="55"></el-table-column>
                <el-table-column show-overflow-tooltip label="名称" prop="name"></el-table-column>
                <el-table-column show-overflow-tooltip label="描述" prop="desc" width="300"></el-table-column>
                <el-table-column show-overflow-tooltip label="参数" prop="params"></el-table-column>
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="pageDetailVisible = false">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import { getProjectList, getVersionList } from '@/api/project';
    import { getPageList, getPageDetail, getMethodList } from '@/api/webUI';
    import moment from 'moment'; //引入moment格式化时间

    export default {
        name: "uiPageList",
        data() {
            return {
                form: {
                    page_type: 1,
                    page_name: '',
                    project_id: 5,
                    version_id: 49
                },
                form2: {
                    page_name: '',
                },
                projectList: [],
                versionList: [],
                pageDetailVisible: false,
                pageList: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                funcList: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                pageNums: 10,//每页几条
                pageNum: 1, //当前是第几页
                pageNums_S: 10,//每页几条
                pageNum_S: 1, //当前是第几页
                detailList: []
            }
        },
        computed: {
        },
        mounted() {
            this.initPageList(Object.assign({'page_no': 1, 'page_size': 10}, this.form));
            this.initFuncList();
            this.getProject();
            this.getVersion();
        },
        methods: {
            handleSizeChange(val) {
                this.pageNums = val;
                this.initPageList(Object.assign({'page_no': this.pageNum, 'page_size': val}, this.form));
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.initPageList(Object.assign({'page_no': val, 'page_size': this.pageNums}, this.form));
            },
            // handleSizeChange_S(val) {
            //     this.pageNums_S = val;
            //     this.initFuncList();
            // },
            // handleCurrentChange_S(val) {//改变页码
            //     this.pageNum_S = val;
            //     this.initFuncList();
            // },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects
                }).catch(function (err) {
                });
            },
            getVersion(){
                    let self = this;
                    getVersionList({project_id: this.form.project_id}).then(function (response) {
                        console.log(response)
                        self.versionList = response.data.version;
                    }).catch(function (err) {
                    });
            },
            initPageList(params){
                let self = this;
                getPageList(params).then(function (response) {
                    console.log(response)
                    self.pageList = {
                        page_no: params.page_no,
                        page_size: 10 || params.page_size,
                        count: response.data.total,
                        programData: response.data.content.page_name
                    }
                }).catch(function (err) {
                });
            },
            initFuncList(){
                let self = this;
                getMethodList({
                    page_name: "通用操作"
                }).then(function (response) {
                    console.log(response)
                    let tmp = [];
                    for(var key in response.data.content){
                        let value = response.data.content[key];
                        value.name = key;
                        tmp.push(value)
                    }
                    self.funcList = {
                        page_no: self.pageNum,
                        page_size: 10 || self.pageNums,
                        count: response.data.total,
                        programData: tmp
                    }
                }).catch(function (err) {
                });
            },
            viewDetailOfPage(self){
                this.form.page_name = self;
                let ref = this;
                getPageDetail(this.form).then(function (response) {
                    console.log(response)
                    if(response.data.code===0){
                        let tmp = [];
                        for(var key in response.data.content){
                            let value = response.data.content[key];
                            value.name = key;
                            tmp.push(value)
                        }
                        ref.detailList = tmp;
                    }
                    else{
                        ref.$message.error(response.data.msg)
                    }
                }).catch(function (err) {
                });
                this.pageDetailVisible = true;
            },
            //时间格式化
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            resetForm()
            {
                if(this.$refs["form"] != undefined){
                    this.form = {
                        page_type: 1,
                        project_id: '',
                        version_id: ''
                    }
                }
            },
            open1() {
                this.$message({
                    showClose: true,
                    message: '保存成功！',
                    type: 'success'
                });
            },
            open2() {
                this.$message({
                    showClose: true,
                    message: '删除成功！',
                    type: 'success'
                });
            },
            open3(msg) {
                this.$message({
                    showClose: true,
                    message: msg,
                    type: 'fail'
                });
            }
        }
    }
</script>

<style scoped>
    .block {
        float: right;
        margin-top: 15px;
    }
    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }
    .clearfix:after {
        clear: both
    }
</style>
