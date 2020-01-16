<template>
    <div class="content">
        <el-row>
            <el-form :inline="true" class="_bottom0 demo-form-inline">
                <el-form-item>
                    <el-select v-model="filter.type" size="small" style="width: 150px" @change="seachCondition">
                        <el-option v-for="(item,index) in typeEnum" :value="index" :key="index" :label="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filter.project_id" size="small" clearable placeholder="项目" @change="seachCondition">
                        <el-option v-for="item in projectList" :value="item.id" :key="item.id" :label="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filter.status" size="small" clearable placeholder="状态" style="width: 120px" @change="seachCondition">
                        <el-option v-for="(item,index) in statusEnum" :value="index" :key="index" :label="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="filter.title" size="small" clearable placeholder="任务名称" @change="seachCondition"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size='small' @click="addTask">新建任务</el-button>
                </el-form-item>
                <!--<el-form-item>-->
                    <!--<el-button type="danger" size='small' @click="">批量删除</el-button>-->
                <!--</el-form-item>-->
            </el-form>
        </el-row>
        <el-row>
            <el-col :span="10">
                <el-table :data="pageList.programData" ref="table"
                          height="680" border class='_table' header-cell-class-name="_table-head"
                          @row-click="clickTask">
                    <el-table-column type="index" width="70" label="序号"></el-table-column>
                    <el-table-column show-overflow-tooltip prop="title" label="任务名称"></el-table-column>
                    <el-table-column prop="operation" label="操作" width="90">
                        <template slot-scope='props'>
                            <el-button type='text' @click='deleteTask(props.row)' style="color:#F56C6C;text-decoration:underline">删 除</el-button>
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
            </el-col>
            <el-col :span="1">
                <hr style="width: 1px;height: 700px;border: none;background-color: #E6E6E6;"/>
            </el-col>
            <el-col :span="12" v-if="!noData">
                <el-card style="margin-top: 15px" :header="currentRow.title">
                    <el-form :model="currentRow" ref="form" :rules="formRule" style="height: 590px;overflow: auto">
                        <el-row>
                            <el-col :span="8">
                                <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id">
                                    <el-select v-model="currentRow.project_id" :disabled="name!==this.currentRow.owner">
                                        <el-option v-for="item in projectList" :value="item.id" :key="item.id" :label="item.name"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="7">
                                <el-form-item label="状态" :label-width="formLabelWidth" prop="status">
                                    <el-select v-model="currentRow.status">
                                        <el-option v-for="(item,index) in statusEnum" :value="index" :key="index" :label="item"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="7">
                                <el-form-item label="创建人" :label-width="formLabelWidth" prop="owner">
                                    <el-tag>{{currentRow.owner}}</el-tag>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="8">
                                <el-form-item label="任务负责人" :label-width="formLabelWidth" prop="member">
                                    <el-input v-model="currentRow.member" auto-complete="off" :disabled="name!==this.currentRow.owner"
                                              placeholder="请输入任务负责人"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="14">
                                <el-form-item label="负责人邮箱" :label-width="formLabelWidth" prop="email">
                                    <el-input v-model="currentRow.email" auto-complete="off" :disabled="name!==this.currentRow.owner"
                                              placeholder="请输入负责人邮箱"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="22">
                                <el-form-item label="测试模块" :label-width="formLabelWidth" prop="test_module">
                                    <el-input v-model="currentRow.task.test_module" type="textarea" :autosize="{ minRows: 1, maxRows: 2}"
                                              placeholder="描述被测对象">
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="测试范围" :label-width="formLabelWidth" prop="test_scope">
                                    <el-input v-model="currentRow.task.test_scope" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
                                              placeholder="先了解历史版本中哪些小模块出现的故障比较多，然后思考为什么会有这么多故障，是不是测试覆盖不全导致的，确定一些怀疑测试不全的小模块作为探索性测试的重点">
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="测试时间" :label-width="formLabelWidth" prop="owner">
                                    <el-date-picker
                                            v-model="currentDatepicker"
                                            style="width: 400px"
                                            type="daterange"
                                            range-separator="至"
                                            start-placeholder="开始日期"
                                            end-placeholder="结束日期"
                                            value-format="yyyy-MM-dd">
                                    </el-date-picker>
                                </el-form-item>
                                <el-form-item label="测试思路" :label-width="formLabelWidth" prop="test_thinking">
                                    <el-input v-model="currentRow.task.test_thinking" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
                                              placeholder="针对某个场景或者功能，思考一些testlink上面没有覆盖到的一些测试点，要测试什么东西，要怎么测试，记录下来">
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="测试结果" :label-width="formLabelWidth" prop="test_result">
                                    <el-input v-model="currentRow.task.test_result" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
                                              placeholder="执行测试，并如实记录测试的结果，在测试过程中可以进行发散，针对发散的点进行扩展测试">
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="提交测试单" :label-width="formLabelWidth" prop="trouble_ticket">
                                    <el-input v-model="currentRow.task.trouble_ticket" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
                                              placeholder="测试过程中如果有发现故障，提交的故障单">
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="测试小结" :label-width="formLabelWidth" prop="test_summary">
                                    <el-input v-model="currentRow.task.test_summary" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
                                              placeholder="经过多长时间的测试，发现了多少个故障单，补充了多少个测试用例…">
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-card>
                <div class="card-footer">
                    <el-button type="primary" @click="editTask">确认修改</el-button>
                </div>
            </el-col>
        </el-row>

        <el-dialog title="新建任务" :visible.sync="dialogFormVisible">
            <el-form :model="form" ref="newform" :rules="formRule" style="height: 555px;overflow: auto">
                <el-row>
                    <el-col :span="22">
                        <el-form-item label="任务名称" :label-width="formLabelWidth" prop="title">
                            <el-input v-model="form.title" auto-complete="off" placeholder="请输入任务名称"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id">
                            <el-select v-model="form.project_id">
                                <el-option v-for="item in projectList" :value="item.id" :key="item.id" :label="item.name"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="14">
                        <el-form-item label="状态" :label-width="formLabelWidth" prop="status">
                            <el-select v-model="form.status">
                                <el-option v-for="(item,index) in statusEnum" :value="index" :key="index" :label="item"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <el-form-item label="任务负责人" :label-width="formLabelWidth" prop="member">
                            <el-input v-model="form.member" auto-complete="off" placeholder="请输入任务负责人"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="14">
                        <el-form-item label="负责人邮箱" :label-width="formLabelWidth" prop="email">
                            <el-input v-model="form.email" auto-complete="off" placeholder="请输入负责人邮箱"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="22">
                        <el-form-item label="测试模块" :label-width="formLabelWidth" prop="test_module">
                            <el-input v-model="form.task.test_module" type="textarea" :autosize="{ minRows: 1, maxRows: 2}"
                                      placeholder="描述被测对象">
                            </el-input>
                        </el-form-item>
                        <el-form-item label="测试范围" :label-width="formLabelWidth" prop="test_scope">
                            <el-input v-model="form.task.test_scope" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
                                      placeholder="先了解历史版本中哪些小模块出现的故障比较多，然后思考为什么会有这么多故障，是不是测试覆盖不全导致的，确定一些怀疑测试不全的小模块作为探索性测试的重点">
                            </el-input>
                        </el-form-item>
                        <el-form-item label="测试时间" :label-width="formLabelWidth" prop="owner">
                            <el-date-picker
                                    v-model="newDatepicker"
                                    style="width: 400px"
                                    type="daterange"
                                    range-separator="至"
                                    start-placeholder="开始日期"
                                    end-placeholder="结束日期"
                                    value-format="yyyy-MM-dd">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label="测试思路" :label-width="formLabelWidth" prop="test_thinking">
                            <el-input v-model="form.task.test_thinking" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
                                      placeholder="针对某个场景或者功能，思考一些testlink上面没有覆盖到的一些测试点，要测试什么东西，要怎么测试，记录下来">
                            </el-input>
                        </el-form-item>
                        <el-form-item label="测试结果" :label-width="formLabelWidth" prop="test_result">
                            <el-input v-model="form.task.test_result" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
                                      placeholder="执行测试，并如实记录测试的结果，在测试过程中可以进行发散，针对发散的点进行扩展测试">
                            </el-input>
                        </el-form-item>
                        <el-form-item label="提交测试单" :label-width="formLabelWidth" prop="trouble_ticket">
                            <el-input v-model="form.task.trouble_ticket" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
                                      placeholder="测试过程中如果有发现故障，提交的故障单">
                            </el-input>
                        </el-form-item>
                        <el-form-item label="测试小结" :label-width="formLabelWidth" prop="test_summary">
                            <el-input v-model="form.task.test_summary" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"
                                      placeholder="经过多长时间的测试，发现了多少个故障单，补充了多少个测试用例…">
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveTask">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import { getProjectList, getVersionList, getModuleList } from '@/api/project';
    import { getFreeTaskList, addFreeTask, editFreeTask, delFreeTask } from '@/api/others';

    export default {
        name: "exploreTest",

        data() {
            return {
                filter: {
                    type: 0,
                    project_id: '',
                    status: '',
                    title: ''
                },
                form: {
                    project_id: '',
                    status: 0,
                    title: '',
                    email: '',
                    member: '',
                    task: {
                        test_module: '',
                        test_time: '',
                        test_scope: '',
                        test_thinking: '',
                        test_result: '',
                        trouble_ticket: '',
                        test_summary: ''
                    }
                },
                newDatepicker: [],
                currentDatepicker: [],
                typeEnum: ["All Tasks", "Created By Me", "Assigned To Me"],
                statusEnum: ["ToDo", "Processing", "Done"],
                projectList: [],
                memberList: [],
                pageNums: 10,//每页几条
                pageNum: 1, //当前是第几页
                formLabelWidth: '100px',
                pageList: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                currentRow: {
                    project_id: '',
                    status: 0,
                    title: '',
                    owner: '',
                    member: '',
                    email: '',
                    task: {
                        test_module: '',
                        test_time: '',
                        test_scope: '',
                        test_thinking: '',
                        test_result: '',
                        trouble_ticket: '',
                        test_summary: ''
                    }
                },
                dialogFormVisible: false,
                formRule: {
                    project_id: [{ required: true, message: '请选择项目', trigger: 'change' }],
                    title: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
                    member: [{ required: true, message: '请输入任务负责人', trigger: 'blur' }],
                    email: [{ required: true, message: '请输入负责人邮箱', trigger: 'blur' }],
                }
            }
        },
        computed: {
            ...mapGetters([
                'name'
            ]),
            noData: function(){
                return this.pageList.programData.length === 0;
            }
        },
        mounted() {
            this.initList();
            this.getProject();
        },
        methods: {
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    self.projectList = response.data.projects
                }).catch(function (err) {
                });
            },
            initList(){
                let self = this;
                getFreeTaskList({
                    page_no: this.pageNum,
                    page_size: this.pageNums,
                    type: this.filter.type,
                    project_id: this.filter.project_id,
                    status: this.filter.status,
                    title: this.filter.title
                }).then(function(response) {
                    console.log(response)
                    if(response.data.code === 0){
                        self.pageList = {
                            page_no: self.pageNum,
                            page_size: self.pageNums || 10,
                            count: response.data.total,
                            programData: response.data.tasks
                        }
                        self.clickTask(response.data.tasks[0])
                    }
                    else{
                        self.$message.error(response.data.msg)
                    }
                })
            },
            clickTask(row){
                if(!row){
                    return false;
                }
                let tmp = JSON.parse(JSON.stringify(row));
                tmp.task = JSON.parse(tmp.task);
                this.currentRow = tmp;
                if(this.currentRow.task.test_time){
                    this.currentDatepicker = this.currentRow.task.test_time.split(",");
                }
                this.$nextTick(()=>{
                    this.$refs["table"].setCurrentRow(row);
                })
            },
            addTask(){
                this.resetNewform();
                this.dialogFormVisible = true;
            },
            saveTask(){
                let ref = this;
                if(this.validateFormRule("newform")){
                    if(this.newDatepicker.length > 0){
                        this.form.task.test_time = this.newDatepicker.join(",");
                    }
                    addFreeTask(this.form).then(function (response) {
                        console.log(response.data);
                        if (response.data.code === 0) {
                            ref.$message.success("保存成功！");
                            ref.initList();
                            ref.dialogFormVisible = false;
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function (err) {
                    })
                }
            },
            editTask(){
                console.log("this.currentRow",this.currentRow)
                let ref = this;
                if(ref.validateFormRule("form")){
                    if(this.currentDatepicker.length > 0){
                        this.currentRow.task.test_time = this.currentDatepicker.join(",");
                    }
                    editFreeTask(ref.currentRow.id, ref.currentRow).then(function (response) {
                        console.log(response.data);
                        if (response.data.code === 0) {
                            ref.$message.success("保存成功！");
                            ref.$refs["form"].clearValidate();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function (err) {
                    })
                }
            },
            deleteTask(self) {
                let ref = this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    delFreeTask(self.id).then(function (response) {
                        console.log(response.data);
                        if (response.data.code === 0) {
                            ref.$message.success("删除成功！");
                            ref.initList();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function (err) {
                    })
                }).catch(() => {})
            },
            handleSizeChange(val) {
                this.pageNum = 1;
                this.pageNums = val;
                this.initList();
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.initList();
            },
            seachCondition() {
                this.pageNum = 1;
                this.initList();
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
            resetNewform() {
                if (this.$refs["newform"] != undefined) {
                    this.$refs["newform"].clearValidate();
                    this.form = {
                        project_id: '',
                        status: 0,
                        title: '',
                        member: '',
                        task: {
                            test_module: '',
                            test_time: '',
                            test_scope: '',
                            test_thinking: '',
                            test_result: '',
                            trouble_ticket: '',
                            test_summary: ''
                        }
                    }
                }
            }
        }
    }
</script>

<style scoped>
    .block {
        float: right;
        margin-top: 5px;
        margin-bottom: 10px;
    }

    .el-tag + .el-tag {
        margin-left: 10px;
        margin-top: 8px;
    }

    .card-footer{
        display: block;
        float:right;
        margin-top: 10px;
    }
</style>
