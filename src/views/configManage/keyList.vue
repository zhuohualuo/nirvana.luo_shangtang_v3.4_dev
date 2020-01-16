<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' @click="addKey" icon="el-icon-plus">新 增</el-button>
            </div>
            <advance-filter :formData="form2" :filterArray="filterArray" @search="seachCondition"></advance-filter>
        </el-row>

        <el-row>
            <el-table :data="pageList.programData"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <!--<el-table-column show-overflow-tooltip prop="id" label="id"></el-table-column>-->
                <el-table-column type="index" width="55" label="序号"></el-table-column>
                <el-table-column show-overflow-tooltip prop="name" label="参数名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="project" label="项目"></el-table-column>
                <el-table-column show-overflow-tooltip prop="description" label="描述"></el-table-column>
                <el-table-column show-overflow-tooltip prop="created_time" label="创建日期" width="170" :formatter="dateFormat"></el-table-column>
                <!--<el-table-column show-overflow-tooltip prop="updated_time" label="修改日期" :formatter="dateFormat"></el-table-column>-->
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[20, 30, 50, 100, 150]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="pageList.count">
            </el-pagination>
        </div>

        <el-dialog title="新增参数" :visible.sync="dialogFormVisible">
            <el-form :model="form" ref="form">
                <el-form-item label="项目" :label-width="formLabelWidth" prop="project_id" :rules="{ required: true, message: '请选择项目', trigger: 'change' }">
                    <el-select v-model="form.project_id" auto-complete="off">
                        <el-option
                                v-for="(item,index) in projectList"
                                :label="item.name"
                                :value="item.id"
                                :key="index">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <config-table :tableColumn="tableColumn" :tableData="form.keys"></config-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveKey">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
    import AdvanceFilter from "../../components/AdvanceFilter/index";
    import TableOperator from "../../components/TableOperator/index";
    import ConfigTable from "../../components/ConfigTable/index";
    import { FilterProject, FilterVersion, FilterModule, FilterCaseType } from '@/common/index';
    import { getKeyList, createKey, deleteKey } from '@/api/config';
    import { getProjectList } from '@/api/project';
    import moment from 'moment' //引入moment化简时间

    export default {
        name: 'KeyList',
        components: {ConfigTable, TableOperator, AdvanceFilter},
        data() {
            return {
                form: {
                    project_id: '',
                    keys: [{name: '', description: ''}]
                },
                form2: {
                    project_id: '',
                    name: ''
                },
                projectList: [],
                formLabelWidth: '80px',
                pageNums: 20,//每页几条
                pageNum: 1, //当前是第几页
                dialogFormVisible: false,
                pageList: {
                    page_no: 1,//页面开始页码
                    page_size: 20,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                filterArray: [
                    {key:'project_id',name:'项目',type:'select',optionList:[],visible: this.getFilterProject},
                    {key:'name',name:'参数名称',type:'input'},
                ],
                operateArray: [
                    {label:'删除', type:"danger", click:this.deleteSelf1}
                ],
                tableColumn:[
                    {label:"名称",key:"name",type:"input",require:true},
                    {label:"描述",key:"description",type:"input"},
                ],
            }
        },

        computed: {
        },

        mounted() {
            this.getListByPage();
            this.getProject();
        },

        methods: {
            checkNull(item){
                if(!item.name){
                    this.$message.error("参数名称必填！");
                    return false
                }
                return true
            },
            checkRepeat(list){
                let obj = {};
                return list.reduce((cur, next) => {
                    if(obj[next.name]){
                        this.$message.error('参数'+next.name+'重复！')
                        return false
                    }
                    else{
                        obj[next.name] = true;
                        return true
                    }
                }, []) //设置cur默认类型为数组，并且初始值为空的数组
            },
            handleSizeChange(val) {
                this.pageNum = 1;
                this.pageNums = val;
                this.getListByPage();
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.getListByPage();
            },
            getListByPage() {
                let self = this;
                getKeyList({
                    project_id: self.form2.project_id,
                    name: self.form2.name,
                    page_no: self.pageNum,
                    page_size: self.pageNums,
                }).then(function (response) {
                    console.log(response)
                    self.pageList = {
                        page_no: self.pageNum,
                        page_size: 20 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.keys
                    }
                })
            },
            deleteSelf1(self) {
                let ref = this;
                let id = self.id;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteKey(id).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.$message.success("删除成功！");
                            ref.getListByPage();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
                    .catch(function (err) {
                    });
                }).catch(() => {})
            },
            saveKey() {
                let ref = this;
                if (ref.validateFormRule('form')
                    && ref.form.keys.every(this.checkNull)
                    && ref.checkRepeat(ref.form.keys)) {
                    createKey(ref.form).then(function (response) {
                        console.log(response)
                        if (response.data.code === 0) {
                            ref.$message.success("保存成功！");
                            ref.dialogFormVisible = false;
                            ref.getListByPage();
                            ref.resetForm();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    })
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
            addKey(){
                this.resetForm();
                this.dialogFormVisible = true;
            },
            resetForm()
            {
                if(this.$refs["form"] !== undefined){
                    this.$refs["form"].resetFields();
                }
                this.form = {
                    id: 0,
                    project_id: '',
                    keys: [{name: '', description: ''}]
                }
            },
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            getProject(){
                let self = this;
                getProjectList().then(function (response) {
                    // console.log(response)
                    self.projectList = response.data.projects;
                }).catch(function (err) {
                });
            },
            getFilterProject(item){
                FilterProject(item)
            },
            seachCondition() {
                this.pageNum = 1;
                this.getListByPage();
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
</style>
