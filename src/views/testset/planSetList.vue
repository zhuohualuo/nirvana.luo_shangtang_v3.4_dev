<template>
    <div id="content">
        <el-row>
            <span style="line-height:24px;font-size: 18px">测试任务：{{plan.title}}</span>
        </el-row>
        <el-row>
            <el-table :data="planSetList" v-loading="loading"
                      height="730" border class='_table' header-cell-class-name="_table-head">
                <el-table-column prop="id" label="测试集ID" width="80"></el-table-column>
                <el-table-column show-overflow-tooltip prop="title" label="测试集名称"></el-table-column>
                <el-table-column show-overflow-tooltip label="项目版本" width="180">
                    <template slot-scope="scope">
                        <span>{{scope.row.project}}-{{scope.row.version}}</span>
                    </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip prop="type" label="类型" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip prop="config" label="配置项" width="150"></el-table-column>
                <el-table-column prop="progress" label="进度" width="180">
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

        <el-dialog title="日志" :visible.sync="caseLogVisible" width="45%">
            <div style="max-height: 500px; overflow:auto" class="caseLog">
                <el-collapse accordion style="max-width: 98%">
                    <template v-for="(item,index) in caseLog['steps']">
                        <div v-if="item.case" :key="index">
                            <div v-if="item.result == 'Fail'">
                                <span style="color: tomato; font-weight: bold">失败原因 : </span>
                                <span class="_caseStep">{{item.reason}}</span>
                            </div>
                            <div>
                                <span style="font-weight: bold">用例内容 : </span>
                                <span class="_caseStep">{{JSON.stringify(item.case)}}</span>
                            </div>
                        </div>
                        <el-collapse-item v-else :title="item.title" :key="index">
                            <div v-if="item.result == 'Fail'">
                                <span style="color: tomato; font-weight: bold">失败原因 : </span>
                                <span class="_caseStep" v-html="item.reason"></span>
                            </div>
                            <div v-if="item.link">
                                <span style="font-weight: bold">脚本日志: </span>
                                <a class="_caseStep link-in-table" @click="openLink(item.link)">{{item.link}}</a>
                            </div>
                            <div v-if="(item.title)&&(item.title.indexOf('Setup:') != -1)">
                                <span style="font-weight: bold">Steps : </span>
                                <span class="_caseStep">{{item.steps}}</span>
                            </div>
                            <div v-if="item.url">
                                <span style="font-weight: bold">URL : </span>
                                <span class="_caseStep">{{item.url}}</span>
                            </div>
                            <div v-if="item.req">
                                <span style="font-weight: bold">请求参数 : </span>
                                <span class="_caseStep">{{JSON.stringify(item.req)}}</span>
                            </div>
                            <div v-if="item.rsp">
                                <span style="font-weight: bold">响应结果 : </span>
                                <span class="_caseStep">{{JSON.stringify(item.rsp)}}</span>
                            </div>
                            <div v-if="item.expect">
                                <span style="font-weight: bold">预期结果 : </span>
                                <span class="_caseStep">{{JSON.stringify(item.expect)}}</span>
                            </div>
                        </el-collapse-item>
                    </template>
                </el-collapse>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" type="primary" @click="caseLogVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="执行详情" :visible.sync="detailVisible">
            <div v-if="currentRow.status===4">
                <el-tag type="danger" style="font-size: 18px">Trace Log</el-tag>
                <div style="margin: 0 10%; font-size: 18px">{{currentRow.tracelog}}</div>
            </div>
            <div v-else>
                <el-row>
                    <div class="_left" style="margin-top: 8px">
                        <span class="span-info">Total
                            <span style="font-size: 20px;margin-left: 2px">{{caseDetailList.total}}</span>
                        </span>
                        <span class="span-success" style="margin-left: 10px">Pass
                            <span style="font-size: 20px;margin-left: 2px">{{caseDetailList.pass}}</span>
                        </span>
                        <span class="span-danger" style="margin-left: 10px">Fail
                            <span style="font-size: 20px;margin-left: 2px">{{caseDetailList.fail}}</span>
                        </span>
                    </div>
                    <el-form :inline="true" class="_bottom0 demo-form-inline _right">
                        <el-form-item>
                            <el-input v-model="form2.case_name" size="mini" placeholder="请输入名称" clearable></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="form2.case_result" clearable size="mini" placeholder="请选择执行结果">
                                <el-option value="通过" label="通过"></el-option>
                                <el-option value="失败" label="失败"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" circle size='mini' @click="()=>{pageNum_S=1;getDetailByPage()}" icon="el-icon-search"></el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" size='mini' @click="getDetailByPage">刷 新</el-button>
                        </el-form-item>
                    </el-form>
                </el-row>
                <el-table :data="caseDetailList.programData" :row-class-name="tableRowClassName"
                          height="490" border class='_table' header-cell-class-name="_table-head">
                    <el-table-column type="index" label="序号"></el-table-column>
                    <el-table-column label="测试用例名称">
                        <template slot-scope='props'>
                            <span v-if="props.row.is_script===0">{{props.row.title}}</span>
                            <a v-if="props.row.is_script===1" class="link-in-table" @click="viewCodeOnline(props.row)">{{props.row.title}}</a>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="执行结果" width="120"></el-table-column>
                    <el-table-column label="日志" width="70">
                        <template slot-scope='props'>
                            <el-button type='text' @click='getCaseLog(props.row)' class="op-btm">查看</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column label="备注" width="70">
                        <template slot-scope='props'>
                            <el-button type='text' @click='remarkSetCase(props.row)' class="op-btm">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="block" style="float: left">
                    <el-pagination @size-change="handleSizeChange_S" @current-change="handleCurrentChange_S" :current-page="pageNum_S"
                                   :page-sizes="[20, 50, 100]"
                                   :page-size="pageNums_S" layout="total, sizes, prev, pager, next, jumper"
                                   :total="caseDetailList.count">
                    </el-pagination>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="detailVisible = false">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="备注" :visible.sync="remarkVisible" width="30%">
            <span>{{caseRemark.title}}</span>
            <el-input v-model="caseRemark.remark" type="textarea" style="overflow: auto;" key="remark" :autosize="{ minRows: 2, maxRows: 8 }"></el-input>
            <div slot="footer" class="dialog-footer">
                <el-button @click="remarkVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitRemark">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import { getTestsetLog, stopTestset} from '@/api/testset';
    import { remarkCase} from '@/api/case';
    import { getPlanSetProgress, getPlanSetDetail, getPlanSetReport } from '@/api/testPlan';
    import { openFile } from '@/api/others';
    import TableOperator from "../../components/TableOperator/index";
    const rootPath = process.env.BASE_API;

    export default {
        name: "planSetList",
        components: {TableOperator},
        data() {
            return{
                intervalId: true,
                plan: {},
                loading: true,
                remarkVisible: false,
                caseRemark: {
                    id: '',
                    title: '',
                    remark: ''
                },
                caseLog: [],
                caseLogVisible: false,
                form2: {
                    case_name: '',
                    case_result: '',
                },
                caseDetailList: {
                    page_no: 1,  //页面开始页码
                    page_size: 20,  //每页条数
                    count: 0,  //总数目，已执行用例总数
                    pass: 0, //通过数目
                    total: 0, //用例总数目
                    fail:0,  //失败数目
                    programData: [], //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                planSetList: [],
                pageNums_S: 20,//每页几条
                pageNum_S: 1, //当前是第几页
                detailVisible: false,
                reportList: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [], //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                currentRow: {},
                operateArray: [
                    {label:'执行详情', click:this.getSetDetails},
                    {label:'查看报告', click:this.getSetReport,disabled: (row)=>{return row.progress!==1}},
                    {label:'停止', type:"danger", click:this.handleStopSet, dropdown:true,
                        disable: (row)=>{return row.status!==2},
                        dropList:[
                            {label:'等待停止', command:1},
                            {label:'立即停止', command:2},
                        ]
                    },
                ],
            }
        },
        mounted() {
            //读取
            this.plan = JSON.parse(window.sessionStorage.getItem("objSelf"));
            this.getParams();
        },
        methods: {
            goToList(){
                this.$router.push({
                    path: '/autoTest/testPlanList',
                    name: 'testPlanList',
                })
            },
            getParams () {
                // 取到路由带过来的参数
                console.log("$route.params.dataObj",this.$route.params.dataObj)
                if(this.$route.params.dataObj){
                    this.plan = this.$route.params.dataObj;
                }
                this.getSetProgress(this.plan.id, this.plan.set_ids)
                this.intervalId = setInterval(() => {
                    this.getSetProgress(this.plan.id, this.plan.set_ids)
                }, 5000)

            },
            getSetProgress(collection_id, set_ids){
                this.loading = true;
                let self = this;
                getPlanSetProgress({
                    collection_id: collection_id,
                    set_ids: set_ids
                }).then(function (response) {
                    if(response.data.code === 0){
                        self.planSetList = response.data.result;
                        self.loading = false;
                    }
                    else{
                        self.$message.error(response.data.msg);
                    }
                })
            },
            getSetDetails(self) {
                this.pageNum_S = 1;
                this.currentRow = self;
                this.form2.case_name = '';
                this.form2.case_result = '';
                this.caseDetailList = {
                    count: 0,
                    pass: 0,
                    fail: 0,
                    total: 0,
                    programData: []
                }
                this.getDetailByPage();
                this.detailVisible = true;
            },
            handleStopSet(val, self){
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '停止执行', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    stopTestset({
                        collection_id: ref.plan.id,
                        set_id: [self.id],
                        choice: val
                    }).then(function (response) {
                        if(response.data.code === 0){
                            ref.$message.success(response.data.msg);
                            ref.getSetProgress(ref.plan.id, ref.plan.set_ids);
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function (err) {
                    });
                }).catch(() => {})
            },
            getSetReport(self){
                let ref = this;
                getPlanSetReport(self.id, {
                    collection_id: this.plan.id
                }).then((response)=>{
                    if(response.data.code === 0){
                        window.open(rootPath + '/common/report/' + response.data.path)
                    }
                    else{
                        ref.$message.error(response.data.msg)
                    }
                })
            },
            getCaseLog(self){
                let ref = this;
                getTestsetLog(this.currentRow.id, self.id).then(function(response){
                    if(response.data.code === 0){
                        ref.caseLog = response.data.result;
                        ref.caseLogVisible = true;
                    }
                    if(response.data.code === 3){
                        ref.$notify.error(response.data.msg);
                    }
                })
            },
            remarkSetCase(self){
                this.caseRemark = {
                    id: self.id,
                    title: self.title,
                    remark: self.remark
                };
                this.remarkVisible = true;
            },
            submitRemark(){
                let self = this;
                remarkCase(this.caseRemark).then((response)=>{
                    if(response.data.code !== 0){
                        self.$message.error(response.data.msg);
                    }
                    else{
                        self.remarkVisible = false;
                        self.getDetailByPage();
                    }
                })
            },
            getDetailByPage(){
                let self = this;
                getPlanSetDetail(self.plan.id, {
                    page_no: this.pageNum_S,
                    page_size: this.pageNums_S,
                    set_id: this.currentRow.id,
                    title: this.form2.case_name,
                    status: this.form2.case_result,
                }).then(function(response){
                    if(response.data.code === 0) {
                        self.caseDetailList  = {
                            page_no: self.pageNum_S,
                            page_size: 20 || self.pageNums_S,
                            count: response.data.total,
                            pass: response.data.pass,
                            fail: response.data.fail,
                            total: response.data.totalNum,
                            programData: response.data.cases
                        }
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                })
            },
            handleSizeChange_S(val) {
                this.pageNums_S = val;
                this.pageNum_S = 1;
                this.getDetailByPage();
            },
            handleCurrentChange_S(val) {//改变页码
                this.pageNum_S = val;
                this.getDetailByPage();
            },
            tableRowClassName({row, rowIndex}){
                if (row.title == '用例不存在') {
                    return 'warning-row';
                }
                return '';
            },
            statusTagFormat(status){
                switch(status){
                    case 0:
                        return "待执行";
                    case 1:
                        return "已完成";
                    case 3:
                        return "已停止";
                    case 4:
                        return "执行异常";
                    case 5:
                        return "正在执行Setup";
                    case 6:
                        return "正在执行TearDown";
                    default:
                        return status;
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
            openLink(link){
                let self = this;
                openFile(link).then(function(response){
                    if(response.data.code === 3){
                        self.$message.error(response.data.msg);
                    }
                    else{
                        window.open(link);
                    }
                })
            },
            viewCodeOnline(self){
                window.open("/static/codeOnline.html?id="+self.id, rootPath)
            },
        },
        beforeDestroy() {
            clearInterval(this.intervalId)
            this.$store.dispatch('app/toggleParentNav')
        },
    }
</script>

<style scoped>
    .el-table .warning-row {
        background: MistyRose;
    }

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

<style>
    .caseLog .el-collapse-item__header{
        height: inherit;
    }
</style>
