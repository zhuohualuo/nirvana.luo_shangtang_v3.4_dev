<template>
    <div id="content">
        <el-row>
            <span style="line-height:24px;font-size: 18px">测试任务：{{plan.title}}</span>
        </el-row>
        <el-row>
            <el-table :data="planSetList"  height="730" border class='_table' header-cell-class-name="_table-head">
                <el-table-column prop="id" label="测试集ID" width="80"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="测试集名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="project" label="项目" width="180"></el-table-column>
                <el-table-column show-overflow-tooltip prop="config" label="配置项" width="150"></el-table-column>
                <el-table-column show-overflow-tooltip prop="progress" label="运行进度" width="200">
                    <template slot-scope="scope">
                        <el-progress v-show="scope.row.status == 2" :stroke-width="8" :percentage="parseFloat((scope.row.progress*100).toFixed(2))"></el-progress>
                        <span v-show="scope.row.status != 2" :class="'span-'+statusTagType(scope.row.status)">{{statusTagFormat(scope.row.status)}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip label="开始/结束时间" width="300">
                    <template slot-scope="scope">
                        <span>{{scope.row.start_time}} - {{scope.row.end_time}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="duration" label="持续时长" width="120"></el-table-column>
                <table-operator :operateArray="operateArray" :width="280"></table-operator>
            </el-table>
        </el-row>
        <el-dialog title="报告列表" :visible.sync="reportVisible">
            <el-table :data="reportList.programData" height="490" border class='_table' header-cell-class-name="_table-head">
                <el-table-column label="报告名称">
                    <template slot-scope="props">
                        <a class="link-in-table" @click="getReportPath(props.row)">{{props.row.title}}</a>
                        <el-tag v-if="(pageNum_S===1)&&(props.$index===0)" type="danger" style="margin-left:10px">最新</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="pass_count" label="成功数" width="100"></el-table-column>
                <el-table-column prop="fail_count" label="失败数" width="100"></el-table-column>
                <el-table-column  prop="created_time" label="创建时间" width="170" :formatter="dateFormat"></el-table-column>
            </el-table>
            <div class="block">
                <el-pagination @size-change="handleSizeChange_S" @current-change="handleCurrentChange_S" :current-page="pageNum_S"
                               :page-sizes="[20, 30, 50]" :page-size="pageNums_S" :total="reportList.count"
                               layout="total, sizes, prev, pager, next, jumper">
                </el-pagination>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="reportVisible = false">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import TableOperator from "../../components/TableOperator/index";
    import { getPlanDetail, stopPerfTaskSet, getPerfTaskSetReport } from "@/api/performance";
    import { openFile } from "@/api/others";
    import moment from "moment";
    const rootPath = process.env.BASE_API;

    export default {
        name: "perfDetailList",
        components: {TableOperator},
        data() {
            return {
                reportList: {
                    page_no: 1,
                    page_size: 20,
                    count: 0,
                    programData: []
                },
                plan: {},
                planSetList: [],
                pageNums_S: 20,
                pageNum_S: 1,
                currentRow: {},
                reportVisible: false,
                statusList:{},
                progressList:{},
                intervalId: true,
                operateArray: [
                    {label:'跳过当前', type:'danger', click:(row)=>{this.handleStopSet(1,row)}, disable:(row)=>{return row.status!==2}},
                    {label:'立即停止', type:'danger', click:(row)=>{this.handleStopSet(2,row)}, disable:(row)=>{return row.status!==2}},
                    {label:'查看报告', click:this.getReportDetail, disabled:(row)=>{return row.progress!==1}},
                ],
            };
        },
        mounted() {
            this.getParams();
            this.intervalId=setInterval(()=>{
                this.getParams();
            },180000)
        },
        beforeDestroy() {
            clearInterval(this.intervalId);
            this.$store.dispatch('app/toggleParentNav');
        },
        created() {
            this.plan=JSON.parse(window.sessionStorage.getItem("detailSelf"))
        },
        methods: {
            goToList() {
                this.$router.push({
                    path: "/perf/perfTaskPlan",
                    name: "perfTaskPlan"
                });
            },
            getParams() {
                if (this.$route.params.dataObj) {
                    this.plan = this.$route.params.dataObj;
                }
                this.getPerfPlanDetail();
            },
            getPerfPlanDetail() {
                let self = this;
                getPlanDetail(this.plan.id).then(function(response) {
                    if (response.data.code === 0) {
                        self.planSetList = response.data.result;
                    } else {
                        self.$message.console.error(response.data.msg);
                    }
                });
            },
            handleStopSet(val, self) {
                let ref = this;
                this.$confirm(
                    val===1?"将跳过当前执行用例，执行下一项，此操作无法撤销，是否继续？":"将停止执行该测试集下所有用例，此操作无法撤销，是否继续？",
                    val===1?"跳过当前":"停止执行",
                    {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning"
                    }).then(() => {
                    stopPerfTaskSet({
                            collection_id: ref.plan.id,
                            set_id: self.id,
                            mode: val
                        }).then(function(response) {
                            if(response.data.code === 0){
                                ref.$message.success(response.data.msg);
                                ref.getPerfPlanDetail(ref.plan.id);
                            }
                            else {
                                ref.$message.error(response.data.msg);
                            }
                        });
                });
            },
            getReportDetail(self) {
                this.pageNums_S = 20;
                this.pageNum_S = 1;
                this.currentRow = self;
                this.getReportHistory();
            },
            getReportHistory() {
                let ref = this;
                getPerfTaskSetReport(ref.currentRow.id, {
                    collection_id: this.plan.id
                }).then(function (response) {
                    if (response.data.code === 0) {
                        window.open(rootPath + '/common/report/' + response.data.path)
                    } else {
                        ref.$message.error(response.data.msg);
                    }
                });
            },
            getReportPath(self) {
                let url = rootPath + "/common/report/" + self.report_path;
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
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined || date === null) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            handleSizeChange_S(val) {
                this.pageNums_S = val;
                this.pageNum_S = 1;
                this.getReportHistory();
            },
            handleCurrentChange_S(val) {
                this.pageNum_S = val;
                this.getReportHistory();
            },
            statusTagFormat(status) {
                switch (status) {
                    case 0:
                        return "待执行";
                    case 1:
                        return "已完成";
                    case 2:
                        return "执行中";
                    case 3:
                        return "已停止";
                    case 4:
                        return "执行异常";
                    case 5:
                        return '正在执行Setup';
                    default:
                        return  status;
                }
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
        }
    };
</script>
<style scoped>
    .block {
        float: left;
        margin-top: 15px;
    }
    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }
    .link-in-table{
        color: #0066cc;
        text-decoration: none;
    }
    .link-in-table:hover{
        color: #008489;
        text-decoration: underline;
    }
</style>
