<template>
    <div id="content">
        <el-form style="margin-left: 10%;width: 80%">
            <el-row>
                <el-col :span="10">
                    <el-form-item label="任务名称">
                        <div class="_view">
                            <span style="padding: 0 15px">{{task.title}}</span>
                        </div>
                    </el-form-item>
                </el-col>
                <el-col :span="6" :offset="1">
                    <el-form-item label="项目版本">
                        <div class="_view">
                            <span style="padding: 0 15px">{{task.project}} - {{task.version}}</span>
                        </div>
                    </el-form-item>
                </el-col>
                <el-col :span="4" :offset="1">
                    <el-form-item label="优先级">
                        <div class="_view">
                            <span style="padding: 0 15px">{{priorityFormat(task)}}</span>
                        </div>
                    </el-form-item>
                </el-col>
                <el-col :span="22">
                    <el-form-item label="任务说明">
                        <div class="_view">
                            <span style="padding: 0 15px">{{task.description}}</span>
                        </div>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <el-tabs type="border-card" style="margin-left: 5%;width: 85%;height: 650px" tab-position="left">
            <template v-for="(item, index) in subTask">
                <el-tab-pane :label="index">
                    <div class="_right" style="margin-bottom: 5px">
                        <el-select v-model="result"
                                   placeholder="筛选结果" clearable
                                   size="mini" style="width: 100px"
                                   @change="filterSub(index)">
                            <el-option label="未执行" value="undo"></el-option>
                            <el-option label="通过" value="pass"></el-option>
                            <el-option label="失败" value="fail"></el-option>
                        </el-select>
                        <span style="margin-left: 10px;font-size: 12px">共{{item.length}}条</span>
                    </div>
                    <el-table :data="item"
                              height="590" border class='_table' header-cell-class-name="_table-head"
                              :row-key="getRowKeys" :expand-row-keys="expands"
                              @expand-change="expandChange">
                        <el-table-column show-overflow-tooltip prop="case_id" label="ID" width="50"></el-table-column>
                        <el-table-column show-overflow-tooltip prop="title" label="用例名称"></el-table-column>
                        <el-table-column type="expand" label="内容" width="50">
                            <template slot-scope="scope">
                                <div v-if="expandRow.prepose">
                                    <span style="font-weight: bold">前置条件 : </span>
                                    <span class="_caseStep">{{expandRow.prepose}}</span>
                                </div>
                                <div v-if="expandRow.steps">
                                    <span style="font-weight: bold">测试步骤 : </span>
                                    <span class="_caseStep">{{expandRow.steps}}</span>
                                </div>
                                <div v-if="expandRow.expect">
                                    <span style="font-weight: bold">预期结果 : </span>
                                    <span class="_caseStep">{{expandRow.expect}}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column show-overflow-tooltip prop="priority" label="优先级" :formatter="priorityFormat" width="70"></el-table-column>
                        <el-table-column show-overflow-tooltip prop="updated_time" label="执行时间" width="170"></el-table-column>
                        <el-table-column label="执行结果" width="150">
                            <template slot-scope="scope">
                                <el-select v-model="scope.row.result"
                                           v-if="name===index"
                                           size="mini" style="width: 90px"
                                           @change="updateResult(scope.row, index)">
                                    <el-option label="未执行" value="undo"></el-option>
                                    <el-option label="通过" value="pass"></el-option>
                                    <el-option label="失败" value="fail"></el-option>
                                </el-select>
                                <span v-else>{{resultFormat(scope.row.result)}}</span>
                                <a v-if="scope.row.result==='fail'" title="点击打开JIRA" style="display: block;float: right;color: #409EFF"
                                   href="http://jira.sensetime.com/secure/Dashboard.jspa" target="_blank">
                                    <svg-icon icon-class="jira"></svg-icon>
                                </a>
                            </template>
                        </el-table-column>
                        <el-table-column label="备注">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.remarks"
                                          v-if="name===index"
                                          auto-complete="off" size="mini"
                                          @change="updateResult(scope.row, index)"></el-input>
                                <span v-else>{{scope.row.remarks}}</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </template>
        </el-tabs>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import { getManualCaseList, getManualTaskResult, updateManualTaskResult } from '@/api/manualCase';

    export default {
        name: "subTaskList",
        data() {
            return {
                plan:{},
                filter: {},
                task: {},
                subTask: {},
                expands: [],
                expandRow: {},
                getRowKeys(row) {
                    return row.case_id;
                },
                result: ''
            }
        },
        computed: {
            ...mapGetters([
                'name'
            ])
        },
        mounted() {
            this.plan=JSON.parse(window.sessionStorage.getItem("childrenSubTaskList"));
            this.getParams();
            this.initList();
        },
        beforeDestroy () {
            this.$store.dispatch('app/toggleParentNav')
        },
        methods: {
            goToList() {
                this.$router.push({
                    name: 'manualTaskList',
                    params: {
                        filter: this.filter
                    }
                })
            },
            getParams() {
                // 取到路由带过来的参数
                console.log("$route.params.dataObj", this.$route.params.dataObj)
                console.log("$route.params.filter", this.$route.params.filter)
                if(this.$route.params.dataObj){
                    this.task = this.$route.params.dataObj
                }
                else if(JSON.stringify(this.plan)!='{}'){
                    this.task = this.plan
                }
                if (this.$route.params.filter) {
                    this.filter = this.$route.params.filter;
                }
            },
            filterSub(name){
                this.initList({
                    owner: name,
                    result: this.result
                })
            },
            initList(params){
                let self = this;
                getManualTaskResult(self.task.id, params).then(function (response) {
                    self.subTask = response.data.case_result
                }).catch(function (err) {
                });
            },
            expandChange(row){
                let temp = this.expands;
                this.expands = [];
                this.expands.push(row.case_id);
                if(temp.length === 1 && temp[0] === row.case_id){     // 收起展开行
                    this.expands = [];
                    this.expandRow = {};
                }
                else{
                    let self = this;
                    getManualCaseList({id: row.case_id}).then(function (response) {
                        self.expandRow = response.data.case_maintenance[0];
                    }).catch(function (err) {
                    });
                }
            },
            updateResult(row, owner){
                let self = this;
                updateManualTaskResult(self.task.id, Object.assign({owner: owner}, row)).then(function (response) {
                    if(response.data.code === 3){
                        self.$message.error(response.data.msg)
                    }
                }).catch(function (err) {
                });
            },
            priorityFormat(row, column){
                let priority = row.priority;
                if (priority === undefined || priority === null) {
                    return "";
                }
                switch(priority){
                    case 1:
                        return "高";
                    case 2:
                        return "中";
                    case 3:
                        return "低";
                    default:
                        return "";
                }
            },
            resultFormat(result){
                switch(result){
                    case 'undo':
                        return "未执行";
                    case 'pass':
                        return "通过";
                    case 'fail':
                        return "失败";
                    default:
                        return "";
                }
            },
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

    ._view {
        border: 1px solid #dcdfe6;
        overflow: hidden;
    }

    ._caseStep{
        display:block;
        line-height: 20px;
        word-break: break-all;
        word-wrap: break-word;
        text-indent:4em;
    }
</style>