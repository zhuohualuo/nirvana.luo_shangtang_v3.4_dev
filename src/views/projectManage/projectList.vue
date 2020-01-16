<template>
    <div id="content">
        <el-row>
            <div class="_left">
                <el-button type="primary" size='small' @click="addProject" icon="el-icon-plus">新 增</el-button>
            </div>
        </el-row>

        <el-row>
            <el-table :data="List.programData"
                      height="680" border class='_table' header-cell-class-name="_table-head">
                <!--<el-table-column show-overflow-tooltip prop="id" label="id"></el-table-column>-->
                <el-table-column type="index" label="序号" width="70"></el-table-column>
                <el-table-column show-overflow-tooltip prop="name" label="项目名称"></el-table-column>
                <el-table-column show-overflow-tooltip prop="description" label="项目描述"></el-table-column>
                <el-table-column show-overflow-tooltip prop="owner" label="创建人"></el-table-column>
                <el-table-column show-overflow-tooltip prop="created_time" label="创建日期" :formatter="dateFormat"></el-table-column>
                <el-table-column show-overflow-tooltip prop="updated_time" label="修改日期" :formatter="dateFormat"></el-table-column>
                <table-operator :operateArray="operateArray"></table-operator>
            </el-table>
        </el-row>

        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNum"
                           :page-sizes="[10, 15, 20, 50, 100]"
                           :page-size="pageNums" layout="total, sizes, prev, pager, next, jumper"
                           :total="List.count">
            </el-pagination>
        </div>

        <el-dialog :title=" isEdit?'编辑项目':'新增项目'" :visible.sync="dialogFormVisible" width="35%">
            <el-form :model="form" :rules="formRule" ref="form">
                <el-form-item label="项目名称" :label-width="formLabelWidth" prop="name">
                    <el-input v-model.trim="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="项目描述" :label-width="formLabelWidth" prop="description">
                    <el-input v-model.trim="form.description" type="textarea" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveprojectManage">保 存</el-button>
            </div>
        </el-dialog>


    </div>
</template>
<script>
    import TableOperator from "../../components/TableOperator/index";
    import { getProjectList, createProject, updateProject, deleteProject } from '@/api/project';
    import moment from 'moment'; //引入moment格式化时间

    export default {
        name: 'projectList',
        components: {TableOperator},
        data() {
            return {
                isEdit:false,
                form: {
                    id: '',
                    name: '',
                    description: '',
                    owner: ''
                },
                pageNums: 10,//每页几条
                pageNum: 1, //当前是第几页
                formLabelWidth: '80px',
                dialogFormVisible: false,
                List: {
                    page_no: 1,//页面开始页码
                    page_size: 10,//每页条数
                    count: 0,//总数目
                    programData: [] //返回来的数据(因为页数和返回的内容是有关系的所以需要放进来)
                },
                formRule: {
                    name: [
                        { required: true, message: '请输入项目名称', trigger: 'blur' },
                        { max: 16, message: '项目名称不能超过16个字符', trigger: 'blur' }
                    ],
                    description: [
                        { max: 255, message: '描述不能超过255个字符', trigger: 'blur' }
                    ]
                },
                operateArray: [
                    {label:'编辑', click:this.updateSelf1},
                    {label:'删除', type:"danger", click:this.deleteSelf1}
                ],
            }
        },
        computed: {
        },
        mounted() {
            this.initList();
        },
        methods: {
            handleSizeChange(val) {
                this.pageNum = 1;
                this.pageNums = val;
                this.initList();
            },
            handleCurrentChange(val) {//改变页码
                this.pageNum = val;
                this.initList();
            },
            initList(){
                let self = this;
                getProjectList({
                    page_no: self.pageNum,
                    page_size: self.pageNums
                }).then(function (response) {
                    self.List = {
                        page_no: self.pageNum,
                        page_size: 10 || self.pageNums,
                        count: response.data.total,
                        programData: response.data.projects
                    }
                }).catch(function (err) {
                });
            },
            //时间格式化
            dateFormat(row, column) {
                let date = row[column.property];
                if (date === undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            deleteSelf1(self) {
                let ref=this;
                this.$confirm('此操作将无法撤销, 是否继续?', '删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=> {
                    deleteProject(self.id).then(function (response) {
                        console.log(response.data);
                        if (response.data.code === 0) {
                            ref.$message.success("删除成功！即将刷新页面...");
                            ref.refresh();
                        }
                        else {
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function (err) {
                    })
                }).catch(() => {})
            },
            updateSelf1(self) {
                this.isEdit = true
                if(this.$refs["form"] != undefined){
                    this.$refs["form"].resetFields();
                }
                this.form.id = self.id;
                this.form.name = self.name;
                this.form.description = self.description;
                this.form.owner = self.owner;
                this.dialogFormVisible = true;
            },
            addProject(){
                this.isEdit = false
                this.dialogFormVisible = true;
                this.resetForm();
            },
            saveprojectManage(){
                let ref=this;
                if (!ref.validateFormRule('form')) {
                    return false;
                }
                if(this.form.id > 0){
                    updateProject(this.form.id, {
                        name: this.form.name,
                        description: this.form.description,
                        owner: this.form.owner
                    }).then(function (response) {
                        console.log(response)
                        if(response.data.code===0){
                            ref.$message.success("保存成功！");
                            ref.dialogFormVisible = false;
                            ref.initList();
                        }
                        else{
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
                }else{
                    createProject({
                        name: this.form.name,
                        description: this.form.description,
                        owner: this.form.owner
                    }).then(function (response) {
                        if(response.data.code===0){
                            ref.dialogFormVisible = false;
                            ref.$message.success("保存成功！即将刷新页面...");
                            ref.refresh();
                        }
                        else{
                            ref.$message.error(response.data.msg);
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
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
            resetForm(){
                if(this.$refs["form"] != undefined){
                    this.$refs["form"].resetFields();
                    this.form = {
                        id: '',
                        name: '',
                        description: '',
                        owner: ''
                    }
                }
            },
            refresh(){
                setTimeout(() => {
                    location.reload();
                }, 1000)
            }
        }
    }
</script>
<style scoped>
    .block {
        float: right;
        margin-top: 15px;
    }
</style>
