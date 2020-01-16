<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' @click="addPerfPlan" icon="el-icon-plus">新 增</el-button>
                <el-button type="danger" size="small" @click="deletePerfPlan">删 除</el-button>
            </div>
            <advance-filter :formData="form2" :filterArray="filterArray" @search="seachCondition" :show-number="4"></advance-filter>
        </el-row>

        <el-row>
            <el-table :data="perfTaskPlan.programData" ref="table" height="680" border  class='_table' header-cell-class-name="_table-head"
                      @selection-change="handleSetSelectionChange">
                <el-table-column type="selection"></el-table-column>
                <el-table-column show-overflow-tooltip prop="id" label="ID" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="测试任务名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="project_id" label="项目" width="170">
                    <template slot-scope="scope">
                        {{ projectFormat(scope.row.project_id)}}
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="status" label="运行状态" width="200">
                    <template slot-scope="scope">
                        <el-progress v-if="statusList[scope.row.id] == 2" :stroke-width="8" :percentage="progressList[scope.row.id].progress"></el-progress>
                        <span v-if="statusList[scope.row.id] != 2" :class="'span-'+statusTagType(statusList[scope.row.id])">{{statusTagFormat(statusList[scope.row.id])}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="修改时间" width="170"></el-table-column>
                <el-table-column show-overflow-tooltip prop="executor" label="修改人" width="150"></el-table-column>
                <table-operator :operateArray="operateArray" :width="280"></table-operator>
            </el-table>
        </el-row>
        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[20, 30, 50, 100, 150]" :page-size="pageNums" :total="perfTaskPlan.count"
                           layout="total, sizes, prev, pager, next, jumper">
            </el-pagination>
        </div>

        <el-dialog title="填写配置" :visible.sync="configVisible">
            <el-tag class="_configTitle">Setup</el-tag>
            <div style="max-height:160px;width:100%; overflow-y:auto">
                <el-checkbox-group v-model="choosedSetup">
                    <el-checkbox v-for="(item,index) in setupList" :label="item.name" :key="index" border>{{item.description}}</el-checkbox>
                </el-checkbox-group>
            </div>
            <br />
            <br />
            <el-tag class="_configTitle">邮件发送至(请填写完整的邮件地址，以英文逗号分隔)</el-tag>
            <el-form>
                <el-form-item label="收件人" :label-width="formLabelWidth">
                    <el-input v-model="email" placeholder="请输入收件人邮箱地址" style="width:80%"></el-input>
                </el-form-item>
                <el-form-item label="抄送" :label-width="formLabelWidth">
                    <el-input v-model="cc" placeholder="请输入抄送人邮箱地址" style="width:80%"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="configVisible = false">取 消</el-button>
                <el-button type="primary" @click="runPerfPlan">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="报告列表" :visible.sync="reportVisible">
            <el-table :data="reportList.programData" height="490" border class='_table' header-cell-class-name="_table-head">
                <el-table-column label="报告名称">
                    <template slot-scope="props">
                        <a class="link-in-table" @click="getReportPath(props.row)">
                            {{props.row.title}}
                        </a>
                        <el-tag v-if="(pageNum_R===1)&&props.$index===0" type="danger" style="margin-left:10px">最新</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="pass_count" label="成功数" width="100"></el-table-column>
                <el-table-column prop="fail_count" label="失败数" width="100"></el-table-column>
                <el-table-column prop="created_time" label="创建时间" width="170"></el-table-column>
            </el-table>
            <div class="block" style="float:left">
                <el-pagination  @size-change="handleSizeChange_R" @current-change="handleCurrentChange_R" :current-page="pageNum_R"
                                :page-sizes="[10, 20, 50]" :page-size="pageNums_R" :total="reportList.count"
                                layout="total, sizes, prev, pager, next, jumper">
                </el-pagination>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="reportVisible = false">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="克隆任务" :visible.sync="cloneVisible" width="40%">
            <el-form class="demo-form-inline">
                <el-col :span="24">
                    <el-form-item required>
                        <el-input v-model.trim="clonePlan.title" style="width:100%">
                            <template slot="prepend">新测试任务名称</template>
                        </el-input>
                    </el-form-item>
                </el-col>
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
    import { FilterProject, FilterVersion, FilterModule } from '@/common/index';
    import { getProjectList } from "@/api/project";
    import { getPlanList, getPlanDetail, updatePlan } from "@/api/performance";
    import { deletePlan,clonePerfPlan,historyReport,planProgress} from "@/api/performance";
    import { runPlan, stopPlan, getSetup } from "@/api/performance";
    import { openFile } from "@/api/others";
    import moment from "moment";
    const rootPath = process.env.BASE_API;

    export default {
        name: "perfTaskPlan",
        components: {AdvanceFilter, TableOperator},
        data() {
            return {
                form2: {
                    project_id: "",
                    title: "",
                    status: "",
                    id: "",
                    executor: "",
                    created_time: ""
                },
                perfTaskPlan: {
                    page_no: 1,
                    page_size: 20,
                    count: 0,
                    programData: []
                },
                clonePlan: {
                    title: "",
                    id: ""
                },
                reportList: {
                    page_no: 1,
                    page_size: 10,
                    count: 0,
                    programData: []
                },
                currentRow: {},
                configVisible: false,
                reportVisible: false,
                cloneVisible: false,
                projectList: [],
                statusList: {},
                progressList: {},
                choosedPlanList: [],
                pageNum: 1,
                pageNums: 20,
                pageNums_R: 10,
                pageNum_R: 1,
                formLabelWidth: "100px",
                choosedSetup: [],
                setupList: [],
                email: "",
                cc: "",
                judgeProgerss: false,
                intervalId: true,
                operateArray: [
                    {label:'执行', click:this.handleRunPlan,disable: (row)=>{return [2,5,6].includes(this.statusList[row.id])}},
                    {label:'报告', click:this.getPerfReport},
                    {label:'执行详情', click:this.getPerfPlanDeta},
                    {label:'停止', type:"danger", click:this.handleStopPlan,
                        disable: (row)=>{return ![2,5,6].includes(this.statusList[row.id])},
                    },
                    {label:'编辑', click:this.updatePerfPlan},
                    {label:'克隆', click:this.cloneSelf},
                ],
                filterArray: [
                    {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject},
                    {key:'id',name:'ID',type:'input'},
                    {key:'title',name:'测试任务名称',type:'input'},
                    {key:'status',name:'运行状态',type:'select',optionList:[
                            {label:"待执行", value:'0'},
                            {label:"已完成", value:'1'},
                            {label:"执行中", value:'2'},
                            {label:"已停止", value:'3'},
                            {label:"执行异常", value:'4'},
                            {label:"正在执行Setup", value:'5'},
                        ]
                    },
                    {key:'executor',name:'修改人',type:'input'},
                ]
            };
        },
        mounted() {
            this.initList();
            this.getProject();
            this.intervalId = setInterval(() => {
                this.getPerfPlanProgress();
            }, 60000);
        },
        beforeDestroy() {
            clearInterval(this.intervalId);
        },
        methods: {
            initList() {
                let self = this;
                getPlanList({
                    page_no: this.pageNum,
                    page_size: this.pageNums,
                    created_time: this.form2.created_time,
                    executor: this.form2.executor,
                    project_id: this.form2.project_id,
                    title: this.form2.title,
                    status: this.form2.status,
                    id: this.form2.id
                }).then(function(response) {
                    self.perfTaskPlan = {
                        page_no: self.pageNum,
                        page_size: 20 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.tasks
                    };
                    self.getPerfPlanProgress();
                });
            },
            projectFormat: function(value) {
                if (value == undefined || this.projectList.length == 0) return "无";
                let tmp = this.projectList.filter(function(item) {
                    return item.id == value;
                });
                if (tmp.length > 0) {
                    return tmp[0].name;
                } else {
                    return "项目不存在";
                }
            },
            getProject() {
                let self = this;
                getProjectList().then(function(response) {
                    self.projectList = response.data.projects;
                }).catch(function(err) {});
            },
            getFilterProject(item){
                FilterProject(item)
            },
            handleSetSelectionChange(val) {
                this.choosedPlanList = val;
            },
            handleSizeChange(val) {
                this.pageNums = val;
                this.pageNum = 1;
                this.initList();
            },
            handleCurrentChange(val) {
                this.pageNum = val;
                this.initList();
            },
            statusTagType(status) {
                switch (status) {
                    case 0:
                        return "warning";
                    case 3:
                        return "info";
                    case 4:
                        return "danger";
                    default:
                        return "success";
                }
            },
            statusTagFormat(status) {
                switch (status) {
                    case 0:
                        return "待执行";
                    case 1:
                        return "已完成";
                    case 3:
                        return "已停止";
                    case 4:
                        return "执行异常";
                    case 5:
                        return '正在执行Setup'
                    default:
                        return status;
                }
            },
            addPerfPlan() {
                this.$router.push({
                    path: "/perf/addPerfPlan",
                    name: "addPerfPlan",
                });
                this.$store.dispatch('app/toggleChildNav', '/perf/perfTaskPlan')
            },
            deletePerfPlan() {
                if (this.choosedPlanList.length < 1) {
                    this.$message.error("请至少选择一个测试任务");
                    return;
                }

                let id = this.getIdFromList(this.choosedPlanList);
                let ref = this;
                this.$confirm("此操作将无法撤销, 是否继续?", "批量删除", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }).then(() => {
                    deletePlan(id[0],{
                        "ids":id
                    }).then(function(response) {
                        ref.$message.info(response.data.msg);
                        ref.initList();
                    }).catch(function(err) {});
                }).catch(() => {});
            },
            getIdFromList(list) {
                let tmp = [];
                list.forEach(function(item) {
                    tmp.push(item.id);
                });
                return tmp;
            },
            getPerfPlanDeta(self) {
                window.sessionStorage.setItem("detailSelf",JSON.stringify(self));
                this.$router.push({
                    path: "/perf/perfDetailList",
                    name: "perfDetailList",
                    params: {
                        dataObj: self
                    }
                });
                this.$store.dispatch('app/toggleChildNav', '/perf/perfTaskPlan')
            },
            updatePerfPlan(self) {
                this.$router.push({
                    path: "/perf/updatePerfPlan",
                    name: "updatePerfPlan",
                    params: {
                        dataObj: self,
                    }
                });
                this.$store.dispatch('app/toggleChildNav', '/perf/perfTaskPlan')
            },
            handleRunPlan(self) {
                this.currentRow = self;
                this.getSetup();
                this.configVisible = true;
            },
            runPerfPlan() {
                this.configVisible = false;
                let ref = this;
                let emailList = ref.email === "" ? [] : ref.email.split(",");
                let ccList = ref.cc === "" ? [] : ref.cc.split(",");
                let setup = {};
                this.choosedSetup&&this.choosedSetup.length&&(this.choosedSetup.map(item=>{
                    if(!setup[item]){
                        setup[item] = true
                    }
                }))
                runPlan({
                    id: ref.currentRow.id,
                    pre_task:setup,
                    email: emailList,
                    cc: ccList
                }).then(function(response) {
                    if (response.data.code === 0) {
                        ref.$message.success(response.data.msg);
                        ref.getPerfPlanProgress();
                        ref.choosedSetup = [];
                    } else {
                        ref.$message.error(response.data.msg);
                    }
                });
            },
            getSetup() {
                let self = this;
                getSetup().then(function(response) {
                    if (response.data.code === 0) {
                        self.setupList = response.data.setup;
                    } else {
                        self.$message.error(response.data.msg);
                    }
                });
            },
            getPerfPlanProgress() {
                let list = [];
                this.perfTaskPlan.programData.forEach(function(item) {
                    list.push(item.id);
                });
                if(list.length === 0){
                    return
                }
                let self = this;
                planProgress({ id: list }).then(function(response) {
                    for (var key in response.data) {
                        var set = response.data[key];
                        if (set.code == 0) {
                            if (set.status == 2) {
                                let tmp = (set.progress * 100).toFixed(2);
                                self.$set(self.progressList,key,{
                                    progress:parseFloat(tmp),
                                });
                            } else {
                                self.$set(self.progressList,key,{
                                    progress:0,
                                });
                            }
                            self.$set(self.statusList, key, set.status);
                        } else {
                            self.$set(self.progressList,key,{
                                progress:0,
                            });
                            self.$set(self.statusList, key, set.msg);
                        }
                    }

                });
            },
            cloneSelf(self) {
                this.currentRow = self;
                this.clonePlan.id = self.id;
                this.cloneVisible = true;
            },
            submitClone() {
                if (/^\d/.test(this.clonePlan.title)) {
                    return this.$message.error('任务名称不可以数字开头')
                }
                let ref = this;
                if (this.clonePlan.title === "") {
                    this.$notify.error("测试任务的名称不能为空！");
                } else {
                    clonePerfPlan(ref.clonePlan).then(function(response) {
                        if (response.data.code === 0) {
                            ref.$message.success("克隆成功！");
                            ref.cloneVisible = false;
                            ref.clonePlan = {
                                title: "",
                                id: ""
                            };
                            ref.initList();
                        } else {
                            ref.$message.error(response.data.msg);
                        }
                    });
                }
            },
            handleStopPlan(val) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '停止执行', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    stopPlan({
                        id: val.id,
                        mode: 2
                    }).then(function(response) {
                        if (response.data.code === 0) {
                            ref.$message.success(response.data.msg);
                        } else {
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function(err) {});
                }).catch(() => {});
            },
            getPerfReport(self) {
                this.currentRow = self;
                this.pageNums_R = 10;
                this.pageNum_R = 1;
                this.getPerfReportHistory(self.id);
            },
            getPerfReportHistory(id) {
                let ref = this;
                historyReport(id, {
                    page_no: ref.pageNum_R,
                    page_size: ref.pageNums_R
                }).then(function(response) {
                    if (response.data.code === 0) {
                        ref.reportList = {
                            page_no: ref.pageNum_R,
                            page_size: 20 || ref.pageNums_R,
                            count: Number(response.data.total),
                            programData: response.data.reports
                        };
                        ref.reportVisible = true;
                    } else {
                        ref.$message.error(response.data.msg);
                    }
                });
            },
            getReportPath(self) {
                let url = rootPath + "/common/report/" + self.report;
                this.openLink(url);
            },
            openLink(link) {
                let self = this;
                openFile(link).then(function(response) {
                    if (response.data.code === 3) {
                        self.$message.error(response.data.msg);
                    } else {
                        window.open(link);
                    }
                });
            },
            handleSizeChange_R(val) {
                this.pageNums_R = val;
                this.pageNum_R = 1;
                this.getPerfReportHistory(this.currentRow.id);
            },
            handleCurrentChange_R(val) {
                this.pageNum_R = val;
                this.getPerfReportHistory(this.currentRow.id);
            },
            seachCondition() {
                this.pageNum = 1;
                this.initList();
            }
        }
    };
</script>
<style scoped>
    .el-textarea.is-disabled .el-textarea__inner {
        color: #606266;
        border: none;
        width: 100%;
    }
    .block {
        float: right;
        margin-top: 15px;
    }
    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }
    ._caseStep {
        display: block;
        line-height: 20px;
        word-break: break-all;
        word-wrap: break-word;
        text-indent: 4em;
    }
    ._configTitle {
        font-size: 16px;
        margin: 10px 0;
    }
    ._configForm {
        margin-left: 10%;
        width: 80%;
    }
    .link-in-table {
        color: #0066cc;
        text-decoration: none;
    }
    .link-in-table:hover {
        color: #008489;
        text-decoration: underline;
    }
    .el-checkbox.is-bordered.el-checkbox--medium{
        margin-right: 10px;
    }
    .el-checkbox.is-bordered + .el-checkbox.is-bordered {
        margin: 0 10px 10px 0;
    }
</style>